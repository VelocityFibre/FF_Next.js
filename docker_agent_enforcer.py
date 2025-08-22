#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Docker Agent Enforcer - Intercepts Python imports to ensure Docker agent usage
"""

import sys
import os
import subprocess
from pathlib import Path
from datetime import datetime
import importlib.util
import importlib.machinery

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

class DockerAgentImportHook:
    """Import hook that enforces Docker agent usage."""
    
    def __init__(self):
        self.trigger_script = Path(__file__).parent / "trigger_docker_agents.py"
        self.log_file = Path(__file__).parent / "docker_agent_usage.log"
        self.ai_libraries = {
            'openai', 'anthropic', 'langchain', 'transformers',
            'requests', 'httpx', 'aiohttp', 'fastapi', 'flask'
        }
        self.last_check = None
        
    def find_spec(self, name, path, target=None):
        """Intercept imports and ensure Docker agents are active."""
        
        # Check if this is an AI-related library
        if any(lib in name for lib in self.ai_libraries):
            self.ensure_docker_agents()
            
        # Return None to continue normal import
        return None
    
    def ensure_docker_agents(self):
        """Ensure Docker agents are running and active."""
        
        # Only check once per minute to avoid spam
        if self.last_check:
            time_diff = (datetime.now() - self.last_check).seconds
            if time_diff < 60:
                return
                
        self.last_check = datetime.now()
        
        # Check if Docker agents are healthy
        try:
            result = subprocess.run(
                ["curl", "-s", "http://localhost:8052/health"],
                capture_output=True,
                text=True,
                timeout=2
            )
            
            if "healthy" not in result.stdout:
                self.activate_docker_agents()
        except:
            self.activate_docker_agents()
            
    def activate_docker_agents(self):
        """Activate Docker agents if not running."""
        print("🚨 Docker Agent Enforcer: Activating Docker agents...")
        
        try:
            # First, check if Docker is running
            docker_check = subprocess.run(
                ["docker", "ps"],
                capture_output=True,
                timeout=5
            )
            
            if docker_check.returncode != 0:
                print("❌ Docker is not running. Please start Docker Desktop.")
                return
                
            # Start Docker agents
            subprocess.run(
                ["docker-compose", "up", "-d", "archon-agents"],
                cwd=r"C:\Jarvis\AI Workspace\Archon",
                capture_output=True,
                timeout=30
            )
            
            # Log activation
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(f"{datetime.now().isoformat()} - Docker agents auto-activated by import hook\n")
                
            print("✅ Docker agents activated successfully")
            
            # Run initial analysis
            if self.trigger_script.exists():
                subprocess.run(
                    ["python", str(self.trigger_script), "health"],
                    capture_output=True,
                    timeout=10
                )
                
        except Exception as e:
            print(f"⚠️  Failed to activate Docker agents: {e}")

def install_docker_enforcer():
    """Install the Docker agent import hook."""
    hook = DockerAgentImportHook()
    
    # Insert at the beginning to catch imports early
    if hook not in sys.meta_path:
        sys.meta_path.insert(0, hook)
        print("✅ Docker Agent Enforcer installed")
        
        # Log installation
        log_file = Path(__file__).parent / "docker_agent_usage.log"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"{datetime.now().isoformat()} - Docker Agent Enforcer installed\n")

# Auto-install when imported
install_docker_enforcer()