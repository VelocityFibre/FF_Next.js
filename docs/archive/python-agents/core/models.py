"""ForgeFlow Core Pydantic Models.

This module defines the core data models for the ForgeFlow orchestrator,
following the specifications from the PRD and using Pydantic v2 for validation.
"""

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Union
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


# Task Models
class Task(BaseModel):
    """Represents a single task in the orchestration pipeline."""
    
    model_config = ConfigDict(
        str_strip_whitespace=True,
        validate_assignment=True,
        use_enum_values=True,
        extra="forbid"  # Reject extra fields
    )
    
    id: UUID = Field(..., description="Unique task identifier")
    kind: Literal["plan", "design", "code", "test", "review", "debug", "research"] = Field(
        ..., description="Type of task to execute"
    )
    description: str = Field(..., description="Task description")
    status: Literal["pending", "running", "done", "error"] = Field(
        default="pending", description="Current task status"
    )
    attempts: int = Field(default=0, ge=0, description="Number of execution attempts")
    parent_id: Optional[UUID] = Field(default=None, description="Parent task ID for subtasks")
    inputs: Dict[str, Any] = Field(default_factory=dict, description="Task input parameters")
    outputs: Dict[str, Any] = Field(default_factory=dict, description="Task output data")
    error_details: Optional[Dict[str, Any]] = Field(default=None, description="Error information if failed")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Task creation time")
    started_at: Optional[datetime] = Field(default=None, description="Task start time")
    completed_at: Optional[datetime] = Field(default=None, description="Task completion time")
    
    def model_dump_json(self, **kwargs) -> str:
        """Override to ensure proper JSON serialization."""
        kwargs.setdefault("mode", "json")
        return super().model_dump_json(**kwargs)


# Policy Configuration
class PolicyConfig(BaseModel):
    """Configuration for task execution policies."""
    
    model_config = ConfigDict(extra="forbid")
    
    max_retries: int = Field(default=3, ge=0, le=10, description="Maximum retry attempts")
    lint: Literal["strict", "standard", "loose"] = Field(
        default="standard", description="Linting strictness level"
    )
    test: Literal["required", "optional", "skip"] = Field(
        default="required", description="Testing requirement level"
    )
    timeout_seconds: int = Field(
        default=3600, ge=60, le=86400, description="Task timeout in seconds"
    )


# Run Request/Response Models
class RunRequest(BaseModel):
    """Request to create a new orchestrator run."""
    
    model_config = ConfigDict(extra="forbid")
    
    project_id: str = Field(..., min_length=1, max_length=255, description="Project identifier")
    feature_brief: Union[str, Dict[str, Any]] = Field(
        ..., description="Feature description or structured brief"
    )
    repo_url: Optional[str] = Field(default=None, max_length=500, description="Git repository URL")
    branch: str = Field(default="main", max_length=255, description="Git branch name")
    policies: Optional[PolicyConfig] = Field(default=None, description="Execution policies")
    
    @field_validator("repo_url")
    @classmethod
    def validate_repo_url(cls, v: Optional[str]) -> Optional[str]:
        """Validate repository URL format."""
        if v and not (v.startswith("http://") or v.startswith("https://") or v.startswith("git@")):
            raise ValueError("Repository URL must be a valid git URL")
        return v


class RunResponse(BaseModel):
    """Response after creating a new run."""
    
    model_config = ConfigDict(extra="forbid")
    
    status: str = Field(..., description="Run status")
    run_id: UUID = Field(..., description="Unique run identifier")
    events_url: str = Field(..., description="SSE events endpoint URL")
    status_url: str = Field(..., description="Status endpoint URL")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Run creation time")


# Run State and Metrics
class RunMetrics(BaseModel):
    """Metrics for a run execution."""
    
    model_config = ConfigDict(extra="forbid")
    
    total_tasks: int = Field(default=0, ge=0, description="Total number of tasks")
    completed_tasks: int = Field(default=0, ge=0, description="Number of completed tasks")
    failed_tasks: int = Field(default=0, ge=0, description="Number of failed tasks")
    duration_seconds: float = Field(default=0.0, ge=0, description="Total duration in seconds")
    token_usage: Optional[int] = Field(default=None, ge=0, description="LLM token usage")
    cost_usd: Optional[float] = Field(default=None, ge=0, description="Estimated cost in USD")


class ArtifactInfo(BaseModel):
    """Information about a generated artifact."""
    
    model_config = ConfigDict(extra="forbid")
    
    id: UUID = Field(..., description="Artifact identifier")
    type: str = Field(..., max_length=100, description="Artifact type")
    name: str = Field(..., max_length=255, description="Artifact name")
    size_bytes: Optional[int] = Field(default=None, ge=0, description="Size in bytes")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation time")


class RunState(BaseModel):
    """Current state of an orchestrator run."""
    
    model_config = ConfigDict(extra="forbid")
    
    run_id: UUID = Field(..., description="Run identifier")
    project_id: str = Field(..., description="Project identifier")
    status: Literal["pending", "planning", "coding", "testing", "reviewing", "completed", "failed"] = Field(
        default="pending", description="Current run status"
    )
    current_phase: Optional[str] = Field(default=None, description="Current execution phase")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Run creation time")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update time")
    completed_at: Optional[datetime] = Field(default=None, description="Completion time")
    completed_tasks: List[UUID] = Field(default_factory=list, description="List of completed task IDs")
    artifacts: List[ArtifactInfo] = Field(default_factory=list, description="Generated artifacts")
    metrics: Optional[RunMetrics] = Field(default=None, description="Run metrics")
    error: Optional[str] = Field(default=None, description="Error message if failed")


# Agent Models
class AgentIO(BaseModel):
    """Input/Output for agent execution."""
    
    model_config = ConfigDict(extra="forbid")
    
    task_id: UUID = Field(..., description="Associated task ID")
    success: bool = Field(..., description="Whether execution was successful")
    output: Dict[str, Any] = Field(default_factory=dict, description="Agent output data")
    errors: List[str] = Field(default_factory=list, description="Error messages if any")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence score")
    next_steps: List[str] = Field(default_factory=list, description="Suggested next steps")


class AgentSpec(BaseModel):
    """Specification for an agent."""
    
    model_config = ConfigDict(extra="forbid")
    
    name: str = Field(..., min_length=1, max_length=50, description="Agent name")
    role: str = Field(..., description="Agent role description")
    tools: List[str] = Field(default_factory=list, description="Allowed tools")
    max_retries: int = Field(default=3, ge=0, le=10, description="Max retry attempts")
    timeout_seconds: int = Field(default=3600, ge=60, le=86400, description="Execution timeout")
    system_prompt: Optional[str] = Field(default=None, description="System prompt for LLM")


# Event Models
class FailureEvent(BaseModel):
    """Event emitted when a task fails."""
    
    model_config = ConfigDict(extra="forbid")
    
    task_id: UUID = Field(..., description="Failed task ID")
    type: Literal["compile", "lint", "test", "network", "tool"] = Field(
        ..., description="Type of failure"
    )
    log_excerpt: str = Field(..., description="Relevant log excerpt")
    severity: Literal["low", "medium", "high", "critical"] = Field(
        default="medium", description="Failure severity"
    )
    recovery_suggestions: List[str] = Field(
        default_factory=list, description="Suggested recovery actions"
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Event timestamp")


class StatusEvent(BaseModel):
    """Status update event for SSE streaming."""
    
    model_config = ConfigDict(extra="forbid")
    
    event_id: UUID = Field(..., description="Event identifier")
    run_id: UUID = Field(..., description="Associated run ID")
    event_type: Literal["status_update", "phase_change", "artifact_ready", "error", "heartbeat", "complete"] = Field(
        ..., description="Type of event"
    )
    phase: Optional[str] = Field(default=None, description="Current phase")
    message: str = Field(..., description="Event message")
    details: Dict[str, Any] = Field(default_factory=dict, description="Additional details")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Event timestamp")


# Memory Models (for future phases)
class MemoryRecord(BaseModel):
    """Record stored in memory layer."""
    
    model_config = ConfigDict(extra="forbid")
    
    id: UUID = Field(..., description="Record identifier")
    project_id: str = Field(..., description="Associated project")
    type: Literal["summary", "fix", "snippet", "decision", "spec"] = Field(
        ..., description="Type of memory record"
    )
    content: str = Field(..., description="Record content")
    tags: List[str] = Field(default_factory=list, description="Searchable tags")
    importance: Literal["low", "normal", "high"] = Field(
        default="normal", description="Importance level"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation time")
    accessed_at: datetime = Field(default_factory=datetime.utcnow, description="Last access time")
    access_count: int = Field(default=0, ge=0, description="Number of times accessed")
    embedding: Optional[List[float]] = Field(default=None, description="Vector embedding")


# Helper type exports
__all__ = [
    "Task",
    "PolicyConfig",
    "RunRequest",
    "RunResponse",
    "RunMetrics",
    "ArtifactInfo",
    "RunState",
    "AgentIO",
    "AgentSpec",
    "FailureEvent",
    "StatusEvent",
    "MemoryRecord",
]