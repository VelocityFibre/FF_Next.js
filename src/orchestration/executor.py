"""
Pipeline Executor - Core orchestration engine for ForgeFlow.

Manages agent execution with dependency resolution, parallel processing,
and comprehensive error handling.
"""

import asyncio
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Set
from uuid import UUID

import structlog

from ..agents.registry import get_registry
from ..agents.base import AgentInput
from .models import (
    PipelineRun, 
    AgentExecution, 
    ExecutionStatus, 
    PipelineStatus,
    OrchestrationConfig,
    PipelineResult
)
from .scheduler import AgentScheduler
from .monitor import PipelineMonitor
from .recovery import FailureRecovery
from .dependencies import DependencyManager

# Import WebSocket integration if available
try:
    from .websocket_integration import (
        broadcast_pipeline_started,
        broadcast_pipeline_completed,
        broadcast_agent_started,
        broadcast_agent_completed,
        broadcast_agent_failed,
        broadcast_progress_update
    )
    websocket_enabled = True
except ImportError:
    websocket_enabled = False

logger = structlog.get_logger()


class PipelineExecutor:
    """
    Advanced pipeline executor with dependency management and parallel execution.
    """
    
    def __init__(self, config: Optional[OrchestrationConfig] = None):
        self.config = config or OrchestrationConfig()
        self.scheduler = AgentScheduler(self.config)
        self.monitor = PipelineMonitor(self.config)
        self.recovery = FailureRecovery(self.config)
        self.dependency_manager = DependencyManager()
        
        # Execution tracking
        self.active_runs: Dict[UUID, PipelineRun] = {}
        self.execution_semaphore = asyncio.Semaphore(self.config.max_parallel_agents)
        
        # Pipeline control
        self.paused_pipelines: Set[UUID] = set()
        self.pause_events: Dict[UUID, asyncio.Event] = {}
        
        # Agent registry
        self.agent_registry = get_registry()
        
        # Performance metrics
        self.executor_metrics = {
            'total_pipelines_executed': 0,
            'successful_pipelines': 0,
            'failed_pipelines': 0,
            'average_pipeline_duration': 0.0,
            'total_agents_executed': 0,
            'parallel_efficiency': 0.0
        }
        
        logger.info(
            "pipeline_executor_initialized",
            max_parallel=self.config.max_parallel_agents,
            timeout=self.config.execution_timeout,
            components=['scheduler', 'monitor', 'recovery', 'dependency_manager']
        )
    
    async def create_pipeline_run(
        self,
        name: str,
        feature_brief: str,
        project_context: Optional[Dict[str, Any]] = None,
        agent_sequence: Optional[List[str]] = None,
        config: Optional[OrchestrationConfig] = None
    ) -> PipelineRun:
        """
        Create a new pipeline run with the specified agents.
        """
        run_config = config or self.config
        
        pipeline_run = PipelineRun(
            name=name,
            feature_brief=feature_brief,
            project_context=project_context or {},
            orchestration_config=run_config,
            max_parallel=run_config.max_parallel_agents
        )
        
        # Set up agent sequence (default: all agents in dependency order)
        if not agent_sequence:
            agent_sequence = ['planner', 'architect', 'coder', 'tester', 'reviewer']
        
        # Add executions with dependency chain
        previous_agent = None
        for agent_type in agent_sequence:
            depends_on = [previous_agent] if previous_agent else []
            execution = pipeline_run.add_execution(agent_type, depends_on)
            
            # Configure based on agent registry
            if agent_type in self.agent_registry.agents:
                agent_class = self.agent_registry.agents[agent_type]
                agent_instance = agent_class()
                execution.depends_on = agent_instance.dependencies
            
            previous_agent = agent_type
        
        self.active_runs[pipeline_run.id] = pipeline_run
        
        logger.info(
            "pipeline_run_created",
            run_id=str(pipeline_run.id),
            name=name,
            agents=agent_sequence,
            total_agents=pipeline_run.total_agents
        )
        
        return pipeline_run
    
    async def execute_pipeline(self, run_id: UUID) -> PipelineResult:
        """
        Execute a complete pipeline with advanced orchestration.
        """
        pipeline_run = self.active_runs.get(run_id)
        if not pipeline_run:
            raise ValueError(f"Pipeline run {run_id} not found")
        
        # Perform dependency analysis before execution
        dependency_analysis = await self.dependency_manager.analyze_pipeline_dependencies(pipeline_run)
        
        # Check for critical dependency issues
        if not dependency_analysis['validation']['valid']:
            logger.error(
                "pipeline_dependency_validation_failed",
                run_id=str(run_id),
                errors=dependency_analysis['validation']['errors']
            )
            pipeline_run.status = PipelineStatus.FAILURE
            return self._create_pipeline_result(pipeline_run)
        
        # Optimize execution order if enabled
        if self.config.enable_pipeline_optimization:
            pipeline_run.executions = self.dependency_manager.get_optimized_execution_order(
                pipeline_run.executions
            )
        
        logger.info(
            "pipeline_execution_started",
            run_id=str(run_id),
            name=pipeline_run.name,
            dependency_validation=dependency_analysis['validation']['valid'],
            parallelism_potential=dependency_analysis['parallelism']['potential']
        )
        
        try:
            # Update metrics
            self.executor_metrics['total_pipelines_executed'] += 1
            
            # Start monitoring
            monitor_task = None
            if self.config.enable_monitoring:
                monitor_task = asyncio.create_task(
                    self.monitor.monitor_pipeline(pipeline_run)
                )
            
            # Mark pipeline as started
            pipeline_run.mark_started()
            
            # Broadcast pipeline start event
            if websocket_enabled:
                await broadcast_pipeline_started(str(run_id), pipeline_run)
            
            # Execute agents with dependency resolution and parallelization
            await self._execute_pipeline_agents(pipeline_run)
            
            # Mark pipeline as completed
            pipeline_run.mark_completed()
            
            # Stop monitoring
            if monitor_task:
                monitor_task.cancel()
                try:
                    await monitor_task
                except asyncio.CancelledError:
                    pass
            
            # Create final result
            result = self._create_pipeline_result(pipeline_run)
            
            # Update executor metrics
            if result.is_successful():
                self.executor_metrics['successful_pipelines'] += 1
            else:
                self.executor_metrics['failed_pipelines'] += 1
            
            # Update average duration
            total_executed = self.executor_metrics['total_pipelines_executed']
            current_avg = self.executor_metrics['average_pipeline_duration']
            self.executor_metrics['average_pipeline_duration'] = (
                (current_avg * (total_executed - 1) + result.duration_seconds) / total_executed
            )
            
            # Update parallel efficiency
            if result.parallel_efficiency > 0:
                self.executor_metrics['parallel_efficiency'] = (
                    (self.executor_metrics['parallel_efficiency'] + result.parallel_efficiency) / 2
                )
            
            self.executor_metrics['total_agents_executed'] += len(result.successful_agents)
            
            logger.info(
                "pipeline_execution_completed",
                run_id=str(run_id),
                status=result.status,
                duration=result.duration_seconds,
                success_rate=result.get_success_rate(),
                parallel_efficiency=result.parallel_efficiency
            )
            
            return result
            
        except Exception as e:
            logger.error(
                "pipeline_execution_failed",
                run_id=str(run_id),
                error=str(e)
            )
            
            self.executor_metrics['failed_pipelines'] += 1
            pipeline_run.status = PipelineStatus.FAILURE
            pipeline_run.mark_completed()
            
            result = self._create_pipeline_result(pipeline_run)
            return result
        
        finally:
            # Clean up
            if run_id in self.active_runs:
                del self.active_runs[run_id]
    
    async def _execute_pipeline_agents(self, pipeline_run: PipelineRun):
        """
        Execute all agents in the pipeline with advanced scheduling and dependency resolution.
        """
        start_time = time.time()
        running_tasks: Dict[str, asyncio.Task] = {}
        
        while not pipeline_run.is_complete():
            # Check if pipeline is paused
            if pipeline_run.id in self.paused_pipelines:
                # Wait for resume signal
                if pipeline_run.id not in self.pause_events:
                    self.pause_events[pipeline_run.id] = asyncio.Event()
                
                await self.pause_events[pipeline_run.id].wait()
                
                # Check if still not cancelled after resume
                if pipeline_run.status == PipelineStatus.CANCELLED:
                    break
            
            # Check for timeout
            if time.time() - start_time > self.config.pipeline_timeout:
                logger.error(
                    "pipeline_timeout",
                    run_id=str(pipeline_run.id),
                    timeout=self.config.pipeline_timeout
                )
                break
            
            # Use scheduler to determine which executions to start
            scheduled_executions = await self.scheduler.schedule_executions(pipeline_run)
            
            # Start scheduled executions
            for execution in scheduled_executions:
                if execution.agent_type not in running_tasks:
                    task = asyncio.create_task(
                        self._execute_single_agent(pipeline_run, execution)
                    )
                    running_tasks[execution.agent_type] = task
                    pipeline_run.currently_running += 1
                    
                    logger.info(
                        "agent_execution_started",
                        run_id=str(pipeline_run.id),
                        agent_type=execution.agent_type,
                        parallel_count=pipeline_run.currently_running,
                        priority=execution.priority
                    )
            
            # Wait for at least one task to complete
            if running_tasks:
                done, pending = await asyncio.wait(
                    running_tasks.values(),
                    return_when=asyncio.FIRST_COMPLETED,
                    timeout=1.0  # Check every second
                )
                
                # Process completed tasks
                for task in done:
                    agent_type = None
                    for at, t in running_tasks.items():
                        if t == task:
                            agent_type = at
                            break
                    
                    if agent_type:
                        del running_tasks[agent_type]
                        pipeline_run.currently_running -= 1
                        
                        try:
                            await task  # Get result or raise exception
                            
                            # Notify scheduler of completion
                            execution = pipeline_run.get_execution(agent_type)
                            if execution:
                                queued_execution = await self.scheduler.execution_completed(execution)
                                # If scheduler promoted a queued execution, start it
                                if queued_execution and queued_execution.agent_type not in running_tasks:
                                    new_task = asyncio.create_task(
                                        self._execute_single_agent(pipeline_run, queued_execution)
                                    )
                                    running_tasks[queued_execution.agent_type] = new_task
                                    pipeline_run.currently_running += 1
                                    
                        except Exception as e:
                            logger.error(
                                "agent_execution_error",
                                agent_type=agent_type,
                                error=str(e)
                            )
            else:
                # No tasks running, wait briefly
                await asyncio.sleep(0.1)
            
            # Update progress
            pipeline_run.update_progress()
            
            # Check for fail-fast condition
            if (self.config.fail_fast and 
                any(e.status == ExecutionStatus.FAILURE for e in pipeline_run.executions)):
                logger.warning(
                    "pipeline_fail_fast_triggered",
                    run_id=str(pipeline_run.id)
                )
                break
        
        # Wait for any remaining tasks
        if running_tasks:
            await asyncio.gather(*running_tasks.values(), return_exceptions=True)
    
    async def _execute_single_agent(self, pipeline_run: PipelineRun, execution: AgentExecution):
        """
        Execute a single agent with retry logic and error handling.
        """
        agent_type = execution.agent_type
        
        while execution.can_retry() or execution.status == ExecutionStatus.PENDING:
            try:
                # Acquire execution semaphore
                async with self.execution_semaphore:
                    # Get agent instance
                    if agent_type not in self.agent_registry.agents:
                        raise ValueError(f"Agent type '{agent_type}' not registered")
                    
                    agent_class = self.agent_registry.agents[agent_type]
                    agent = agent_class()
                    
                    # Prepare input
                    agent_input = self._prepare_agent_input(pipeline_run, execution)
                    execution.input_data = agent_input
                    execution.mark_started()
                    
                    # Execute with timeout
                    output = await asyncio.wait_for(
                        agent.execute(agent_input),
                        timeout=self.config.execution_timeout
                    )
                    
                    # Mark as completed
                    execution.mark_completed(output)
                    
                    # Store artifacts
                    if output.artifacts:
                        pipeline_run.artifacts.update(output.artifacts)
                    
                    logger.info(
                        "agent_execution_completed",
                        run_id=str(pipeline_run.id),
                        agent_type=agent_type,
                        attempt=execution.attempt_number,
                        confidence=output.confidence_score,
                        duration=execution.duration_seconds
                    )
                    
                    break
                    
            except asyncio.TimeoutError:
                execution.status = ExecutionStatus.TIMEOUT
                execution.last_error = f"Execution timeout after {self.config.execution_timeout}s"
                
                # Try recovery if configured
                if self.recovery:
                    timeout_error = TimeoutError(f"Execution timeout after {self.config.execution_timeout}s")
                    recovery_success = await self.recovery.handle_execution_failure(
                        execution, pipeline_run, timeout_error
                    )
                    if recovery_success and execution.status == ExecutionStatus.PENDING:
                        continue  # Retry after recovery
                
            except Exception as e:
                execution.mark_failed(str(e))
                
                logger.warning(
                    "agent_execution_failed",
                    run_id=str(pipeline_run.id),
                    agent_type=agent_type,
                    attempt=execution.attempt_number,
                    error=str(e)
                )
                
                # Try recovery if configured
                if self.recovery:
                    recovery_success = await self.recovery.handle_execution_failure(
                        execution, pipeline_run, e
                    )
                    if recovery_success and execution.status == ExecutionStatus.PENDING:
                        continue  # Retry after recovery
            
            # Handle retry
            if execution.can_retry():
                execution.attempt_number += 1
                execution.status = ExecutionStatus.RETRY
                
                # Wait for retry delay
                delay = execution.get_retry_delay()
                if delay > 0:
                    logger.info(
                        "agent_execution_retry_delay",
                        agent_type=agent_type,
                        delay=delay,
                        attempt=execution.attempt_number
                    )
                    await asyncio.sleep(delay)
            else:
                # No more retries available
                if execution.status != ExecutionStatus.SUCCESS:
                    execution.status = ExecutionStatus.FAILURE
                break
    
    def _prepare_agent_input(self, pipeline_run: PipelineRun, execution: AgentExecution) -> AgentInput:
        """
        Prepare input data for agent execution based on previous outputs.
        """
        # Collect outputs from completed dependencies
        previous_outputs = {}
        previous_agent = None
        
        for dep_agent_type in execution.depends_on:
            dep_execution = pipeline_run.get_execution(dep_agent_type)
            if dep_execution and dep_execution.output_data:
                previous_outputs[dep_agent_type] = dep_execution.output_data.primary_result
                if dep_execution.output_data.context_updates:
                    previous_outputs.update(dep_execution.output_data.context_updates)
                previous_agent = dep_agent_type
        
        return AgentInput(
            run_id=pipeline_run.id,
            feature_brief=pipeline_run.feature_brief,
            project_context=pipeline_run.project_context,
            previous_outputs=previous_outputs,
            previous_agent=previous_agent
        )
    
    def _create_pipeline_result(self, pipeline_run: PipelineRun) -> PipelineResult:
        """
        Create final pipeline result from completed run.
        """
        result = PipelineResult(
            run_id=pipeline_run.id,
            status=pipeline_run.status,
            duration_seconds=pipeline_run.duration_seconds or 0.0,
            started_at=pipeline_run.started_at or datetime.utcnow(),
            completed_at=pipeline_run.completed_at or datetime.utcnow(),
            artifacts=pipeline_run.artifacts
        )
        
        # Collect agent results
        total_execution_time = 0.0
        retry_count = 0
        
        for execution in pipeline_run.executions:
            if execution.status == ExecutionStatus.SUCCESS:
                result.successful_agents.append(execution.agent_type)
                if execution.output_data:
                    result.add_agent_output(execution.agent_type, execution.output_data)
            else:
                result.failed_agents.append(execution.agent_type)
            
            if execution.duration_seconds:
                total_execution_time += execution.duration_seconds
            
            retry_count += execution.attempt_number - 1
        
        result.total_execution_time = total_execution_time
        result.retry_count = retry_count
        
        # Calculate parallel efficiency
        if pipeline_run.duration_seconds and total_execution_time > 0:
            result.parallel_efficiency = min(1.0, total_execution_time / pipeline_run.duration_seconds)
        
        return result
    
    async def cancel_pipeline(self, run_id: UUID) -> bool:
        """
        Cancel a running pipeline.
        """
        pipeline_run = self.active_runs.get(run_id)
        if not pipeline_run:
            return False
        
        pipeline_run.status = PipelineStatus.CANCELLED
        
        # Cancel all pending/running executions
        for execution in pipeline_run.executions:
            if execution.status in [ExecutionStatus.PENDING, ExecutionStatus.RUNNING]:
                execution.status = ExecutionStatus.CANCELLED
        
        logger.info(
            "pipeline_cancelled",
            run_id=str(run_id)
        )
        
        return True
    
    async def pause_pipeline(self, run_id: UUID) -> bool:
        """
        Pause a running pipeline.
        """
        pipeline_run = self.active_runs.get(run_id)
        if not pipeline_run or pipeline_run.status != PipelineStatus.RUNNING:
            return False
        
        # Add to paused set
        self.paused_pipelines.add(run_id)
        
        # Create pause event if not exists
        if run_id not in self.pause_events:
            self.pause_events[run_id] = asyncio.Event()
        
        # Clear the event to pause execution
        self.pause_events[run_id].clear()
        
        # Update pipeline status
        pipeline_run.status = PipelineStatus.PAUSED
        
        logger.info(
            "pipeline_paused",
            run_id=str(run_id)
        )
        
        # Notify via events
        await self.monitor.record_event(
            run_id,
            'pipeline_paused',
            {'paused_at': datetime.utcnow().isoformat()}
        )
        
        return True
    
    async def resume_pipeline(self, run_id: UUID) -> bool:
        """
        Resume a paused pipeline.
        """
        pipeline_run = self.active_runs.get(run_id)
        if not pipeline_run or run_id not in self.paused_pipelines:
            return False
        
        # Remove from paused set
        self.paused_pipelines.discard(run_id)
        
        # Set the event to resume execution
        if run_id in self.pause_events:
            self.pause_events[run_id].set()
        
        # Update pipeline status
        pipeline_run.status = PipelineStatus.RUNNING
        
        logger.info(
            "pipeline_resumed",
            run_id=str(run_id)
        )
        
        # Notify via events
        await self.monitor.record_event(
            run_id,
            'pipeline_resumed',
            {'resumed_at': datetime.utcnow().isoformat()}
        )
        
        return True
    
    def get_pipeline_status(self, run_id: UUID) -> Optional[PipelineRun]:
        """
        Get current status of a pipeline run.
        """
        return self.active_runs.get(run_id)
    
    def list_active_pipelines(self) -> List[PipelineRun]:
        """
        List all currently active pipeline runs.
        """
        return list(self.active_runs.values())
    
    async def analyze_pipeline_dependencies(self, run_id: UUID) -> Dict[str, Any]:
        """
        Analyze dependencies for a pipeline run.
        """
        pipeline_run = self.active_runs.get(run_id)
        if not pipeline_run:
            raise ValueError(f"Pipeline run {run_id} not found")
        
        return await self.dependency_manager.analyze_pipeline_dependencies(pipeline_run)
    
    async def get_pipeline_optimization_recommendations(self, run_id: UUID) -> Dict[str, Any]:
        """
        Get optimization recommendations for a pipeline.
        """
        pipeline_run = self.active_runs.get(run_id)
        if not pipeline_run:
            raise ValueError(f"Pipeline run {run_id} not found")
        
        # Analyze current configuration
        dependency_analysis = await self.dependency_manager.analyze_pipeline_dependencies(pipeline_run)
        scheduler_metrics = await self.scheduler.get_scheduling_metrics()
        
        recommendations = {
            'dependency_optimizations': dependency_analysis['optimizations'],
            'scheduling_recommendations': [],
            'resource_recommendations': [],
            'parallelism_recommendations': []
        }
        
        # Scheduling recommendations
        if scheduler_metrics['queue_size'] > 0:
            recommendations['scheduling_recommendations'].append({
                'type': 'reduce_queue_backlog',
                'description': f'Queue has {scheduler_metrics["queue_size"]} waiting executions',
                'recommendation': 'Consider increasing max_parallel_agents or optimizing dependencies'
            })
        
        # Resource recommendations  
        if scheduler_metrics['current_cpu_usage'] > 80:
            recommendations['resource_recommendations'].append({
                'type': 'high_cpu_usage',
                'description': f'High CPU usage: {scheduler_metrics["current_cpu_usage"]:.1f}%',
                'recommendation': 'Consider reducing parallel executions or optimizing agent performance'
            })
        
        # Parallelism recommendations
        parallelism_potential = dependency_analysis['parallelism']['potential']
        if parallelism_potential > 0.7 and self.config.max_parallel_agents < 5:
            recommendations['parallelism_recommendations'].append({
                'type': 'increase_parallelism',
                'description': f'High parallelism potential ({parallelism_potential:.2f}) with low parallel limit',
                'recommendation': f'Consider increasing max_parallel_agents from {self.config.max_parallel_agents} to {min(10, int(self.config.max_parallel_agents * 1.5))}'
            })
        
        return recommendations
    
    async def get_executor_performance_metrics(self) -> Dict[str, Any]:
        """
        Get comprehensive performance metrics for the executor.
        """
        # Get component metrics
        scheduler_metrics = await self.scheduler.get_scheduling_metrics()
        recovery_stats = self.recovery.get_recovery_statistics()
        dependency_health = await self.dependency_manager.health_check()
        
        # Calculate success rates
        total_pipelines = self.executor_metrics['total_pipelines_executed']
        success_rate = 0.0
        if total_pipelines > 0:
            success_rate = (self.executor_metrics['successful_pipelines'] / total_pipelines) * 100.0
        
        return {
            'executor_metrics': {
                **self.executor_metrics,
                'success_rate': success_rate,
                'failure_rate': ((self.executor_metrics['failed_pipelines'] / max(total_pipelines, 1)) * 100.0)
            },
            'scheduling_metrics': scheduler_metrics,
            'recovery_statistics': recovery_stats,
            'dependency_health': dependency_health,
            'component_status': {
                'scheduler': 'active' if len(scheduler_metrics) > 0 else 'inactive',
                'monitor': 'active' if self.config.enable_monitoring else 'disabled',
                'recovery': 'active',
                'dependency_manager': 'active'
            }
        }
    
    async def optimize_pipeline_configuration(
        self, 
        run_id: UUID,
        apply_optimizations: bool = False
    ) -> Dict[str, Any]:
        """
        Analyze and optionally apply pipeline optimizations.
        """
        pipeline_run = self.active_runs.get(run_id)
        if not pipeline_run:
            raise ValueError(f"Pipeline run {run_id} not found")
        
        # Get optimization recommendations
        recommendations = await self.get_pipeline_optimization_recommendations(run_id)
        
        optimization_results = {
            'recommendations': recommendations,
            'applied_optimizations': [],
            'estimated_improvement': {},
            'warnings': []
        }
        
        if apply_optimizations:
            # Apply dependency optimizations
            if recommendations['dependency_optimizations']:
                try:
                    optimized_executions = self.dependency_manager.get_optimized_execution_order(
                        pipeline_run.executions
                    )
                    pipeline_run.executions = optimized_executions
                    optimization_results['applied_optimizations'].append('execution_order_optimized')
                    
                except Exception as e:
                    optimization_results['warnings'].append(
                        f"Failed to apply execution order optimization: {e}"
                    )
            
            # Apply scheduling optimizations
            if recommendations['parallelism_recommendations']:
                for rec in recommendations['parallelism_recommendations']:
                    if rec['type'] == 'increase_parallelism':
                        # Extract recommended value from recommendation text
                        try:
                            old_value = self.config.max_parallel_agents
                            new_value = min(10, int(old_value * 1.5))
                            pipeline_run.max_parallel = new_value
                            optimization_results['applied_optimizations'].append(
                                f'max_parallel_increased_{old_value}_to_{new_value}'
                            )
                        except Exception as e:
                            optimization_results['warnings'].append(
                                f"Failed to increase parallelism: {e}"
                            )
        
        # Estimate potential improvements
        dependency_analysis = await self.dependency_manager.analyze_pipeline_dependencies(pipeline_run)
        parallelism_potential = dependency_analysis['parallelism']['potential']
        
        optimization_results['estimated_improvement'] = {
            'execution_time_reduction': min(30, parallelism_potential * 40),  # Estimate % improvement
            'resource_utilization': min(20, parallelism_potential * 25),
            'failure_resilience': 15 if recommendations['dependency_optimizations'] else 0
        }
        
        return optimization_results
    
    async def get_pipeline_insights(self, run_id: UUID) -> Dict[str, Any]:
        """
        Get comprehensive insights about a pipeline execution.
        """
        pipeline_run = self.active_runs.get(run_id)
        if not pipeline_run:
            # Try to get from completed pipelines (would need to be stored)
            raise ValueError(f"Pipeline run {run_id} not found")
        
        # Get performance analysis from monitor if available
        performance_analysis = {}
        if hasattr(self.monitor, 'get_performance_analysis'):
            try:
                performance_analysis = await self.monitor.get_performance_analysis(run_id)
            except Exception:
                pass  # Monitor data might not be available
        
        # Analyze agent execution patterns
        agent_insights = {}
        for execution in pipeline_run.executions:
            insights = {
                'status': execution.status,
                'attempts': execution.attempt_number,
                'duration': execution.duration_seconds,
                'dependencies': execution.depends_on,
                'blocking_agents': len([e for e in pipeline_run.executions if execution.agent_type in e.depends_on])
            }
            
            # Add performance characteristics
            if execution.duration_seconds:
                avg_duration = self.executor_metrics['average_pipeline_duration'] / max(len(pipeline_run.executions), 1)
                insights['performance_rating'] = 'fast' if execution.duration_seconds < avg_duration * 0.8 else \
                                               'slow' if execution.duration_seconds > avg_duration * 1.2 else 'normal'
            
            agent_insights[execution.agent_type] = insights
        
        return {
            'pipeline_summary': {
                'name': pipeline_run.name,
                'status': pipeline_run.status,
                'progress': pipeline_run.progress_percentage,
                'total_agents': pipeline_run.total_agents,
                'completed_agents': pipeline_run.completed_agents,
                'failed_agents': pipeline_run.failed_agents
            },
            'agent_insights': agent_insights,
            'performance_analysis': performance_analysis,
            'execution_timeline': [
                {
                    'agent_type': e.agent_type,
                    'started_at': e.started_at.isoformat() if e.started_at else None,
                    'completed_at': e.completed_at.isoformat() if e.completed_at else None,
                    'duration': e.duration_seconds
                }
                for e in pipeline_run.executions
                if e.started_at
            ]
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform comprehensive health check on the executor.
        """
        # Get component health checks
        scheduler_health = await self.scheduler.get_scheduling_metrics()
        monitor_health = await self.monitor.health_check() if hasattr(self.monitor, 'health_check') else {}
        recovery_health = await self.recovery.health_check()
        dependency_health = await self.dependency_manager.health_check()
        
        # Overall health assessment
        health_score = 100
        issues = []
        
        # Check active pipeline load
        if len(self.active_runs) > self.config.max_parallel_agents * 2:
            health_score -= 20
            issues.append("High active pipeline load")
        
        # Check error rates
        if self.executor_metrics['total_pipelines_executed'] > 0:
            failure_rate = (self.executor_metrics['failed_pipelines'] / 
                          self.executor_metrics['total_pipelines_executed']) * 100
            if failure_rate > 20:
                health_score -= 30
                issues.append(f"High failure rate: {failure_rate:.1f}%")
        
        # Check recovery system
        if recovery_health['recovery_success_rate'] < 50:
            health_score -= 15
            issues.append("Low recovery success rate")
        
        health_status = "healthy" if health_score > 80 else \
                       "degraded" if health_score > 50 else "unhealthy"
        
        return {
            "status": health_status,
            "health_score": health_score,
            "issues": issues,
            "active_pipelines": len(self.active_runs),
            "max_parallel_agents": self.config.max_parallel_agents,
            "available_agents": list(self.agent_registry.agents.keys()),
            "executor_metrics": self.executor_metrics,
            "component_health": {
                "scheduler": scheduler_health,
                "monitor": monitor_health,
                "recovery": recovery_health,
                "dependency_manager": dependency_health
            },
            "config": self.config.model_dump()
        }