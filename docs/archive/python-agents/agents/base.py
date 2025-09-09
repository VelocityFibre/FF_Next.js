"""
Base Agent Architecture for ForgeFlow

Provides extensible foundation for all agents with:
- Standardized I/O interfaces
- Plugin registration system
- Capability declarations
- Hot-reload support
"""

import asyncio
from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Type, Union, Set
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, ConfigDict
import structlog

logger = structlog.get_logger()


class AgentCapability(str, Enum):
    """Agent capability declarations for discovery and composition."""
    
    # Core capabilities
    PLANNING = "planning"
    ARCHITECTURE = "architecture" 
    CODE_GENERATION = "code_generation"
    TESTING = "testing"
    REVIEW = "review"
    
    # Extended capabilities for future agents
    DEBUGGING = "debugging"
    RESEARCH = "research"
    DOCUMENTATION = "documentation"
    OPTIMIZATION = "optimization"
    SECURITY = "security"
    DEPLOYMENT = "deployment"
    MONITORING = "monitoring"
    
    # Specialized capabilities
    UI_GENERATION = "ui_generation"
    API_DESIGN = "api_design"
    DATABASE_DESIGN = "database_design"
    FRONTEND_CODE = "frontend_code"
    BACKEND_CODE = "backend_code"
    INFRASTRUCTURE = "infrastructure"
    
    # Coordination capabilities
    ORCHESTRATION = "orchestration"
    PROJECT_MANAGEMENT = "project_management"
    VERSION_CONTROL = "version_control"
    CONFLICT_RESOLUTION = "conflict_resolution"
    
    # Analysis capabilities
    STATIC_ANALYSIS = "static_analysis"
    PERFORMANCE_ANALYSIS = "performance_analysis"
    CODE_ANALYSIS = "code_analysis"
    SECURITY_SCANNING = "security_scanning"
    QUALITY_ASSURANCE = "quality_assurance"
    DEPENDENCY_ANALYSIS = "dependency_analysis"
    VULNERABILITY_SCANNING = "vulnerability_scanning"
    VALIDATION = "validation"  # Anti-hallucination validation


class AgentConfig(BaseModel):
    """Configuration for agent execution."""
    
    model_config = ConfigDict(extra="allow")
    
    # LLM configuration
    model: str = Field(default="claude-3-5-sonnet", description="LLM model to use")
    temperature: float = Field(default=0.1, ge=0.0, le=2.0, description="LLM temperature")
    max_tokens: int = Field(default=4000, gt=0, description="Maximum tokens for LLM response")
    
    # Execution configuration
    timeout_seconds: int = Field(default=300, gt=0, description="Agent execution timeout")
    max_retries: int = Field(default=3, ge=0, description="Maximum retry attempts")
    retry_delay: float = Field(default=1.0, ge=0.0, description="Base delay between retries")
    
    # Tool configuration
    enable_tools: bool = Field(default=True, description="Enable tool usage")
    allowed_tools: Optional[List[str]] = Field(default=None, description="Restricted tool list")
    
    # Custom configuration (extensible)
    custom: Dict[str, Any] = Field(default_factory=dict, description="Agent-specific configuration")


class AgentInput(BaseModel):
    """Standardized input for all agents."""
    
    model_config = ConfigDict(extra="allow")
    
    # Core fields
    run_id: UUID = Field(..., description="Run identifier")
    agent_execution_id: UUID = Field(default_factory=uuid4, description="Unique execution ID")
    previous_agent: Optional[str] = Field(default=None, description="Previous agent in pipeline")
    
    # Context
    feature_brief: Union[str, Dict[str, Any]] = Field(..., description="Original feature brief")
    project_context: Dict[str, Any] = Field(default_factory=dict, description="Project information")
    
    # Previous outputs (for pipeline composition)
    previous_outputs: Dict[str, Any] = Field(default_factory=dict, description="Outputs from previous agents")
    artifacts: Dict[str, Any] = Field(default_factory=dict, description="Available artifacts")
    context_updates: Dict[str, Any] = Field(default_factory=dict, description="Context updates from previous agents")
    
    # Execution context
    config: AgentConfig = Field(default_factory=AgentConfig, description="Agent configuration")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AgentOutput(BaseModel):
    """Standardized output for all agents."""
    
    model_config = ConfigDict(extra="allow")
    
    # Execution info
    agent_execution_id: UUID = Field(..., description="Execution identifier")
    agent_type: str = Field(..., description="Agent type identifier")
    status: str = Field(..., description="Execution status (success/failure/partial)")
    
    # Results
    primary_result: Any = Field(default=None, description="Main output of the agent")
    artifacts: Dict[str, Any] = Field(default_factory=dict, description="Generated artifacts")
    
    # Pipeline data for next agent
    context_updates: Dict[str, Any] = Field(default_factory=dict, description="Context updates for next agents")
    recommendations: List[str] = Field(default_factory=list, description="Recommendations for next steps")
    
    # Execution metrics
    execution_time: float = Field(default=0.0, description="Execution time in seconds")
    token_usage: Optional[Dict[str, int]] = Field(default=None, description="LLM token usage")
    cost_usd: Optional[float] = Field(default=None, description="Estimated cost in USD")
    
    # Error handling
    error_message: Optional[str] = Field(default=None, description="Error message if failed")
    recovery_suggestions: List[str] = Field(default_factory=list, description="Recovery suggestions")
    
    # Quality metrics
    confidence_score: float = Field(default=1.0, ge=0.0, le=1.0, description="Output confidence")
    quality_score: Optional[float] = Field(default=None, description="Quality assessment score")
    
    # Timestamps
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(default=None)


class BaseAgent(ABC):
    """
    Abstract base class for all ForgeFlow agents.
    
    Provides extensible foundation with:
    - Standardized execution interface
    - Plugin registration hooks
    - Capability declarations
    - Error handling and recovery
    """
    
    def __init__(self, config: Optional[AgentConfig] = None):
        """Initialize agent with configuration."""
        self.config = config or AgentConfig()
        self.logger = structlog.get_logger().bind(agent=self.agent_type)
        self._capabilities: Set[AgentCapability] = set()
        self._tools: Dict[str, Any] = {}
        
        # Initialize agent-specific setup
        self._initialize()
    
    @property
    @abstractmethod
    def agent_type(self) -> str:
        """Unique identifier for this agent type."""
        pass
    
    @property
    @abstractmethod
    def version(self) -> str:
        """Agent version for compatibility checking."""
        pass
    
    @property
    @abstractmethod
    def capabilities(self) -> Set[AgentCapability]:
        """Capabilities provided by this agent."""
        pass
    
    @property
    def description(self) -> str:
        """Human-readable description of agent purpose."""
        return f"{self.agent_type} agent"
    
    @property
    def dependencies(self) -> List[str]:
        """Agent types this agent depends on (for pipeline ordering)."""
        return []
    
    @property
    def compatible_agents(self) -> List[str]:
        """Agent types this agent can work with."""
        return []
    
    def _initialize(self) -> None:
        """Initialize agent-specific resources. Override in subclasses."""
        pass
    
    async def execute(self, input_data: AgentInput) -> AgentOutput:
        """
        Execute agent with standardized error handling and metrics.
        
        This is the main entry point that wraps the agent-specific
        implementation with common functionality.
        """
        start_time = datetime.utcnow()
        execution_id = input_data.agent_execution_id
        
        self.logger.info(
            "agent_execution_started",
            execution_id=str(execution_id),
            run_id=str(input_data.run_id)
        )
        
        try:
            # Pre-execution validation
            await self._validate_input(input_data)
            
            # Execute agent-specific logic
            result = await self._execute_impl(input_data)
            
            # Post-execution validation
            await self._validate_output(result)
            
            # Update execution metrics
            end_time = datetime.utcnow()
            result.execution_time = (end_time - start_time).total_seconds()
            result.completed_at = end_time
            result.started_at = start_time
            
            self.logger.info(
                "agent_execution_completed",
                execution_id=str(execution_id),
                duration=result.execution_time,
                status=result.status
            )
            
            return result
            
        except Exception as e:
            error_output = await self._handle_error(input_data, e, start_time)
            
            self.logger.error(
                "agent_execution_failed", 
                execution_id=str(execution_id),
                error=str(e),
                exc_info=True
            )
            
            return error_output
    
    @abstractmethod
    async def _execute_impl(self, input_data: AgentInput) -> AgentOutput:
        """Agent-specific implementation. Override in subclasses."""
        pass
    
    async def _validate_input(self, input_data: AgentInput) -> None:
        """Validate input data. Override for agent-specific validation."""
        if not input_data.feature_brief:
            raise ValueError("Feature brief is required")
    
    async def _validate_output(self, output: AgentOutput) -> None:
        """Validate output data. Override for agent-specific validation."""
        if not output.agent_type:
            raise ValueError("Agent type must be set in output")
    
    async def _handle_error(
        self, 
        input_data: AgentInput, 
        error: Exception, 
        start_time: datetime
    ) -> AgentOutput:
        """Handle execution errors and create error output."""
        end_time = datetime.utcnow()
        
        return AgentOutput(
            agent_execution_id=input_data.agent_execution_id,
            agent_type=self.agent_type,
            status="failure",
            error_message=str(error),
            recovery_suggestions=await self._get_recovery_suggestions(error),
            execution_time=(end_time - start_time).total_seconds(),
            started_at=start_time,
            completed_at=end_time,
            confidence_score=0.0
        )
    
    async def _get_recovery_suggestions(self, error: Exception) -> List[str]:
        """Generate recovery suggestions for errors. Override in subclasses."""
        return [
            "Check input data validity",
            "Verify agent configuration", 
            "Review error logs for details",
            "Consider retrying with different parameters"
        ]
    
    # Tool management for extensibility
    def register_tool(self, name: str, tool: Any) -> None:
        """Register a tool for this agent."""
        self._tools[name] = tool
        self.logger.debug("tool_registered", tool_name=name)
    
    def get_tool(self, name: str) -> Any:
        """Get a registered tool."""
        return self._tools.get(name)
    
    def list_tools(self) -> List[str]:
        """List available tools."""
        return list(self._tools.keys())
    
    # Health check for monitoring
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check. Override for agent-specific checks."""
        return {
            "agent_type": self.agent_type,
            "version": self.version,
            "status": "healthy",
            "capabilities": [cap.value for cap in self.capabilities],
            "tools": self.list_tools(),
            "config": self.config.model_dump()
        }
    
    # Cleanup for resource management
    async def cleanup(self) -> None:
        """Cleanup agent resources. Override in subclasses."""
        self.logger.info("agent_cleanup_completed")


# Utility functions for agent development
def create_agent_output(
    execution_id: UUID,
    agent_type: str,
    status: str = "success",
    **kwargs
) -> AgentOutput:
    """Helper function to create AgentOutput instances."""
    return AgentOutput(
        agent_execution_id=execution_id,
        agent_type=agent_type,
        status=status,
        **kwargs
    )


def merge_contexts(context1: Dict[str, Any], context2: Dict[str, Any]) -> Dict[str, Any]:
    """Merge two context dictionaries with deep merge."""
    result = context1.copy()
    for key, value in context2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_contexts(result[key], value)
        else:
            result[key] = value
    return result