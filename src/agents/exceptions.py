"""
Agent system exceptions for ForgeFlow.

Provides structured error handling with recovery guidance.
"""

from typing import Dict, List, Optional, Any
from uuid import UUID


class AgentError(Exception):
    """Base exception for all agent-related errors."""
    
    def __init__(
        self,
        message: str,
        agent_type: Optional[str] = None,
        execution_id: Optional[UUID] = None,
        recovery_suggestions: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.agent_type = agent_type
        self.execution_id = execution_id
        self.recovery_suggestions = recovery_suggestions or []
        self.metadata = metadata or {}


class AgentExecutionError(AgentError):
    """Raised when agent execution fails."""
    
    def __init__(
        self,
        message: str,
        agent_type: Optional[str] = None,
        execution_id: Optional[UUID] = None,
        phase: Optional[str] = None,
        original_error: Optional[Exception] = None,
        **kwargs
    ):
        super().__init__(message, agent_type, execution_id, **kwargs)
        self.phase = phase
        self.original_error = original_error


class AgentConfigurationError(AgentError):
    """Raised when agent configuration is invalid."""
    
    def __init__(
        self,
        message: str,
        agent_type: Optional[str] = None,
        config_field: Optional[str] = None,
        **kwargs
    ):
        super().__init__(message, agent_type, **kwargs)
        self.config_field = config_field


class AgentNotFoundError(AgentError):
    """Raised when requested agent type is not found."""
    
    def __init__(
        self,
        agent_type: str,
        available_agents: Optional[List[str]] = None,
        **kwargs
    ):
        message = f"Agent type '{agent_type}' not found"
        if available_agents:
            message += f". Available agents: {', '.join(available_agents)}"
        
        super().__init__(message, agent_type, **kwargs)
        self.available_agents = available_agents or []


class AgentToolError(AgentError):
    """Raised when agent tool execution fails."""
    
    def __init__(
        self,
        message: str,
        agent_type: Optional[str] = None,
        tool_name: Optional[str] = None,
        tool_error: Optional[Exception] = None,
        **kwargs
    ):
        super().__init__(message, agent_type, **kwargs)
        self.tool_name = tool_name
        self.tool_error = tool_error


class AgentTimeoutError(AgentError):
    """Raised when agent execution times out."""
    
    def __init__(
        self,
        message: str,
        agent_type: Optional[str] = None,
        timeout_seconds: Optional[int] = None,
        **kwargs
    ):
        super().__init__(message, agent_type, **kwargs)
        self.timeout_seconds = timeout_seconds


class AgentValidationError(AgentError):
    """Raised when agent input/output validation fails."""
    
    def __init__(
        self,
        message: str,
        agent_type: Optional[str] = None,
        validation_type: Optional[str] = None,  # "input" or "output"
        validation_errors: Optional[List[str]] = None,
        **kwargs
    ):
        super().__init__(message, agent_type, **kwargs)
        self.validation_type = validation_type
        self.validation_errors = validation_errors or []


class AgentDependencyError(AgentError):
    """Raised when agent dependencies are not met."""
    
    def __init__(
        self,
        message: str,
        agent_type: Optional[str] = None,
        missing_dependencies: Optional[List[str]] = None,
        **kwargs
    ):
        super().__init__(message, agent_type, **kwargs)
        self.missing_dependencies = missing_dependencies or []


class AgentCapabilityError(AgentError):
    """Raised when required capability is not available."""
    
    def __init__(
        self,
        message: str,
        agent_type: Optional[str] = None,
        required_capability: Optional[str] = None,
        available_capabilities: Optional[List[str]] = None,
        **kwargs
    ):
        super().__init__(message, agent_type, **kwargs)
        self.required_capability = required_capability
        self.available_capabilities = available_capabilities or []