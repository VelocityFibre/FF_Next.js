"""
Orchestration data models for ForgeFlow pipeline management.
"""

import asyncio
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Union
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from ..agents.base import AgentInput, AgentOutput


class ExecutionStatus(str, Enum):
    """Agent execution status values."""
    
    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running"
    SUCCESS = "success"
    FAILURE = "failure"
    CANCELLED = "cancelled"
    RETRY = "retry"
    TIMEOUT = "timeout"


class PipelineStatus(str, Enum):
    """Pipeline execution status values."""
    
    CREATED = "created"
    QUEUED = "queued"
    RUNNING = "running"
    PAUSED = "paused"
    SUCCESS = "success"
    FAILURE = "failure"
    CANCELLED = "cancelled"
    PARTIAL_SUCCESS = "partial_success"


class RetryStrategy(str, Enum):
    """Retry strategy options."""
    
    NONE = "none"
    IMMEDIATE = "immediate"
    EXPONENTIAL_BACKOFF = "exponential_backoff"
    LINEAR_BACKOFF = "linear_backoff"
    FIXED_DELAY = "fixed_delay"


class AgentExecution(BaseModel):
    """Individual agent execution tracking."""
    
    id: UUID = Field(default_factory=uuid4)
    agent_type: str = Field(..., description="Type of agent being executed")
    run_id: UUID = Field(..., description="Parent pipeline run ID")
    
    # Execution state
    status: ExecutionStatus = Field(default=ExecutionStatus.PENDING)
    input_data: Optional[AgentInput] = Field(default=None)
    output_data: Optional[AgentOutput] = Field(default=None)
    
    # Timing
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    duration_seconds: Optional[float] = Field(default=None)
    
    # Retry handling
    attempt_number: int = Field(default=1, ge=1)
    max_attempts: int = Field(default=3, ge=1)
    retry_strategy: RetryStrategy = Field(default=RetryStrategy.EXPONENTIAL_BACKOFF)
    last_error: Optional[str] = Field(default=None)
    
    # Dependencies
    depends_on: List[str] = Field(default_factory=list, description="Agent types this depends on")
    blocking: List[str] = Field(default_factory=list, description="Agent types blocked by this")
    
    # Resources
    priority: int = Field(default=50, ge=1, le=100, description="Execution priority (1-100)")
    resource_requirements: Dict[str, Any] = Field(default_factory=dict)
    estimated_duration: Optional[float] = Field(default=None)
    
    # Progress tracking
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    current_step: Optional[str] = Field(default=None)
    steps_completed: int = Field(default=0, ge=0)
    total_steps: int = Field(default=1, ge=1)
    
    def mark_started(self):
        """Mark execution as started."""
        self.status = ExecutionStatus.RUNNING
        self.started_at = datetime.utcnow()
    
    def mark_completed(self, output: AgentOutput):
        """Mark execution as completed successfully."""
        self.status = ExecutionStatus.SUCCESS
        self.output_data = output
        self.completed_at = datetime.utcnow()
        self.progress_percentage = 100.0
        
        if self.started_at:
            self.duration_seconds = (self.completed_at - self.started_at).total_seconds()
    
    def mark_failed(self, error: str):
        """Mark execution as failed."""
        self.status = ExecutionStatus.FAILURE
        self.last_error = error
        self.completed_at = datetime.utcnow()
        
        if self.started_at:
            self.duration_seconds = (self.completed_at - self.started_at).total_seconds()
    
    def can_retry(self) -> bool:
        """Check if this execution can be retried."""
        return (
            self.attempt_number < self.max_attempts and
            self.status in [ExecutionStatus.FAILURE, ExecutionStatus.TIMEOUT] and
            self.retry_strategy != RetryStrategy.NONE
        )
    
    def get_retry_delay(self) -> float:
        """Calculate retry delay in seconds."""
        base_delay = 1.0
        
        if self.retry_strategy == RetryStrategy.IMMEDIATE:
            return 0.0
        elif self.retry_strategy == RetryStrategy.EXPONENTIAL_BACKOFF:
            return base_delay * (2 ** (self.attempt_number - 1))
        elif self.retry_strategy == RetryStrategy.LINEAR_BACKOFF:
            return base_delay * self.attempt_number
        elif self.retry_strategy == RetryStrategy.FIXED_DELAY:
            return base_delay
        else:
            return 0.0


class PipelineRun(BaseModel):
    """Complete pipeline execution tracking."""
    
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Human-readable pipeline name")
    feature_brief: str = Field(..., description="Original feature description")
    
    # Execution state
    status: PipelineStatus = Field(default=PipelineStatus.CREATED)
    executions: List[AgentExecution] = Field(default_factory=list)
    
    # Configuration
    project_context: Dict[str, Any] = Field(default_factory=dict)
    orchestration_config: 'OrchestrationConfig' = Field(default_factory=lambda: OrchestrationConfig())
    
    # Timing
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    duration_seconds: Optional[float] = Field(default=None)
    
    # Results
    artifacts: Dict[str, Any] = Field(default_factory=dict)
    final_output: Optional[Dict[str, Any]] = Field(default=None)
    
    # Metrics
    total_agents: int = Field(default=0, ge=0)
    completed_agents: int = Field(default=0, ge=0)
    failed_agents: int = Field(default=0, ge=0)
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    
    # Parallelization tracking
    max_parallel: int = Field(default=1, ge=1, description="Maximum parallel executions")
    currently_running: int = Field(default=0, ge=0)
    
    def add_execution(self, agent_type: str, depends_on: Optional[List[str]] = None) -> AgentExecution:
        """Add a new agent execution to the pipeline."""
        execution = AgentExecution(
            agent_type=agent_type,
            run_id=self.id,
            depends_on=depends_on or [],
            max_attempts=self.orchestration_config.default_max_attempts,
            retry_strategy=self.orchestration_config.default_retry_strategy
        )
        
        self.executions.append(execution)
        self.total_agents += 1
        return execution
    
    def get_execution(self, agent_type: str) -> Optional[AgentExecution]:
        """Get execution by agent type."""
        for execution in self.executions:
            if execution.agent_type == agent_type:
                return execution
        return None
    
    def get_ready_executions(self) -> List[AgentExecution]:
        """Get executions that are ready to run (dependencies satisfied)."""
        ready = []
        
        for execution in self.executions:
            if execution.status != ExecutionStatus.PENDING:
                continue
                
            # Check if all dependencies are satisfied
            dependencies_satisfied = True
            for dep_agent_type in execution.depends_on:
                dep_execution = self.get_execution(dep_agent_type)
                if not dep_execution or dep_execution.status != ExecutionStatus.SUCCESS:
                    dependencies_satisfied = False
                    break
            
            if dependencies_satisfied:
                ready.append(execution)
        
        # Sort by priority (higher priority first)
        return sorted(ready, key=lambda x: x.priority, reverse=True)
    
    def can_run_parallel(self) -> bool:
        """Check if more agents can run in parallel."""
        return self.currently_running < self.max_parallel
    
    def update_progress(self):
        """Update overall pipeline progress."""
        if self.total_agents == 0:
            self.progress_percentage = 0.0
            return
        
        completed = sum(1 for e in self.executions if e.status == ExecutionStatus.SUCCESS)
        self.completed_agents = completed
        self.failed_agents = sum(1 for e in self.executions if e.status == ExecutionStatus.FAILURE)
        self.progress_percentage = (completed / self.total_agents) * 100.0
    
    def mark_started(self):
        """Mark pipeline as started."""
        self.status = PipelineStatus.RUNNING
        self.started_at = datetime.utcnow()
    
    def mark_completed(self):
        """Mark pipeline as completed."""
        self.completed_at = datetime.utcnow()
        
        if self.started_at:
            self.duration_seconds = (self.completed_at - self.started_at).total_seconds()
        
        # Determine final status
        if all(e.status == ExecutionStatus.SUCCESS for e in self.executions):
            self.status = PipelineStatus.SUCCESS
        elif any(e.status == ExecutionStatus.SUCCESS for e in self.executions):
            self.status = PipelineStatus.PARTIAL_SUCCESS
        else:
            self.status = PipelineStatus.FAILURE
    
    def is_complete(self) -> bool:
        """Check if pipeline execution is complete."""
        return all(e.status in [ExecutionStatus.SUCCESS, ExecutionStatus.FAILURE, ExecutionStatus.CANCELLED] 
                  for e in self.executions)


class OrchestrationConfig(BaseModel):
    """Configuration for pipeline orchestration."""
    
    # Execution settings
    max_parallel_agents: int = Field(default=3, ge=1, le=10, description="Maximum parallel agent executions")
    execution_timeout: float = Field(default=600.0, gt=0, description="Maximum execution time per agent (seconds)")
    pipeline_timeout: float = Field(default=3600.0, gt=0, description="Maximum total pipeline time (seconds)")
    
    # Retry settings
    default_max_attempts: int = Field(default=3, ge=1, le=10)
    default_retry_strategy: RetryStrategy = Field(default=RetryStrategy.EXPONENTIAL_BACKOFF)
    retry_on_timeout: bool = Field(default=True)
    
    # Resource management
    enable_resource_limits: bool = Field(default=True)
    max_memory_mb: Optional[int] = Field(default=None, gt=0)
    max_cpu_percent: Optional[float] = Field(default=None, gt=0, le=100)
    
    # Monitoring
    enable_monitoring: bool = Field(default=True)
    monitoring_interval: float = Field(default=5.0, gt=0, description="Monitoring check interval (seconds)")
    enable_progress_tracking: bool = Field(default=True)
    
    # Failure handling
    fail_fast: bool = Field(default=False, description="Stop pipeline on first failure")
    continue_on_optional_failure: bool = Field(default=True)
    
    # Optimization
    enable_pipeline_optimization: bool = Field(default=True, description="Optimize execution order")
    enable_caching: bool = Field(default=True, description="Cache agent outputs")
    cache_ttl_seconds: int = Field(default=3600, ge=0, description="Cache time-to-live")


class PipelineResult(BaseModel):
    """Final pipeline execution result."""
    
    run_id: UUID = Field(..., description="Pipeline run identifier")
    status: PipelineStatus = Field(..., description="Final pipeline status")
    
    # Timing
    duration_seconds: float = Field(..., ge=0)
    started_at: datetime = Field(...)
    completed_at: datetime = Field(...)
    
    # Results
    successful_agents: List[str] = Field(default_factory=list)
    failed_agents: List[str] = Field(default_factory=list)
    artifacts: Dict[str, Any] = Field(default_factory=dict)
    
    # Metrics
    total_execution_time: float = Field(default=0.0, ge=0)
    parallel_efficiency: float = Field(default=0.0, ge=0, le=1.0)
    retry_count: int = Field(default=0, ge=0)
    
    # Outputs from each agent
    agent_outputs: Dict[str, AgentOutput] = Field(default_factory=dict)
    
    def add_agent_output(self, agent_type: str, output: AgentOutput):
        """Add output from a successful agent."""
        self.agent_outputs[agent_type] = output
        if agent_type not in self.successful_agents:
            self.successful_agents.append(agent_type)
    
    def is_successful(self) -> bool:
        """Check if pipeline completed successfully."""
        return self.status in [PipelineStatus.SUCCESS, PipelineStatus.PARTIAL_SUCCESS]
    
    def get_success_rate(self) -> float:
        """Calculate success rate as percentage."""
        total = len(self.successful_agents) + len(self.failed_agents)
        if total == 0:
            return 0.0
        return (len(self.successful_agents) / total) * 100.0


# Update forward references
OrchestrationConfig.model_rebuild()
PipelineRun.model_rebuild()