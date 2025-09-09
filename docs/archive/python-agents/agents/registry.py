"""
Agent Registry for ForgeFlow

Provides dynamic agent discovery and registration system supporting:
- Plugin architecture for easy agent addition
- Runtime agent discovery
- Capability-based agent selection
- Hot-reloading of agent modules
"""

import importlib
import inspect
import pkgutil
from pathlib import Path
from typing import Dict, List, Optional, Set, Type, Any
from threading import Lock

import structlog

from .base import BaseAgent, AgentCapability
from .exceptions import AgentNotFoundError, AgentCapabilityError

logger = structlog.get_logger()


class AgentRegistry:
    """
    Thread-safe registry for agent discovery and management.
    
    Supports:
    - Dynamic agent registration
    - Plugin discovery
    - Capability-based selection
    - Hot-reloading
    """
    
    def __init__(self):
        self._agents: Dict[str, Type[BaseAgent]] = {}
        self._capabilities: Dict[AgentCapability, Set[str]] = {}
        self._lock = Lock()
        self._loaded_modules: Set[str] = set()
    
    def register_agent(self, agent_class: Type[BaseAgent]) -> None:
        """Register an agent class."""
        with self._lock:
            # Validate agent class
            if not issubclass(agent_class, BaseAgent):
                raise ValueError(f"Agent class {agent_class} must inherit from BaseAgent")
            
            # Get agent type from class
            agent_instance = agent_class()
            agent_type = agent_instance.agent_type
            
            # Register agent
            self._agents[agent_type] = agent_class
            
            # Register capabilities
            for capability in agent_instance.capabilities:
                if capability not in self._capabilities:
                    self._capabilities[capability] = set()
                self._capabilities[capability].add(agent_type)
            
            logger.info(
                "agent_registered",
                agent_type=agent_type,
                capabilities=[cap.value for cap in agent_instance.capabilities],
                version=agent_instance.version
            )
    
    def unregister_agent(self, agent_type: str) -> None:
        """Unregister an agent."""
        with self._lock:
            if agent_type not in self._agents:
                return
            
            agent_class = self._agents[agent_type]
            agent_instance = agent_class()
            
            # Remove from main registry
            del self._agents[agent_type]
            
            # Remove from capability mappings
            for capability in agent_instance.capabilities:
                if capability in self._capabilities:
                    self._capabilities[capability].discard(agent_type)
                    if not self._capabilities[capability]:
                        del self._capabilities[capability]
            
            logger.info("agent_unregistered", agent_type=agent_type)
    
    def get_agent_class(self, agent_type: str) -> Type[BaseAgent]:
        """Get agent class by type."""
        with self._lock:
            if agent_type not in self._agents:
                available = list(self._agents.keys())
                raise AgentNotFoundError(
                    agent_type=agent_type,
                    available_agents=available
                )
            return self._agents[agent_type]
    
    def list_agents(self) -> List[str]:
        """List all registered agent types."""
        with self._lock:
            return list(self._agents.keys())
    
    def get_agents_by_capability(self, capability: AgentCapability) -> List[str]:
        """Get all agents that provide a specific capability."""
        with self._lock:
            return list(self._capabilities.get(capability, set()))
    
    def get_agent_capabilities(self, agent_type: str) -> Set[AgentCapability]:
        """Get capabilities of a specific agent."""
        agent_class = self.get_agent_class(agent_type)
        agent_instance = agent_class()
        return agent_instance.capabilities
    
    def get_agent_info(self, agent_type: str) -> Dict[str, Any]:
        """Get detailed information about an agent."""
        agent_class = self.get_agent_class(agent_type)
        agent_instance = agent_class()
        
        return {
            "agent_type": agent_type,
            "version": agent_instance.version,
            "description": agent_instance.description,
            "capabilities": [cap.value for cap in agent_instance.capabilities],
            "dependencies": agent_instance.dependencies,
            "compatible_agents": agent_instance.compatible_agents,
            "class_name": agent_class.__name__,
            "module": agent_class.__module__
        }
    
    def list_all_info(self) -> List[Dict[str, Any]]:
        """Get information about all registered agents."""
        return [self.get_agent_info(agent_type) for agent_type in self.list_agents()]
    
    def find_agents_for_pipeline(self, required_capabilities: List[AgentCapability]) -> Dict[AgentCapability, List[str]]:
        """Find agents that can fulfill required capabilities for a pipeline."""
        result = {}
        missing_capabilities = []
        
        for capability in required_capabilities:
            agents = self.get_agents_by_capability(capability)
            if agents:
                result[capability] = agents
            else:
                missing_capabilities.append(capability)
        
        if missing_capabilities:
            raise AgentCapabilityError(
                f"No agents found for capabilities: {[cap.value for cap in missing_capabilities]}",
                required_capability=missing_capabilities[0].value if missing_capabilities else None,
                available_capabilities=list(self._capabilities.keys())
            )
        
        return result
    
    def discover_agents(self, package_path: Optional[str] = None) -> int:
        """
        Discover and register agents from a package.
        
        Returns the number of agents discovered.
        """
        if package_path is None:
            # Default to scanning the agents package
            package_path = "src.agents"
        
        discovered_count = 0
        
        try:
            # Import the package
            package = importlib.import_module(package_path)
            package_dir = Path(package.__file__).parent
            
            # Scan for agent modules
            for module_info in pkgutil.iter_modules([str(package_dir)]):
                module_name = f"{package_path}.{module_info.name}"
                
                # Skip already loaded modules unless we're hot-reloading
                if module_name in self._loaded_modules:
                    continue
                
                try:
                    module = importlib.import_module(module_name)
                    self._loaded_modules.add(module_name)
                    
                    # Find agent classes in the module
                    for name, obj in inspect.getmembers(module, inspect.isclass):
                        if (issubclass(obj, BaseAgent) and 
                            obj != BaseAgent and
                            not inspect.isabstract(obj)):
                            
                            self.register_agent(obj)
                            discovered_count += 1
                            
                except Exception as e:
                    logger.warning(
                        "agent_discovery_failed",
                        module=module_name,
                        error=str(e)
                    )
        
        except Exception as e:
            logger.error(
                "agent_package_discovery_failed",
                package=package_path,
                error=str(e)
            )
        
        logger.info(
            "agent_discovery_completed",
            package=package_path,
            discovered_count=discovered_count,
            total_agents=len(self._agents)
        )
        
        return discovered_count
    
    def reload_agent(self, agent_type: str) -> bool:
        """Hot-reload a specific agent."""
        try:
            # Get current agent info
            agent_class = self.get_agent_class(agent_type)
            module_name = agent_class.__module__
            
            # Unregister current agent
            self.unregister_agent(agent_type)
            
            # Reload the module
            if module_name in self._loaded_modules:
                self._loaded_modules.remove(module_name)
            
            module = importlib.reload(importlib.import_module(module_name))
            
            # Re-register agents from the module
            for name, obj in inspect.getmembers(module, inspect.isclass):
                if (issubclass(obj, BaseAgent) and 
                    obj != BaseAgent and
                    not inspect.isabstract(obj) and
                    obj().agent_type == agent_type):
                    
                    self.register_agent(obj)
                    logger.info("agent_reloaded", agent_type=agent_type)
                    return True
            
            logger.warning("agent_reload_failed", agent_type=agent_type, reason="Agent not found in module")
            return False
            
        except Exception as e:
            logger.error("agent_reload_error", agent_type=agent_type, error=str(e))
            return False
    
    def clear(self) -> None:
        """Clear all registered agents."""
        with self._lock:
            self._agents.clear()
            self._capabilities.clear()
            self._loaded_modules.clear()
            logger.info("agent_registry_cleared")


# Global registry instance
_global_registry = AgentRegistry()


# Convenience functions for global registry
def register_agent(agent_class: Type[BaseAgent]) -> None:
    """Register an agent class in the global registry."""
    _global_registry.register_agent(agent_class)


def get_agent(agent_type: str) -> Type[BaseAgent]:
    """Get agent class from global registry."""
    return _global_registry.get_agent_class(agent_type)


def list_agents() -> List[str]:
    """List all agent types in global registry."""
    return _global_registry.list_agents()


def get_registry() -> AgentRegistry:
    """Get the global agent registry."""
    return _global_registry


def discover_agents(package_path: Optional[str] = None) -> int:
    """Discover agents in global registry."""
    return _global_registry.discover_agents(package_path)


# Decorator for easy agent registration
def agent(agent_class: Type[BaseAgent]) -> Type[BaseAgent]:
    """Decorator to automatically register an agent class."""
    register_agent(agent_class)
    return agent_class