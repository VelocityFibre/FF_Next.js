"""
Pipeline Monitor - Real-time pipeline execution monitoring and metrics.

Provides comprehensive monitoring capabilities including performance metrics,
resource usage tracking, progress monitoring, and alerting.
"""

import asyncio
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set, Callable
from uuid import UUID
import json

import structlog

from .models import (
    PipelineRun,
    AgentExecution, 
    ExecutionStatus,
    PipelineStatus,
    OrchestrationConfig
)

logger = structlog.get_logger()


class MetricCollector:
    """Collects and aggregates pipeline metrics."""
    
    def __init__(self):
        self.metrics = {
            'executions_started': 0,
            'executions_completed': 0,
            'executions_failed': 0,
            'total_execution_time': 0.0,
            'average_execution_time': 0.0,
            'retry_count': 0,
            'resource_utilization': {},
            'throughput_per_minute': 0.0,
            'error_rates': {}
        }
        self.start_time = datetime.utcnow()
    
    def record_execution_start(self, execution: AgentExecution):
        """Record the start of an execution."""
        self.metrics['executions_started'] += 1
        
        logger.debug(
            "execution_metric_recorded",
            type="start",
            execution_id=str(execution.id),
            agent_type=execution.agent_type
        )
    
    def record_execution_completion(self, execution: AgentExecution):
        """Record the completion of an execution."""
        self.metrics['executions_completed'] += 1
        
        if execution.duration_seconds:
            self.metrics['total_execution_time'] += execution.duration_seconds
            self.metrics['average_execution_time'] = (
                self.metrics['total_execution_time'] / 
                max(self.metrics['executions_completed'], 1)
            )
        
        if execution.status == ExecutionStatus.SUCCESS:
            # Calculate throughput
            elapsed_minutes = (datetime.utcnow() - self.start_time).total_seconds() / 60
            if elapsed_minutes > 0:
                self.metrics['throughput_per_minute'] = (
                    self.metrics['executions_completed'] / elapsed_minutes
                )
        
        logger.debug(
            "execution_metric_recorded",
            type="completion",
            execution_id=str(execution.id),
            agent_type=execution.agent_type,
            duration=execution.duration_seconds
        )
    
    def record_execution_failure(self, execution: AgentExecution):
        """Record the failure of an execution."""
        self.metrics['executions_failed'] += 1
        
        # Track error rates by agent type
        agent_type = execution.agent_type
        if agent_type not in self.metrics['error_rates']:
            self.metrics['error_rates'][agent_type] = {'total': 0, 'failed': 0}
        
        self.metrics['error_rates'][agent_type]['total'] += 1
        self.metrics['error_rates'][agent_type]['failed'] += 1
        
        logger.debug(
            "execution_metric_recorded",
            type="failure",
            execution_id=str(execution.id),
            agent_type=execution.agent_type,
            error=execution.last_error
        )
    
    def record_retry(self, execution: AgentExecution):
        """Record a retry attempt."""
        self.metrics['retry_count'] += 1
        
        logger.debug(
            "retry_metric_recorded",
            execution_id=str(execution.id),
            agent_type=execution.agent_type,
            attempt=execution.attempt_number
        )
    
    def get_metrics_snapshot(self) -> Dict[str, Any]:
        """Get current metrics snapshot."""
        elapsed_time = (datetime.utcnow() - self.start_time).total_seconds()
        
        return {
            **self.metrics,
            'monitoring_duration_seconds': elapsed_time,
            'success_rate': self._calculate_success_rate(),
            'failure_rate': self._calculate_failure_rate(),
            'average_retry_rate': self._calculate_retry_rate(),
            'snapshot_time': datetime.utcnow().isoformat()
        }
    
    def _calculate_success_rate(self) -> float:
        """Calculate execution success rate."""
        total = self.metrics['executions_started']
        if total == 0:
            return 0.0
        return (self.metrics['executions_completed'] / total) * 100.0
    
    def _calculate_failure_rate(self) -> float:
        """Calculate execution failure rate."""
        total = self.metrics['executions_started']
        if total == 0:
            return 0.0
        return (self.metrics['executions_failed'] / total) * 100.0
    
    def _calculate_retry_rate(self) -> float:
        """Calculate average retry rate."""
        completed = self.metrics['executions_completed'] + self.metrics['executions_failed']
        if completed == 0:
            return 0.0
        return self.metrics['retry_count'] / completed


class ProgressTracker:
    """Tracks and calculates pipeline progress."""
    
    def __init__(self):
        self.pipeline_progress: Dict[UUID, Dict[str, Any]] = {}
    
    def update_pipeline_progress(self, pipeline_run: PipelineRun):
        """Update progress tracking for a pipeline."""
        progress_data = {
            'total_agents': pipeline_run.total_agents,
            'completed_agents': pipeline_run.completed_agents,
            'failed_agents': pipeline_run.failed_agents,
            'running_agents': pipeline_run.currently_running,
            'progress_percentage': pipeline_run.progress_percentage,
            'estimated_completion': self._estimate_completion_time(pipeline_run),
            'throughput': self._calculate_pipeline_throughput(pipeline_run),
            'last_updated': datetime.utcnow()
        }
        
        self.pipeline_progress[pipeline_run.id] = progress_data
    
    def _estimate_completion_time(self, pipeline_run: PipelineRun) -> Optional[datetime]:
        """Estimate pipeline completion time."""
        if pipeline_run.total_agents == 0 or pipeline_run.progress_percentage >= 100:
            return None
        
        remaining_percentage = 100 - pipeline_run.progress_percentage
        if remaining_percentage <= 0:
            return datetime.utcnow()
        
        # Calculate average time per percentage point
        if pipeline_run.started_at and pipeline_run.progress_percentage > 0:
            elapsed_time = (datetime.utcnow() - pipeline_run.started_at).total_seconds()
            time_per_percentage = elapsed_time / pipeline_run.progress_percentage
            estimated_remaining_seconds = remaining_percentage * time_per_percentage
            
            return datetime.utcnow() + timedelta(seconds=estimated_remaining_seconds)
        
        return None
    
    def _calculate_pipeline_throughput(self, pipeline_run: PipelineRun) -> float:
        """Calculate pipeline throughput (agents per minute)."""
        if not pipeline_run.started_at:
            return 0.0
        
        elapsed_time = (datetime.utcnow() - pipeline_run.started_at).total_seconds() / 60
        if elapsed_time <= 0:
            return 0.0
        
        return pipeline_run.completed_agents / elapsed_time
    
    def get_progress_summary(self, run_id: UUID) -> Optional[Dict[str, Any]]:
        """Get progress summary for a pipeline."""
        return self.pipeline_progress.get(run_id)


class AlertManager:
    """Manages alerts and notifications for pipeline events."""
    
    def __init__(self, config: OrchestrationConfig):
        self.config = config
        self.alert_callbacks: List[Callable] = []
        self.alert_thresholds = {
            'failure_rate': 20.0,  # Alert if failure rate > 20%
            'execution_timeout': config.execution_timeout * 1.5,  # 150% of timeout
            'queue_backlog': config.max_parallel_agents * 3,  # 3x parallel limit
            'memory_usage': 90.0,  # Alert at 90% memory usage
            'retry_rate': 50.0  # Alert if retry rate > 50%
        }
    
    def register_alert_callback(self, callback: Callable):
        """Register a callback for alerts."""
        self.alert_callbacks.append(callback)
    
    async def check_alerts(
        self, 
        pipeline_run: PipelineRun, 
        metrics: Dict[str, Any]
    ):
        """Check for alert conditions."""
        alerts = []
        
        # Check failure rate
        failure_rate = metrics.get('failure_rate', 0.0)
        if failure_rate > self.alert_thresholds['failure_rate']:
            alerts.append({
                'type': 'high_failure_rate',
                'severity': 'warning',
                'message': f"High failure rate detected: {failure_rate:.1f}%",
                'pipeline_id': str(pipeline_run.id),
                'timestamp': datetime.utcnow()
            })
        
        # Check for long-running executions
        for execution in pipeline_run.executions:
            if (execution.status == ExecutionStatus.RUNNING and 
                execution.started_at and
                (datetime.utcnow() - execution.started_at).total_seconds() > 
                self.alert_thresholds['execution_timeout']):
                
                alerts.append({
                    'type': 'execution_timeout_warning',
                    'severity': 'warning',
                    'message': f"Execution {execution.agent_type} running longer than expected",
                    'pipeline_id': str(pipeline_run.id),
                    'execution_id': str(execution.id),
                    'timestamp': datetime.utcnow()
                })
        
        # Check retry rate
        retry_rate = metrics.get('average_retry_rate', 0.0)
        if retry_rate > self.alert_thresholds['retry_rate']:
            alerts.append({
                'type': 'high_retry_rate',
                'severity': 'warning',
                'message': f"High retry rate detected: {retry_rate:.1f}",
                'pipeline_id': str(pipeline_run.id),
                'timestamp': datetime.utcnow()
            })
        
        # Trigger alert callbacks
        for alert in alerts:
            await self._trigger_alert_callbacks(alert)
    
    async def _trigger_alert_callbacks(self, alert: Dict[str, Any]):
        """Trigger registered alert callbacks."""
        for callback in self.alert_callbacks:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(alert)
                else:
                    callback(alert)
            except Exception as e:
                logger.error(
                    "alert_callback_failed",
                    error=str(e),
                    alert_type=alert['type']
                )


class PipelineMonitor:
    """
    Comprehensive pipeline monitoring system with real-time metrics,
    progress tracking, alerting, and performance analysis.
    """
    
    def __init__(self, config: OrchestrationConfig):
        self.config = config
        self.metric_collector = MetricCollector()
        self.progress_tracker = ProgressTracker()
        self.alert_manager = AlertManager(config)
        
        self.monitoring_active = False
        self.monitor_tasks: Dict[UUID, asyncio.Task] = {}
        
        # Monitoring data storage
        self.pipeline_histories: Dict[UUID, List[Dict[str, Any]]] = {}
        self.performance_baselines: Dict[str, Dict[str, float]] = {}
        
        logger.info(
            "pipeline_monitor_initialized",
            monitoring_interval=config.monitoring_interval,
            enable_monitoring=config.enable_monitoring
        )
    
    async def monitor_pipeline(self, pipeline_run: PipelineRun) -> asyncio.Task:
        """Start monitoring a pipeline run."""
        if not self.config.enable_monitoring:
            logger.debug("monitoring_disabled")
            return None
        
        monitor_task = asyncio.create_task(
            self._monitor_pipeline_loop(pipeline_run)
        )
        
        self.monitor_tasks[pipeline_run.id] = monitor_task
        
        logger.info(
            "pipeline_monitoring_started",
            run_id=str(pipeline_run.id),
            name=pipeline_run.name
        )
        
        return monitor_task
    
    async def _monitor_pipeline_loop(self, pipeline_run: PipelineRun):
        """Main monitoring loop for a pipeline."""
        try:
            while not pipeline_run.is_complete():
                # Collect current metrics
                await self._collect_pipeline_metrics(pipeline_run)
                
                # Update progress tracking
                if self.config.enable_progress_tracking:
                    self.progress_tracker.update_pipeline_progress(pipeline_run)
                
                # Check for alerts
                current_metrics = self.metric_collector.get_metrics_snapshot()
                await self.alert_manager.check_alerts(pipeline_run, current_metrics)
                
                # Store snapshot in history
                await self._store_monitoring_snapshot(pipeline_run, current_metrics)
                
                # Wait for next monitoring interval
                await asyncio.sleep(self.config.monitoring_interval)
            
            # Final metrics collection
            await self._collect_pipeline_metrics(pipeline_run)
            
        except asyncio.CancelledError:
            logger.info(
                "pipeline_monitoring_cancelled",
                run_id=str(pipeline_run.id)
            )
        except Exception as e:
            logger.error(
                "pipeline_monitoring_error",
                run_id=str(pipeline_run.id),
                error=str(e)
            )
        finally:
            # Clean up
            if pipeline_run.id in self.monitor_tasks:
                del self.monitor_tasks[pipeline_run.id]
    
    async def _collect_pipeline_metrics(self, pipeline_run: PipelineRun):
        """Collect metrics for a pipeline."""
        # Track execution state changes
        for execution in pipeline_run.executions:
            if execution.status == ExecutionStatus.RUNNING and execution.started_at:
                if not hasattr(execution, '_metrics_recorded'):
                    self.metric_collector.record_execution_start(execution)
                    execution._metrics_recorded = True
            
            elif execution.status == ExecutionStatus.SUCCESS and execution.completed_at:
                if not hasattr(execution, '_completion_recorded'):
                    self.metric_collector.record_execution_completion(execution)
                    execution._completion_recorded = True
            
            elif execution.status == ExecutionStatus.FAILURE and execution.completed_at:
                if not hasattr(execution, '_failure_recorded'):
                    self.metric_collector.record_execution_failure(execution)
                    execution._failure_recorded = True
            
            elif execution.status == ExecutionStatus.RETRY:
                if not hasattr(execution, f'_retry_recorded_{execution.attempt_number}'):
                    self.metric_collector.record_retry(execution)
                    setattr(execution, f'_retry_recorded_{execution.attempt_number}', True)
    
    async def _store_monitoring_snapshot(
        self, 
        pipeline_run: PipelineRun, 
        metrics: Dict[str, Any]
    ):
        """Store a monitoring snapshot in history."""
        snapshot = {
            'timestamp': datetime.utcnow().isoformat(),
            'pipeline_status': pipeline_run.status.value,
            'progress_percentage': pipeline_run.progress_percentage,
            'currently_running': pipeline_run.currently_running,
            'completed_agents': pipeline_run.completed_agents,
            'failed_agents': pipeline_run.failed_agents,
            'metrics': metrics
        }
        
        if pipeline_run.id not in self.pipeline_histories:
            self.pipeline_histories[pipeline_run.id] = []
        
        self.pipeline_histories[pipeline_run.id].append(snapshot)
        
        # Limit history size (keep last 1000 snapshots)
        if len(self.pipeline_histories[pipeline_run.id]) > 1000:
            self.pipeline_histories[pipeline_run.id] = self.pipeline_histories[pipeline_run.id][-1000:]
    
    def get_pipeline_metrics(self, run_id: UUID) -> Optional[Dict[str, Any]]:
        """Get current metrics for a pipeline."""
        if run_id not in self.monitor_tasks:
            return None
        
        progress_data = self.progress_tracker.get_progress_summary(run_id)
        current_metrics = self.metric_collector.get_metrics_snapshot()
        
        return {
            'metrics': current_metrics,
            'progress': progress_data,
            'history_length': len(self.pipeline_histories.get(run_id, []))
        }
    
    def get_pipeline_history(
        self, 
        run_id: UUID, 
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get monitoring history for a pipeline."""
        history = self.pipeline_histories.get(run_id, [])
        return history[-limit:] if limit else history
    
    async def get_performance_analysis(self, run_id: UUID) -> Dict[str, Any]:
        """Get comprehensive performance analysis for a pipeline."""
        history = self.pipeline_histories.get(run_id, [])
        if not history:
            return {'analysis': 'No monitoring data available'}
        
        # Calculate performance trends
        progress_trend = [h['progress_percentage'] for h in history[-10:]]
        throughput_trend = [
            h['metrics'].get('throughput_per_minute', 0) 
            for h in history[-10:]
        ]
        
        # Identify bottlenecks
        bottlenecks = []
        if history:
            last_snapshot = history[-1]
            if last_snapshot['currently_running'] < self.config.max_parallel_agents:
                bottlenecks.append("Under-utilized parallel capacity")
            
            high_retry_rate = last_snapshot['metrics'].get('average_retry_rate', 0)
            if high_retry_rate > 25:
                bottlenecks.append("High retry rate indicating instability")
        
        return {
            'progress_trend': progress_trend,
            'throughput_trend': throughput_trend,
            'bottlenecks': bottlenecks,
            'total_snapshots': len(history),
            'monitoring_duration': (
                (datetime.fromisoformat(history[-1]['timestamp']) - 
                 datetime.fromisoformat(history[0]['timestamp'])).total_seconds()
                if len(history) > 1 else 0
            )
        }
    
    async def stop_monitoring(self, run_id: UUID):
        """Stop monitoring a pipeline."""
        if run_id in self.monitor_tasks:
            task = self.monitor_tasks[run_id]
            task.cancel()
            
            try:
                await task
            except asyncio.CancelledError:
                pass
            
            logger.info(
                "pipeline_monitoring_stopped",
                run_id=str(run_id)
            )
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on monitoring system."""
        return {
            'status': 'healthy',
            'active_monitors': len(self.monitor_tasks),
            'total_pipelines_monitored': len(self.pipeline_histories),
            'monitoring_enabled': self.config.enable_monitoring,
            'monitoring_interval': self.config.monitoring_interval,
            'alert_callbacks_registered': len(self.alert_manager.alert_callbacks)
        }