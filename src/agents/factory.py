"""
Agent Factory for ForgeFlow

Provides centralized agent creation with:
- Configuration management
- Dependency injection
- Resource pooling
- Health monitoring
"""

import asyncio
from typing import Dict, List, Optional, Any, Type
from uuid import uuid4
from datetime import datetime

import structlog

from .base import BaseAgent, AgentConfig, AgentInput, AgentCapability
from .registry import get_registry, AgentRegistry
from .exceptions import (
    AgentNotFoundError,
    AgentConfigurationError,
    AgentDependencyError
)

logger = structlog.get_logger()


class AgentFactory:
    """
    Factory for creating and managing agent instances.
    
    Features:
    - Agent lifecycle management
    - Configuration injection
    - Resource pooling (future)
    - Health monitoring
    """
    
    def __init__(self, registry: Optional[AgentRegistry] = None):
        self.registry = registry or get_registry()
        self._active_agents: Dict[str, BaseAgent] = {}
        self._agent_pools: Dict[str, List[BaseAgent]] = {}
        self._default_configs: Dict[str, AgentConfig] = {}
    
    def set_default_config(self, agent_type: str, config: AgentConfig) -> None:
        """Set default configuration for an agent type."""
        self._default_configs[agent_type] = config
        logger.debug("default_config_set", agent_type=agent_type)
    
    def get_default_config(self, agent_type: str) -> AgentConfig:
        """Get default configuration for an agent type."""
        return self._default_configs.get(agent_type, AgentConfig())
    
    async def create_agent(
        self,
        agent_type: str,
        config: Optional[AgentConfig] = None,
        instance_id: Optional[str] = None
    ) -> BaseAgent:
        """
        Create a new agent instance.
        
        Args:
            agent_type: Type of agent to create
            config: Optional configuration (uses default if not provided)
            instance_id: Optional instance identifier
            
        Returns:
            Configured agent instance
        """
        try:
            # Get agent class from registry
            agent_class = self.registry.get_agent_class(agent_type)
            
            # Prepare configuration
            if config is None:
                config = self.get_default_config(agent_type)
            
            # Validate configuration
            await self._validate_config(agent_type, config)
            
            # Create instance
            agent = agent_class(config)
            
            # Set instance ID if provided
            if instance_id:
                agent.instance_id = instance_id
            else:
                agent.instance_id = str(uuid4())
            
            # Initialize agent
            await self._initialize_agent(agent)
            
            # Track active agent
            self._active_agents[agent.instance_id] = agent
            
            logger.info(
                "agent_created",
                agent_type=agent_type,
                instance_id=agent.instance_id,
                config=config.model_dump()
            )
            
            return agent
            
        except Exception as e:
            logger.error(
                "agent_creation_failed",
                agent_type=agent_type,
                error=str(e),
                exc_info=True
            )
            raise AgentConfigurationError(
                f"Failed to create agent {agent_type}: {str(e)}",
                agent_type=agent_type
            )
    
    async def _validate_config(self, agent_type: str, config: AgentConfig) -> None:
        """Validate agent configuration."""
        # Basic validation
        if config.timeout_seconds <= 0:
            raise AgentConfigurationError(
                "timeout_seconds must be positive",
                agent_type=agent_type,
                config_field="timeout_seconds"
            )
        
        if config.max_retries < 0:
            raise AgentConfigurationError(
                "max_retries cannot be negative",
                agent_type=agent_type,
                config_field="max_retries"
            )
        
        if not (0.0 <= config.temperature <= 2.0):
            raise AgentConfigurationError(
                "temperature must be between 0.0 and 2.0",
                agent_type=agent_type,
                config_field="temperature"
            )
    
    async def _initialize_agent(self, agent: BaseAgent) -> None:
        """Initialize agent with resources and health check."""
        try:
            # Perform health check
            health = await agent.health_check()
            if health.get("status") != "healthy":
                raise AgentConfigurationError(
                    f"Agent health check failed: {health}",
                    agent_type=agent.agent_type
                )
            
            logger.debug(
                "agent_initialized",
                agent_type=agent.agent_type,
                instance_id=agent.instance_id,
                health=health
            )
            
        except Exception as e:
            logger.error(
                "agent_initialization_failed",
                agent_type=agent.agent_type,
                error=str(e)
            )
            raise
    
    async def get_agent(self, instance_id: str) -> Optional[BaseAgent]:
        """Get an active agent by instance ID."""
        return self._active_agents.get(instance_id)
    
    async def destroy_agent(self, instance_id: str) -> bool:
        """Destroy an agent instance and cleanup resources."""
        agent = self._active_agents.get(instance_id)
        if not agent:
            return False
        
        try:
            # Cleanup agent resources
            await agent.cleanup()
            
            # Remove from tracking
            del self._active_agents[instance_id]
            
            logger.info(
                "agent_destroyed",
                agent_type=agent.agent_type,
                instance_id=instance_id
            )
            
            return True
            
        except Exception as e:
            logger.error(
                "agent_destruction_failed",
                instance_id=instance_id,
                error=str(e)
            )
            return False
    
    async def list_active_agents(self) -> List[Dict[str, Any]]:
        """List all active agent instances."""
        agents = []
        for instance_id, agent in self._active_agents.items():
            try:
                health = await agent.health_check()
                agents.append({
                    "instance_id": instance_id,
                    "agent_type": agent.agent_type,
                    "version": agent.version,
                    "status": health.get("status", "unknown"),
                    "capabilities": [cap.value for cap in agent.capabilities],
                    "created_at": getattr(agent, "created_at", None)
                })
            except Exception as e:
                agents.append({
                    "instance_id": instance_id,
                    "agent_type": agent.agent_type,
                    "status": "error",
                    "error": str(e)
                })
        
        return agents
    
    async def cleanup_all(self) -> int:
        """Cleanup all active agents."""
        cleanup_count = 0
        instance_ids = list(self._active_agents.keys())
        
        for instance_id in instance_ids:
            if await self.destroy_agent(instance_id):
                cleanup_count += 1
        
        logger.info("all_agents_cleaned_up", count=cleanup_count)
        return cleanup_count
    
    async def create_pipeline_agents(
        self,
        required_capabilities: List[AgentCapability],
        config_overrides: Optional[Dict[str, AgentConfig]] = None
    ) -> Dict[AgentCapability, BaseAgent]:
        """
        Create agents for a complete pipeline based on required capabilities.
        
        Args:
            required_capabilities: List of capabilities needed for the pipeline
            config_overrides: Optional configuration overrides per agent type
            
        Returns:
            Dictionary mapping capabilities to agent instances
        """
        config_overrides = config_overrides or {}
        
        # Find agents for each capability
        capability_agents = self.registry.find_agents_for_pipeline(required_capabilities)
        
        # Create agent instances
        pipeline_agents = {}
        created_agents = []
        
        try:
            for capability, agent_types in capability_agents.items():
                # Select best agent based on strategy
                agent_type = await self._select_best_agent(
                    agent_types, 
                    capability,
                    selection_strategy
                )
                
                # Get configuration
                config = config_overrides.get(agent_type, None)
                
                # Create agent
                agent = await self.create_agent(agent_type, config)
                pipeline_agents[capability] = agent
                created_agents.append(agent)
            
            logger.info(
                "pipeline_agents_created",
                capabilities=[cap.value for cap in required_capabilities],
                agents=[agent.agent_type for agent in created_agents]
            )
            
            return pipeline_agents
            
        except Exception as e:
            # Cleanup any created agents on failure
            for agent in created_agents:
                try:
                    await self.destroy_agent(agent.instance_id)
                except:
                    pass
            
            logger.error(
                "pipeline_creation_failed",
                capabilities=[cap.value for cap in required_capabilities],
                error=str(e)
            )
            raise
    
    async def _select_best_agent(
        self,
        agent_types: List[str],
        capability: AgentCapability,
        strategy: str = "performance"
    ) -> str:
        """
        Select the best agent for a capability based on the strategy.
        
        Strategies:
        - "first": Use first available (simplest)
        - "random": Random selection
        - "performance": Based on historical performance metrics
        - "load": Based on current load/resource usage
        - "version": Prefer newest version
        - "reliability": Based on success rate
        """
        if not agent_types:
            raise ValueError(f"No agents available for capability {capability}")
        
        # Single option - no selection needed
        if len(agent_types) == 1:
            return agent_types[0]
        
        # Apply selection strategy
        if strategy == "first":
            return agent_types[0]
        
        elif strategy == "random":
            import random
            return random.choice(agent_types)
        
        elif strategy == "performance":
            # Select based on performance metrics
            best_agent = None
            best_score = -1
            
            for agent_type in agent_types:
                score = self._get_agent_performance_score(agent_type)
                if score > best_score:
                    best_score = score
                    best_agent = agent_type
            
            return best_agent or agent_types[0]
        
        elif strategy == "load":
            # Select based on current load
            least_loaded = None
            min_load = float('inf')
            
            for agent_type in agent_types:
                load = self._get_agent_load(agent_type)
                if load < min_load:
                    min_load = load
                    least_loaded = agent_type
            
            return least_loaded or agent_types[0]
        
        elif strategy == "version":
            # Select newest version
            newest_agent = None
            newest_version = None
            
            for agent_type in agent_types:
                agent_class = self._registry.get_agent_class(agent_type)
                agent = agent_class()
                version = agent.version
                
                if newest_version is None or self._compare_versions(version, newest_version) > 0:
                    newest_version = version
                    newest_agent = agent_type
            
            return newest_agent or agent_types[0]
        
        elif strategy == "reliability":
            # Select based on success rate
            most_reliable = None
            best_reliability = -1
            
            for agent_type in agent_types:
                reliability = self._get_agent_reliability(agent_type)
                if reliability > best_reliability:
                    best_reliability = reliability
                    most_reliable = agent_type
            
            return most_reliable or agent_types[0]
        
        else:
            # Default to first available
            logger.warning(
                "unknown_selection_strategy",
                strategy=strategy,
                using="first"
            )
            return agent_types[0]
    
    def _get_agent_performance_score(self, agent_type: str) -> float:
        """Get performance score for an agent type."""
        # Check if we have metrics for this agent
        if agent_type not in self._agent_metrics:
            return 0.5  # Default neutral score
        
        metrics = self._agent_metrics[agent_type]
        
        # Calculate composite score
        success_rate = metrics.get("success_rate", 0.5)
        avg_duration = metrics.get("avg_duration", 100)
        
        # Normalize duration (lower is better)
        duration_score = max(0, 1 - (avg_duration / 300))  # 5 minutes max
        
        # Composite score (70% success rate, 30% speed)
        return (success_rate * 0.7) + (duration_score * 0.3)
    
    def _get_agent_load(self, agent_type: str) -> int:
        """Get current load for an agent type."""
        # Count active instances of this type
        count = 0
        for agent in self._active_agents.values():
            if agent.agent_type == agent_type:
                count += 1
        return count
    
    def _get_agent_reliability(self, agent_type: str) -> float:
        """Get reliability score for an agent type."""
        if agent_type not in self._agent_metrics:
            return 0.5  # Default neutral score
        
        metrics = self._agent_metrics[agent_type]
        
        # Reliability based on success rate and failure count
        success_rate = metrics.get("success_rate", 0.5)
        failure_count = metrics.get("failure_count", 0)
        
        # Penalize high failure counts
        penalty = min(0.3, failure_count * 0.01)
        
        return max(0, success_rate - penalty)
    
    def _compare_versions(self, v1: str, v2: str) -> int:
        """Compare semantic versions. Returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal."""
        try:
            from packaging import version
            return 1 if version.parse(v1) > version.parse(v2) else -1 if version.parse(v1) < version.parse(v2) else 0
        except:
            # Fallback to string comparison
            return 1 if v1 > v2 else -1 if v1 < v2 else 0
    
    async def health_check_all(self) -> Dict[str, Any]:
        """Perform health check on all active agents."""
        results = {}
        healthy_count = 0
        total_count = len(self._active_agents)
        
        for instance_id, agent in self._active_agents.items():
            try:
                health = await agent.health_check()
                results[instance_id] = health
                if health.get("status") == "healthy":
                    healthy_count += 1
            except Exception as e:
                results[instance_id] = {
                    "status": "error",
                    "error": str(e),
                    "agent_type": agent.agent_type
                }
        
        return {
            "total_agents": total_count,
            "healthy_agents": healthy_count,
            "health_percentage": (healthy_count / total_count * 100) if total_count > 0 else 100,
            "agents": results,
            "timestamp": datetime.utcnow().isoformat()
        }


# Global factory instance
_global_factory = AgentFactory()


def get_factory() -> AgentFactory:
    """Get the global agent factory."""
    return _global_factory


async def create_agent(
    agent_type: str,
    config: Optional[AgentConfig] = None,
    instance_id: Optional[str] = None
) -> BaseAgent:
    """Create agent using global factory."""
    return await _global_factory.create_agent(agent_type, config, instance_id)


async def destroy_agent(instance_id: str) -> bool:
    """Destroy agent using global factory."""
    return await _global_factory.destroy_agent(instance_id)