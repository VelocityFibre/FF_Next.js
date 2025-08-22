#!/usr/bin/env python3
"""
Agent System for FibreFlow_React
Multi-agent orchestration and coordination system with all 7 agents
"""

from typing import Dict, List, Optional, Any, Type
import asyncio
from datetime import datetime
import importlib
import inspect
from pathlib import Path

from .base import BaseAgent, AgentCapability
from .registry import AgentRegistry
from .factory import AgentFactory


def get_registry() -> AgentRegistry:
    """Get the global agent registry instance."""
    return AgentRegistry()


def get_factory() -> AgentFactory:
    """Get the global agent factory instance."""
    return AgentFactory()


# Auto-discover and register agents
def _auto_discover_agents():
    """Automatically discover and register all 7 agents in this package."""
    
    try:
        registry = get_registry()
        
        # Define all 8 agent modules for FibreFlow_React
        agent_modules = [
            'planner',
            'architect', 
            'coder',
            'tester',
            'reviewer',
            'antihallucination',
            'coordinator',  # Multi-agent coordination
            'deployment'    # The 8th agent for CI/CD and deployment
        ]
        
        registered_count = 0
        
        for module_name in agent_modules:
            try:
                module = importlib.import_module(f'.{module_name}', package=__name__)
                
                # Find agent classes in the module
                for name, obj in inspect.getmembers(module, inspect.isclass):
                    if (issubclass(obj, BaseAgent) and 
                        obj != BaseAgent and 
                        obj.__module__ == module.__name__):
                        
                        # Create instance to get agent_type
                        try:
                            temp_instance = obj()
                            agent_type = temp_instance.agent_type
                            registry.register_agent_class(agent_type, obj)
                            registered_count += 1
                            print(f"[AGENTS] Registered {agent_type} agent")
                        except Exception as e:
                            print(f"[AGENTS] Failed to register {name}: {e}")
                            
            except ImportError as e:
                print(f"[AGENTS] Could not import {module_name}: {e}")
        
        print(f"[AGENTS] Total registered: {registered_count}/8 agents")
        
        if registered_count == 8:
            print("[AGENTS] SUCCESS: All 8 agents registered!")
        else:
            print(f"[AGENTS] WARNING: Missing {8 - registered_count} agents")
                
    except Exception as e:
        print(f"[AGENTS] Auto-discovery failed: {e}")


# List available agents function
def list_agents() -> List[str]:
    """List all available agent types."""
    registry = get_registry()
    return registry.list_agents()


# Get agent function
def get_agent(agent_type: str) -> Optional[Type[BaseAgent]]:
    """Get agent class by type."""
    registry = get_registry()
    return registry.get_agent_class(agent_type)


# Run auto-discovery when module is imported
_auto_discover_agents()


__all__ = [
    'BaseAgent',
    'AgentRegistry', 
    'AgentFactory',
    'AgentCapability',
    'get_registry',
    'get_factory',
    'list_agents',
    'get_agent'
]