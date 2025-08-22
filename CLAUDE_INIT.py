#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AUTO-ACTIVATION: This script MUST run when Claude Code starts in this project.
It ensures Docker agents are used for ALL work.
"""

import subprocess
import sys
import os
from pathlib import Path

# Fix Windows console encoding for emojis
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# Install Docker Agent Enforcer import hook
try:
    import docker_agent_enforcer
    print("✅ Docker Agent Enforcer active - all imports will trigger Docker agent checks")
except Exception as e:
    print(f"⚠️  Could not install Docker Agent Enforcer: {e}")

def auto_activate_docker_agents():
    """Automatically activate Docker agents for this project."""
    
    print("=" * 60)
    print("🚨 DOCKER AGENT AUTO-ACTIVATION 🚨")
    print("=" * 60)
    
    # Check if Docker agents are running
    try:
        result = subprocess.run(
            ["python", "trigger_docker_agents.py", "health"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if "healthy" in result.stdout:
            print("✅ Docker agents are ONLINE and ready")
            print("📋 Project: FibreFlow_React")
            print("🔧 All work will be routed through Docker agents")
            
            # Auto-analyze the current state
            print("\n🔍 Running initial project analysis...")
            analyze_result = subprocess.run(
                ["python", "trigger_docker_agents.py", "analyze", "--requirements", "Session initialization - checking project state"],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if analyze_result.returncode == 0:
                print("✅ Initial analysis complete")
                print("\n📌 REMINDER: Use these commands for all work:")
                print("  python trigger_docker_agents.py analyze --requirements '[task]'")
                print("  python trigger_docker_agents.py workflow --feature '[feature]' --requirements '[requirements]'")
                print("  python trigger_docker_agents.py status")
            
            return True
        else:
            print("❌ Docker agents are NOT responding")
            print("Please ensure Docker is running and agents are started")
            return False
            
    except Exception as e:
        print(f"❌ Failed to connect to Docker agents: {e}")
        print("Please check that Archon Docker containers are running")
        return False

if __name__ == "__main__":
    # This runs automatically when imported or executed
    success = auto_activate_docker_agents()
    
    if not success:
        print("\n⚠️  WARNING: Working without Docker agents is NOT recommended")
        print("Start Docker agents with: docker-compose up -d")
        sys.exit(1)
    else:
        print("\n✅ Docker Agent System ACTIVE - Ready for development")
        print("=" * 60)