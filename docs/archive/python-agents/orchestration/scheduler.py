"""
Agent Scheduler - Intelligent task scheduling and resource optimization.

Manages agent execution queues, resource allocation, and optimal scheduling
based on dependencies, priorities, and system resources.
"""

import asyncio
import heapq
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set, Tuple
from uuid import UUID

import structlog

from .models import (
    AgentExecution, 
    ExecutionStatus, 
    OrchestrationConfig, 
    PipelineRun
)

logger = structlog.get_logger()


class SchedulingStrategy:
    """Base class for scheduling strategies."""
    
    def prioritize_executions(
        self, 
        executions: List[AgentExecution], 
        pipeline_run: PipelineRun,
        config: OrchestrationConfig
    ) -> List[AgentExecution]:
        """Prioritize executions for scheduling."""
        raise NotImplementedError


class PrioritySchedulingStrategy(SchedulingStrategy):
    """Priority-based scheduling strategy."""
    
    def prioritize_executions(
        self, 
        executions: List[AgentExecution], 
        pipeline_run: PipelineRun,
        config: OrchestrationConfig
    ) -> List[AgentExecution]:
        """Sort by priority, then by dependency depth."""
        return sorted(executions, key=lambda x: (
            -x.priority,  # Higher priority first
            len(x.depends_on),  # Fewer dependencies first
            x.created_at  # Earlier creation first
        ))


class ResourceAwareSchedulingStrategy(SchedulingStrategy):
    """Resource-aware scheduling strategy."""
    
    def __init__(self):
        self.estimated_resources = {
            'planner': {'cpu': 20, 'memory': 512},
            'architect': {'cpu': 40, 'memory': 1024},
            'coder': {'cpu': 60, 'memory': 2048},
            'tester': {'cpu': 80, 'memory': 1536},
            'reviewer': {'cpu': 30, 'memory': 768}
        }
    
    def prioritize_executions(
        self, 
        executions: List[AgentExecution], 
        pipeline_run: PipelineRun,
        config: OrchestrationConfig
    ) -> List[AgentExecution]:
        """Sort by resource efficiency and priority."""
        def resource_score(execution: AgentExecution) -> float:
            agent_type = execution.agent_type
            resources = self.estimated_resources.get(agent_type, {'cpu': 50, 'memory': 1024})
            
            # Calculate efficiency score (priority / resource cost)
            resource_cost = resources['cpu'] + (resources['memory'] / 100)
            return execution.priority / max(resource_cost, 1)
        
        return sorted(executions, key=lambda x: (
            -resource_score(x),
            -x.priority,
            len(x.depends_on)
        ))


class CriticalPathSchedulingStrategy(SchedulingStrategy):
    """Critical path method scheduling."""
    
    def prioritize_executions(
        self, 
        executions: List[AgentExecution], 
        pipeline_run: PipelineRun,
        config: OrchestrationConfig
    ) -> List[AgentExecution]:
        """Schedule based on critical path analysis."""
        # Build dependency graph
        dependency_graph = {}
        for execution in pipeline_run.executions:
            dependency_graph[execution.agent_type] = execution.depends_on
        
        # Calculate critical path lengths
        critical_lengths = self._calculate_critical_path(dependency_graph, pipeline_run.executions)
        
        return sorted(executions, key=lambda x: (
            -critical_lengths.get(x.agent_type, 0),
            -x.priority,
            x.created_at
        ))
    
    def _calculate_critical_path(
        self, 
        dependency_graph: Dict[str, List[str]], 
        all_executions: List[AgentExecution]
    ) -> Dict[str, float]:
        """Calculate critical path lengths for each agent."""
        durations = {}
        for execution in all_executions:
            durations[execution.agent_type] = execution.estimated_duration or 60.0
        
        critical_lengths = {}
        visited = set()
        
        def calculate_length(agent_type: str) -> float:
            if agent_type in visited:
                return critical_lengths.get(agent_type, 0)
            
            visited.add(agent_type)
            
            dependencies = dependency_graph.get(agent_type, [])
            if not dependencies:
                critical_lengths[agent_type] = durations.get(agent_type, 60.0)
            else:
                max_dep_length = max(calculate_length(dep) for dep in dependencies)
                critical_lengths[agent_type] = max_dep_length + durations.get(agent_type, 60.0)
            
            return critical_lengths[agent_type]
        
        for agent_type in dependency_graph:
            calculate_length(agent_type)
        
        return critical_lengths


class ResourcePool:
    """Manages available system resources."""
    
    def __init__(self, config: OrchestrationConfig):
        self.config = config
        self.current_cpu_usage = 0.0
        self.current_memory_mb = 0
        self.active_executions: Dict[str, AgentExecution] = {}
    
    def can_allocate_resources(self, execution: AgentExecution) -> bool:
        """Check if resources can be allocated for execution."""
        if not self.config.enable_resource_limits:
            return len(self.active_executions) < self.config.max_parallel_agents
        
        # Estimate resource requirements
        agent_type = execution.agent_type
        estimated_cpu = execution.resource_requirements.get('cpu', 25.0)
        estimated_memory = execution.resource_requirements.get('memory', 512)
        
        # Check limits
        if self.config.max_cpu_percent:
            if self.current_cpu_usage + estimated_cpu > self.config.max_cpu_percent:
                return False
        
        if self.config.max_memory_mb:
            if self.current_memory_mb + estimated_memory > self.config.max_memory_mb:
                return False
        
        return len(self.active_executions) < self.config.max_parallel_agents
    
    def allocate_resources(self, execution: AgentExecution):
        """Allocate resources for execution."""
        self.active_executions[execution.id] = execution
        
        estimated_cpu = execution.resource_requirements.get('cpu', 25.0)
        estimated_memory = execution.resource_requirements.get('memory', 512)
        
        self.current_cpu_usage += estimated_cpu
        self.current_memory_mb += estimated_memory
        
        logger.info(
            "resources_allocated",
            execution_id=str(execution.id),
            agent_type=execution.agent_type,
            cpu_usage=self.current_cpu_usage,
            memory_mb=self.current_memory_mb
        )
    
    def release_resources(self, execution: AgentExecution):
        """Release resources from completed execution."""
        if execution.id not in self.active_executions:
            return
        
        del self.active_executions[execution.id]
        
        estimated_cpu = execution.resource_requirements.get('cpu', 25.0)
        estimated_memory = execution.resource_requirements.get('memory', 512)
        
        self.current_cpu_usage = max(0, self.current_cpu_usage - estimated_cpu)
        self.current_memory_mb = max(0, self.current_memory_mb - estimated_memory)
        
        logger.info(
            "resources_released",
            execution_id=str(execution.id),
            agent_type=execution.agent_type,
            cpu_usage=self.current_cpu_usage,
            memory_mb=self.current_memory_mb
        )


class ExecutionQueue:
    """Priority queue for agent executions."""
    
    def __init__(self):
        self._heap: List[Tuple[float, int, AgentExecution]] = []
        self._counter = 0
    
    def put(self, execution: AgentExecution, priority_score: float):
        """Add execution to queue with priority score."""
        # Use negative score for max-heap behavior
        heapq.heappush(self._heap, (-priority_score, self._counter, execution))
        self._counter += 1
    
    def get(self) -> Optional[AgentExecution]:
        """Get highest priority execution from queue."""
        if not self._heap:
            return None
        
        _, _, execution = heapq.heappop(self._heap)
        return execution
    
    def peek(self) -> Optional[AgentExecution]:
        """Peek at highest priority execution without removing it."""
        if not self._heap:
            return None
        return self._heap[0][2]
    
    def size(self) -> int:
        """Get queue size."""
        return len(self._heap)
    
    def empty(self) -> bool:
        """Check if queue is empty."""
        return len(self._heap) == 0


class AgentScheduler:
    """
    Advanced agent scheduler with multiple scheduling strategies,
    resource management, and optimization capabilities.
    """
    
    def __init__(self, config: OrchestrationConfig):
        self.config = config
        self.resource_pool = ResourcePool(config)
        
        # Scheduling strategy
        self.strategy = self._create_scheduling_strategy()
        
        # Execution queue
        self.execution_queue = ExecutionQueue()
        
        # Metrics
        self.scheduling_metrics = {
            'total_scheduled': 0,
            'queue_time_sum': 0.0,
            'resource_wait_time': 0.0,
            'dependency_wait_time': 0.0
        }
        
        logger.info(
            "agent_scheduler_initialized",
            strategy=self.strategy.__class__.__name__,
            max_parallel=config.max_parallel_agents
        )
    
    def _create_scheduling_strategy(self) -> SchedulingStrategy:
        """Create scheduling strategy based on configuration."""
        if self.config.enable_pipeline_optimization:
            return CriticalPathSchedulingStrategy()
        elif self.config.enable_resource_limits:
            return ResourceAwareSchedulingStrategy()
        else:
            return PrioritySchedulingStrategy()
    
    async def schedule_executions(
        self, 
        pipeline_run: PipelineRun
    ) -> List[AgentExecution]:
        """
        Schedule ready executions for a pipeline run.
        Returns list of executions that can be started immediately.
        """
        # Get executions ready to run
        ready_executions = pipeline_run.get_ready_executions()
        
        if not ready_executions:
            return []
        
        # Apply scheduling strategy
        prioritized_executions = self.strategy.prioritize_executions(
            ready_executions, pipeline_run, self.config
        )
        
        # Schedule executions based on available resources
        scheduled = []
        
        for execution in prioritized_executions:
            if self.resource_pool.can_allocate_resources(execution):
                self.resource_pool.allocate_resources(execution)
                scheduled.append(execution)
                
                # Update metrics
                self.scheduling_metrics['total_scheduled'] += 1
                
                logger.info(
                    "execution_scheduled",
                    run_id=str(pipeline_run.id),
                    execution_id=str(execution.id),
                    agent_type=execution.agent_type,
                    priority=execution.priority
                )
                
                # Respect parallel execution limits
                if len(scheduled) >= self.config.max_parallel_agents:
                    break
            else:
                # Add to queue for later scheduling
                priority_score = self._calculate_priority_score(execution, pipeline_run)
                self.execution_queue.put(execution, priority_score)
                
                logger.debug(
                    "execution_queued",
                    execution_id=str(execution.id),
                    agent_type=execution.agent_type,
                    queue_size=self.execution_queue.size()
                )
        
        return scheduled
    
    def _calculate_priority_score(
        self, 
        execution: AgentExecution, 
        pipeline_run: PipelineRun
    ) -> float:
        """Calculate priority score for queue ordering."""
        base_score = execution.priority
        
        # Adjust for dependency depth
        dependency_penalty = len(execution.depends_on) * 5
        
        # Adjust for waiting time
        wait_time_bonus = (datetime.utcnow() - execution.created_at).total_seconds() / 60
        
        # Adjust for estimated duration (shorter tasks get slight priority)
        duration_factor = 1.0
        if execution.estimated_duration:
            duration_factor = max(0.5, 1.0 - (execution.estimated_duration / 600))
        
        return base_score - dependency_penalty + wait_time_bonus + (duration_factor * 10)
    
    async def execution_completed(self, execution: AgentExecution):
        """Handle completion of an execution."""
        self.resource_pool.release_resources(execution)
        
        # Check if any queued executions can now be scheduled
        if not self.execution_queue.empty():
            queued_execution = self.execution_queue.get()
            if queued_execution and self.resource_pool.can_allocate_resources(queued_execution):
                self.resource_pool.allocate_resources(queued_execution)
                
                logger.info(
                    "queued_execution_promoted",
                    execution_id=str(queued_execution.id),
                    agent_type=queued_execution.agent_type
                )
                
                return queued_execution
        
        return None
    
    async def get_scheduling_metrics(self) -> Dict[str, Any]:
        """Get current scheduling metrics."""
        return {
            **self.scheduling_metrics,
            'queue_size': self.execution_queue.size(),
            'active_executions': len(self.resource_pool.active_executions),
            'current_cpu_usage': self.resource_pool.current_cpu_usage,
            'current_memory_mb': self.resource_pool.current_memory_mb,
            'strategy': self.strategy.__class__.__name__
        }
    
    async def optimize_pipeline_schedule(self, pipeline_run: PipelineRun) -> Dict[str, Any]:
        """Analyze and optimize pipeline scheduling."""
        optimization_results = {
            'recommendations': [],
            'estimated_improvement': 0.0,
            'bottlenecks': [],
            'resource_efficiency': 0.0
        }
        
        # Analyze dependency bottlenecks
        dependency_analysis = self._analyze_dependencies(pipeline_run)
        optimization_results['bottlenecks'] = dependency_analysis['bottlenecks']
        
        # Analyze resource utilization
        resource_analysis = self._analyze_resource_utilization(pipeline_run)
        optimization_results['resource_efficiency'] = resource_analysis['efficiency']
        
        # Generate optimization recommendations
        if dependency_analysis['serial_ratio'] > 0.7:
            optimization_results['recommendations'].append({
                'type': 'dependency_optimization',
                'description': 'Consider reducing agent dependencies to enable more parallelism',
                'impact': 'high'
            })
        
        if resource_analysis['efficiency'] < 0.6:
            optimization_results['recommendations'].append({
                'type': 'resource_optimization', 
                'description': 'Increase parallel execution limit to better utilize resources',
                'impact': 'medium'
            })
        
        return optimization_results
    
    def _analyze_dependencies(self, pipeline_run: PipelineRun) -> Dict[str, Any]:
        """Analyze dependency structure for bottlenecks."""
        total_agents = len(pipeline_run.executions)
        if total_agents == 0:
            return {'bottlenecks': [], 'serial_ratio': 0.0}
        
        # Count agents with no dependencies (can run in parallel)
        parallel_agents = sum(1 for e in pipeline_run.executions if not e.depends_on)
        serial_ratio = 1.0 - (parallel_agents / total_agents)
        
        # Find bottleneck agents (many others depend on them)
        dependency_counts = {}
        for execution in pipeline_run.executions:
            for dep in execution.depends_on:
                dependency_counts[dep] = dependency_counts.get(dep, 0) + 1
        
        bottlenecks = [
            agent for agent, count in dependency_counts.items() 
            if count > total_agents * 0.3
        ]
        
        return {
            'bottlenecks': bottlenecks,
            'serial_ratio': serial_ratio,
            'parallel_agents': parallel_agents
        }
    
    def _analyze_resource_utilization(self, pipeline_run: PipelineRun) -> Dict[str, Any]:
        """Analyze resource utilization efficiency."""
        if not pipeline_run.executions:
            return {'efficiency': 0.0, 'peak_utilization': 0.0}
        
        # Estimate peak resource usage
        total_cpu = sum(
            e.resource_requirements.get('cpu', 25.0) 
            for e in pipeline_run.executions
        )
        total_memory = sum(
            e.resource_requirements.get('memory', 512)
            for e in pipeline_run.executions
        )
        
        # Calculate efficiency based on parallelization potential
        max_parallel_cpu = self.config.max_parallel_agents * 50  # Average CPU per agent
        max_parallel_memory = self.config.max_parallel_agents * 1024  # Average memory per agent
        
        cpu_efficiency = min(1.0, total_cpu / max_parallel_cpu) if max_parallel_cpu > 0 else 0.0
        memory_efficiency = min(1.0, total_memory / max_parallel_memory) if max_parallel_memory > 0 else 0.0
        
        return {
            'efficiency': (cpu_efficiency + memory_efficiency) / 2,
            'peak_utilization': min(cpu_efficiency, memory_efficiency)
        }