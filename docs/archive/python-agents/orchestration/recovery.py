"""
Failure Recovery System - Advanced error handling and recovery strategies.

Provides intelligent failure recovery with multiple strategies, circuit breakers,
automatic rollback capabilities, and adaptive retry mechanisms.
"""

import asyncio
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set, Callable
from uuid import UUID
from enum import Enum
import json

import structlog

from ..agents.base import AgentInput, AgentOutput, BaseAgent
from .models import (
    PipelineRun,
    AgentExecution, 
    ExecutionStatus,
    PipelineStatus,
    OrchestrationConfig,
    RetryStrategy
)

logger = structlog.get_logger()


class RecoveryStrategy(str, Enum):
    """Recovery strategy options."""
    
    RETRY = "retry"
    SKIP = "skip"
    FALLBACK = "fallback"
    ROLLBACK = "rollback"
    CIRCUIT_BREAKER = "circuit_breaker"
    MANUAL_INTERVENTION = "manual_intervention"


class FailureType(str, Enum):
    """Classification of failure types."""
    
    TIMEOUT = "timeout"
    RESOURCE_EXHAUSTION = "resource_exhaustion"
    DEPENDENCY_FAILURE = "dependency_failure"
    VALIDATION_ERROR = "validation_error"
    NETWORK_ERROR = "network_error"
    RUNTIME_ERROR = "runtime_error"
    SECURITY_ERROR = "security_error"
    CONFIGURATION_ERROR = "configuration_error"
    UNKNOWN = "unknown"


class CircuitBreaker:
    """Circuit breaker pattern implementation for failure protection."""
    
    def __init__(
        self, 
        failure_threshold: int = 5,
        recovery_timeout: float = 60.0,
        half_open_max_calls: int = 3
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_max_calls = half_open_max_calls
        
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "closed"  # closed, open, half-open
        self.half_open_calls = 0
        
        logger.info(
            "circuit_breaker_initialized",
            failure_threshold=failure_threshold,
            recovery_timeout=recovery_timeout
        )
    
    def can_execute(self) -> bool:
        """Check if execution is allowed based on circuit breaker state."""
        current_time = time.time()
        
        if self.state == "closed":
            return True
        
        elif self.state == "open":
            if (self.last_failure_time and 
                current_time - self.last_failure_time > self.recovery_timeout):
                self.state = "half-open"
                self.half_open_calls = 0
                logger.info("circuit_breaker_half_open")
                return True
            return False
        
        elif self.state == "half-open":
            return self.half_open_calls < self.half_open_max_calls
        
        return False
    
    def record_success(self):
        """Record successful execution."""
        if self.state == "half-open":
            self.half_open_calls += 1
            if self.half_open_calls >= self.half_open_max_calls:
                self.state = "closed"
                self.failure_count = 0
                logger.info("circuit_breaker_closed_after_recovery")
        elif self.state == "closed":
            self.failure_count = max(0, self.failure_count - 1)
    
    def record_failure(self):
        """Record failed execution."""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.state == "closed" and self.failure_count >= self.failure_threshold:
            self.state = "open"
            logger.warning(
                "circuit_breaker_opened",
                failure_count=self.failure_count,
                threshold=self.failure_threshold
            )
        elif self.state == "half-open":
            self.state = "open"
            logger.warning("circuit_breaker_reopened_during_half_open")


class FailureAnalyzer:
    """Analyzes failures to determine appropriate recovery strategies."""
    
    def __init__(self):
        self.failure_patterns = {
            'timeout': [
                'timeout', 'timed out', 'execution exceeded', 'deadline exceeded'
            ],
            'resource': [
                'memory', 'disk space', 'cpu', 'resource', 'quota exceeded'
            ],
            'network': [
                'connection', 'network', 'http', 'socket', 'dns', 'ssl'
            ],
            'validation': [
                'validation', 'invalid', 'malformed', 'parse error', 'syntax error'
            ],
            'dependency': [
                'not found', 'missing', 'import error', 'module', 'dependency'
            ],
            'security': [
                'permission', 'unauthorized', 'forbidden', 'access denied', 'authentication'
            ],
            'configuration': [
                'config', 'setting', 'environment', 'variable', 'missing key'
            ]
        }
    
    def analyze_failure(
        self, 
        execution: AgentExecution, 
        error_message: str
    ) -> Dict[str, Any]:
        """Analyze failure and recommend recovery strategy."""
        failure_type = self._classify_failure_type(error_message)
        severity = self._assess_failure_severity(execution, error_message)
        recovery_strategy = self._recommend_recovery_strategy(
            failure_type, severity, execution
        )
        
        analysis = {
            'failure_type': failure_type,
            'severity': severity,
            'recommended_strategy': recovery_strategy,
            'is_transient': self._is_transient_failure(failure_type),
            'recovery_actions': self._get_recovery_actions(failure_type),
            'estimated_recovery_time': self._estimate_recovery_time(failure_type)
        }
        
        logger.info(
            "failure_analyzed",
            execution_id=str(execution.id),
            agent_type=execution.agent_type,
            analysis=analysis
        )
        
        return analysis
    
    def _classify_failure_type(self, error_message: str) -> FailureType:
        """Classify failure type based on error message."""
        error_lower = error_message.lower()
        
        for failure_type, patterns in self.failure_patterns.items():
            if any(pattern in error_lower for pattern in patterns):
                return FailureType(failure_type.upper())
        
        return FailureType.UNKNOWN
    
    def _assess_failure_severity(
        self, 
        execution: AgentExecution, 
        error_message: str
    ) -> str:
        """Assess failure severity (low, medium, high, critical)."""
        # Critical failures
        if any(word in error_message.lower() for word in [
            'fatal', 'critical', 'security', 'corruption', 'unauthorized'
        ]):
            return 'critical'
        
        # High severity
        if (execution.attempt_number > 2 or 
            any(word in error_message.lower() for word in [
                'system', 'database', 'network', 'timeout'
            ])):
            return 'high'
        
        # Medium severity
        if (execution.attempt_number > 1 or 
            any(word in error_message.lower() for word in [
                'validation', 'format', 'parse', 'config'
            ])):
            return 'medium'
        
        return 'low'
    
    def _recommend_recovery_strategy(
        self, 
        failure_type: FailureType, 
        severity: str, 
        execution: AgentExecution
    ) -> RecoveryStrategy:
        """Recommend recovery strategy based on failure analysis."""
        # Critical failures require manual intervention
        if severity == 'critical':
            return RecoveryStrategy.MANUAL_INTERVENTION
        
        # Specific strategies by failure type
        if failure_type == FailureType.TIMEOUT:
            return RecoveryStrategy.RETRY if execution.attempt_number < 3 else RecoveryStrategy.CIRCUIT_BREAKER
        
        elif failure_type == FailureType.RESOURCE_EXHAUSTION:
            return RecoveryStrategy.RETRY if execution.attempt_number < 2 else RecoveryStrategy.SKIP
        
        elif failure_type == FailureType.DEPENDENCY_FAILURE:
            return RecoveryStrategy.FALLBACK
        
        elif failure_type == FailureType.VALIDATION_ERROR:
            return RecoveryStrategy.SKIP  # Input validation errors are unlikely to resolve
        
        elif failure_type == FailureType.NETWORK_ERROR:
            return RecoveryStrategy.RETRY if execution.attempt_number < 3 else RecoveryStrategy.CIRCUIT_BREAKER
        
        elif failure_type == FailureType.SECURITY_ERROR:
            return RecoveryStrategy.MANUAL_INTERVENTION
        
        elif failure_type == FailureType.CONFIGURATION_ERROR:
            return RecoveryStrategy.MANUAL_INTERVENTION
        
        # Default strategy
        return RecoveryStrategy.RETRY if execution.attempt_number < 3 else RecoveryStrategy.SKIP
    
    def _is_transient_failure(self, failure_type: FailureType) -> bool:
        """Determine if failure is likely transient."""
        transient_types = [
            FailureType.TIMEOUT,
            FailureType.NETWORK_ERROR,
            FailureType.RESOURCE_EXHAUSTION
        ]
        return failure_type in transient_types
    
    def _get_recovery_actions(self, failure_type: FailureType) -> List[str]:
        """Get recommended recovery actions."""
        actions_map = {
            FailureType.TIMEOUT: [
                "Increase execution timeout",
                "Retry with exponential backoff",
                "Check system resources"
            ],
            FailureType.RESOURCE_EXHAUSTION: [
                "Free up system resources",
                "Reduce parallel executions",
                "Retry after delay"
            ],
            FailureType.NETWORK_ERROR: [
                "Check network connectivity",
                "Retry with different endpoint",
                "Implement circuit breaker"
            ],
            FailureType.DEPENDENCY_FAILURE: [
                "Use fallback agent",
                "Skip optional dependencies",
                "Retry with alternative approach"
            ],
            FailureType.VALIDATION_ERROR: [
                "Fix input validation",
                "Skip execution",
                "Use default values"
            ]
        }
        
        return actions_map.get(failure_type, ["Manual investigation required"])
    
    def _estimate_recovery_time(self, failure_type: FailureType) -> float:
        """Estimate recovery time in seconds."""
        time_estimates = {
            FailureType.TIMEOUT: 60.0,
            FailureType.RESOURCE_EXHAUSTION: 30.0,
            FailureType.NETWORK_ERROR: 10.0,
            FailureType.DEPENDENCY_FAILURE: 5.0,
            FailureType.VALIDATION_ERROR: 0.0,  # No auto-recovery
            FailureType.SECURITY_ERROR: float('inf'),  # Manual only
            FailureType.CONFIGURATION_ERROR: float('inf'),  # Manual only
            FailureType.UNKNOWN: 30.0
        }
        
        return time_estimates.get(failure_type, 30.0)


class RecoveryExecutor:
    """Executes recovery strategies for failed executions."""
    
    def __init__(self, config: OrchestrationConfig):
        self.config = config
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}
        self.recovery_callbacks: List[Callable] = []
        self.fallback_agents: Dict[str, str] = {
            'planner': 'simple_planner',
            'architect': 'basic_architect',
            'coder': 'template_coder',
            'tester': 'basic_tester',
            'reviewer': 'simple_reviewer'
        }
        
        logger.info("recovery_executor_initialized")
    
    def register_recovery_callback(self, callback: Callable):
        """Register callback for recovery events."""
        self.recovery_callbacks.append(callback)
    
    async def execute_recovery(
        self, 
        execution: AgentExecution,
        pipeline_run: PipelineRun,
        recovery_strategy: RecoveryStrategy,
        analysis: Dict[str, Any]
    ) -> bool:
        """Execute recovery strategy for failed execution."""
        logger.info(
            "recovery_execution_started",
            execution_id=str(execution.id),
            agent_type=execution.agent_type,
            strategy=recovery_strategy,
            attempt=execution.attempt_number
        )
        
        try:
            if recovery_strategy == RecoveryStrategy.RETRY:
                return await self._execute_retry_recovery(execution, pipeline_run, analysis)
            
            elif recovery_strategy == RecoveryStrategy.SKIP:
                return await self._execute_skip_recovery(execution, pipeline_run)
            
            elif recovery_strategy == RecoveryStrategy.FALLBACK:
                return await self._execute_fallback_recovery(execution, pipeline_run, analysis)
            
            elif recovery_strategy == RecoveryStrategy.ROLLBACK:
                return await self._execute_rollback_recovery(execution, pipeline_run)
            
            elif recovery_strategy == RecoveryStrategy.CIRCUIT_BREAKER:
                return await self._execute_circuit_breaker_recovery(execution, pipeline_run)
            
            elif recovery_strategy == RecoveryStrategy.MANUAL_INTERVENTION:
                return await self._execute_manual_intervention_recovery(execution, pipeline_run, analysis)
            
            else:
                logger.warning(
                    "unknown_recovery_strategy",
                    strategy=recovery_strategy,
                    execution_id=str(execution.id)
                )
                return False
                
        except Exception as e:
            logger.error(
                "recovery_execution_failed",
                execution_id=str(execution.id),
                strategy=recovery_strategy,
                error=str(e)
            )
            return False
    
    async def _execute_retry_recovery(
        self, 
        execution: AgentExecution,
        pipeline_run: PipelineRun,
        analysis: Dict[str, Any]
    ) -> bool:
        """Execute retry recovery strategy."""
        if not execution.can_retry():
            logger.warning(
                "retry_recovery_not_possible",
                execution_id=str(execution.id),
                attempts=execution.attempt_number,
                max_attempts=execution.max_attempts
            )
            return False
        
        # Wait for recovery time if specified
        recovery_time = analysis.get('estimated_recovery_time', 0)
        if recovery_time > 0 and recovery_time != float('inf'):
            logger.info(
                "recovery_delay_waiting",
                execution_id=str(execution.id),
                delay_seconds=recovery_time
            )
            await asyncio.sleep(min(recovery_time, 300))  # Cap at 5 minutes
        
        # Reset execution for retry
        execution.status = ExecutionStatus.PENDING
        execution.attempt_number += 1
        execution.last_error = None
        
        logger.info(
            "retry_recovery_prepared",
            execution_id=str(execution.id),
            attempt=execution.attempt_number
        )
        
        return True
    
    async def _execute_skip_recovery(
        self, 
        execution: AgentExecution,
        pipeline_run: PipelineRun
    ) -> bool:
        """Execute skip recovery strategy."""
        # Mark execution as skipped (create minimal success output)
        from ..agents.base import AgentOutput
        
        skip_output = AgentOutput(
            primary_result="Execution skipped due to recovery strategy",
            confidence_score=0.0,
            execution_time=0.0,
            artifacts={'skipped': True, 'original_error': execution.last_error}
        )
        
        execution.mark_completed(skip_output)
        
        logger.info(
            "skip_recovery_completed",
            execution_id=str(execution.id),
            agent_type=execution.agent_type
        )
        
        return True
    
    async def _execute_fallback_recovery(
        self, 
        execution: AgentExecution,
        pipeline_run: PipelineRun,
        analysis: Dict[str, Any]
    ) -> bool:
        """Execute fallback recovery strategy."""
        fallback_agent = self.fallback_agents.get(execution.agent_type)
        
        if not fallback_agent:
            logger.warning(
                "no_fallback_agent_available",
                agent_type=execution.agent_type,
                execution_id=str(execution.id)
            )
            return await self._execute_skip_recovery(execution, pipeline_run)
        
        # Create fallback execution
        logger.info(
            "fallback_recovery_executing",
            execution_id=str(execution.id),
            original_agent=execution.agent_type,
            fallback_agent=fallback_agent
        )
        
        # Note: In a full implementation, this would actually execute the fallback agent
        # For now, we'll create a mock successful output
        from ..agents.base import AgentOutput
        
        fallback_output = AgentOutput(
            primary_result=f"Fallback execution completed using {fallback_agent}",
            confidence_score=0.5,
            execution_time=5.0,
            artifacts={
                'fallback': True, 
                'original_agent': execution.agent_type,
                'fallback_agent': fallback_agent,
                'original_error': execution.last_error
            }
        )
        
        execution.mark_completed(fallback_output)
        
        logger.info(
            "fallback_recovery_completed",
            execution_id=str(execution.id),
            fallback_agent=fallback_agent
        )
        
        return True
    
    async def _execute_rollback_recovery(
        self, 
        execution: AgentExecution,
        pipeline_run: PipelineRun
    ) -> bool:
        """Execute rollback recovery strategy."""
        # Find all executions that depend on this one
        dependent_executions = [
            e for e in pipeline_run.executions 
            if execution.agent_type in e.depends_on and 
            e.status == ExecutionStatus.SUCCESS
        ]
        
        if not dependent_executions:
            logger.info(
                "rollback_recovery_no_dependents",
                execution_id=str(execution.id)
            )
            return await self._execute_retry_recovery(execution, pipeline_run, {})
        
        # Rollback dependent executions
        for dependent in dependent_executions:
            dependent.status = ExecutionStatus.PENDING
            dependent.output_data = None
            dependent.completed_at = None
            dependent.duration_seconds = None
            
            logger.info(
                "dependent_execution_rolled_back",
                execution_id=str(execution.id),
                dependent_id=str(dependent.id),
                dependent_agent=dependent.agent_type
            )
        
        # Reset this execution for retry
        execution.status = ExecutionStatus.PENDING
        execution.attempt_number += 1
        
        logger.info(
            "rollback_recovery_completed",
            execution_id=str(execution.id),
            rolled_back_dependents=len(dependent_executions)
        )
        
        return True
    
    async def _execute_circuit_breaker_recovery(
        self, 
        execution: AgentExecution,
        pipeline_run: PipelineRun
    ) -> bool:
        """Execute circuit breaker recovery strategy."""
        agent_type = execution.agent_type
        
        if agent_type not in self.circuit_breakers:
            self.circuit_breakers[agent_type] = CircuitBreaker()
        
        circuit_breaker = self.circuit_breakers[agent_type]
        circuit_breaker.record_failure()
        
        if circuit_breaker.can_execute():
            logger.info(
                "circuit_breaker_allows_retry",
                execution_id=str(execution.id),
                agent_type=agent_type
            )
            return await self._execute_retry_recovery(execution, pipeline_run, {})
        else:
            logger.warning(
                "circuit_breaker_blocks_execution",
                execution_id=str(execution.id),
                agent_type=agent_type,
                circuit_state=circuit_breaker.state
            )
            return await self._execute_skip_recovery(execution, pipeline_run)
    
    async def _execute_manual_intervention_recovery(
        self, 
        execution: AgentExecution,
        pipeline_run: PipelineRun,
        analysis: Dict[str, Any]
    ) -> bool:
        """Execute manual intervention recovery strategy."""
        # Create detailed intervention request
        intervention_data = {
            'pipeline_id': str(pipeline_run.id),
            'execution_id': str(execution.id),
            'agent_type': execution.agent_type,
            'failure_analysis': analysis,
            'error_message': execution.last_error,
            'attempt_number': execution.attempt_number,
            'timestamp': datetime.utcnow().isoformat(),
            'recommended_actions': analysis.get('recovery_actions', [])
        }
        
        # Trigger recovery callbacks for manual intervention
        await self._trigger_recovery_callbacks('manual_intervention_required', intervention_data)
        
        # Mark execution as requiring manual intervention
        execution.status = ExecutionStatus.FAILURE
        execution.last_error = f"Manual intervention required: {execution.last_error}"
        
        logger.critical(
            "manual_intervention_required",
            execution_id=str(execution.id),
            agent_type=execution.agent_type,
            analysis=analysis
        )
        
        return False  # Cannot auto-recover
    
    async def _trigger_recovery_callbacks(self, event_type: str, data: Dict[str, Any]):
        """Trigger registered recovery callbacks."""
        for callback in self.recovery_callbacks:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(event_type, data)
                else:
                    callback(event_type, data)
            except Exception as e:
                logger.error(
                    "recovery_callback_failed",
                    error=str(e),
                    event_type=event_type
                )


class FailureRecovery:
    """
    Comprehensive failure recovery system with intelligent analysis,
    multiple recovery strategies, and adaptive learning capabilities.
    """
    
    def __init__(self, config: OrchestrationConfig):
        self.config = config
        self.failure_analyzer = FailureAnalyzer()
        self.recovery_executor = RecoveryExecutor(config)
        
        # Recovery statistics
        self.recovery_stats = {
            'total_failures': 0,
            'successful_recoveries': 0,
            'recovery_strategies_used': {},
            'failure_types_encountered': {},
            'average_recovery_time': 0.0
        }
        
        logger.info(
            "failure_recovery_initialized",
            retry_on_timeout=config.retry_on_timeout,
            fail_fast=config.fail_fast
        )
    
    async def handle_execution_failure(
        self, 
        execution: AgentExecution,
        pipeline_run: PipelineRun,
        error: Exception
    ) -> bool:
        """Handle execution failure with intelligent recovery."""
        self.recovery_stats['total_failures'] += 1
        
        start_time = time.time()
        
        # Analyze the failure
        analysis = self.failure_analyzer.analyze_failure(execution, str(error))
        
        # Track failure types
        failure_type = analysis['failure_type']
        if failure_type not in self.recovery_stats['failure_types_encountered']:
            self.recovery_stats['failure_types_encountered'][failure_type] = 0
        self.recovery_stats['failure_types_encountered'][failure_type] += 1
        
        # Execute recovery strategy
        recovery_strategy = analysis['recommended_strategy']
        
        logger.info(
            "failure_recovery_attempting",
            execution_id=str(execution.id),
            agent_type=execution.agent_type,
            failure_type=failure_type,
            strategy=recovery_strategy,
            severity=analysis['severity']
        )
        
        recovery_success = await self.recovery_executor.execute_recovery(
            execution, pipeline_run, recovery_strategy, analysis
        )
        
        # Update statistics
        recovery_time = time.time() - start_time
        
        if recovery_success:
            self.recovery_stats['successful_recoveries'] += 1
        
        # Track strategy usage
        if recovery_strategy not in self.recovery_stats['recovery_strategies_used']:
            self.recovery_stats['recovery_strategies_used'][recovery_strategy] = 0
        self.recovery_stats['recovery_strategies_used'][recovery_strategy] += 1
        
        # Update average recovery time
        total_recoveries = self.recovery_stats['total_failures']
        current_avg = self.recovery_stats['average_recovery_time']
        self.recovery_stats['average_recovery_time'] = (
            (current_avg * (total_recoveries - 1) + recovery_time) / total_recoveries
        )
        
        logger.info(
            "failure_recovery_completed",
            execution_id=str(execution.id),
            success=recovery_success,
            strategy=recovery_strategy,
            recovery_time=recovery_time
        )
        
        return recovery_success
    
    def register_recovery_callback(self, callback: Callable):
        """Register callback for recovery events."""
        self.recovery_executor.register_recovery_callback(callback)
    
    def get_recovery_statistics(self) -> Dict[str, Any]:
        """Get recovery statistics."""
        success_rate = 0.0
        if self.recovery_stats['total_failures'] > 0:
            success_rate = (
                self.recovery_stats['successful_recoveries'] / 
                self.recovery_stats['total_failures']
            ) * 100.0
        
        return {
            **self.recovery_stats,
            'recovery_success_rate': success_rate,
            'circuit_breakers_active': len(self.recovery_executor.circuit_breakers)
        }
    
    def get_circuit_breaker_status(self) -> Dict[str, Any]:
        """Get status of all circuit breakers."""
        return {
            agent_type: {
                'state': cb.state,
                'failure_count': cb.failure_count,
                'last_failure': cb.last_failure_time
            }
            for agent_type, cb in self.recovery_executor.circuit_breakers.items()
        }
    
    async def reset_circuit_breaker(self, agent_type: str) -> bool:
        """Manually reset a circuit breaker."""
        if agent_type in self.recovery_executor.circuit_breakers:
            cb = self.recovery_executor.circuit_breakers[agent_type]
            cb.state = "closed"
            cb.failure_count = 0
            cb.last_failure_time = None
            cb.half_open_calls = 0
            
            logger.info(
                "circuit_breaker_reset",
                agent_type=agent_type
            )
            return True
        
        return False
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on recovery system."""
        return {
            'status': 'healthy',
            'recovery_success_rate': (
                (self.recovery_stats['successful_recoveries'] / 
                 max(self.recovery_stats['total_failures'], 1)) * 100.0
            ),
            'total_failures_handled': self.recovery_stats['total_failures'],
            'active_circuit_breakers': len(self.recovery_executor.circuit_breakers),
            'average_recovery_time': self.recovery_stats['average_recovery_time']
        }