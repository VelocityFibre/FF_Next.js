#!/usr/bin/env python3
"""
External Integration Helper for Docker Agent Orchestration
Allows external Claude Code instances to trigger Docker agents
"""

import requests
import json
import sys
import os
import argparse
from typing import Dict, Any, Optional
from pathlib import Path
from datetime import datetime

# LOG USAGE - Track when this script is actually used
log_file = Path(__file__).parent / "docker_agent_usage.log"
with open(log_file, "a", encoding="utf-8") as f:
    f.write(f"{datetime.now().isoformat()} - trigger_docker_agents.py executed with args: {sys.argv}\n")

class AgentOrchestratorClient:
    """Client to interact with Docker agent orchestration system."""
    
    def __init__(self, base_url: str = "http://localhost:8052"):
        self.base_url = base_url
        self.session = requests.Session()
        
        # Auto-detect project information
        self.project_info = self._detect_project_info()
    
    def _detect_project_info(self) -> Dict[str, str]:
        """Auto-detect current project information."""
        current_path = Path.cwd()
        project_name = current_path.name
        project_path = str(current_path)
        
        # Map common project names to cleaner IDs
        project_mapping = {
            "FibreFlow_React": "fibreflow-react",
            "life-arrow-v1": "life-arrow-v1", 
            "Jarvis AI": "jarvis-ai",
            "Archon": "archon"
        }
        
        project_id = project_mapping.get(project_name, project_name.lower().replace(" ", "-").replace("_", "-"))
        
        return {
            "project_id": project_id,
            "project_path": project_path,
            "project_name": project_name
        }
    
    def health_check(self) -> Dict[str, Any]:
        """Check if agent service is healthy."""
        try:
            response = self.session.get(f"{self.base_url}/health")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def get_status(self) -> Dict[str, Any]:
        """Get current Agent OS workflow status."""
        try:
            response = self.session.get(f"{self.base_url}/agent-os/status")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def analyze_product(self, user_requirements: str = "") -> Dict[str, Any]:
        """Analyze current product state."""
        try:
            data = {
                "user_requirements": user_requirements,
                "project_id": self.project_info["project_id"],
                "project_path": self.project_info["project_path"]
            }
            response = self.session.post(
                f"{self.base_url}/agent-os/analyze-product",
                json=data,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def create_spec(self, feature_description: str) -> Dict[str, Any]:
        """Create technical specification."""
        try:
            data = {
                "feature_description": feature_description,
                "project_id": self.project_info["project_id"],
                "project_path": self.project_info["project_path"]
            }
            response = self.session.post(
                f"{self.base_url}/agent-os/create-spec",
                json=data,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def create_tasks(self) -> Dict[str, Any]:
        """Generate atomic tasks from specification."""
        try:
            data = {
                "project_id": self.project_info["project_id"],
                "project_path": self.project_info["project_path"]
            }
            response = self.session.post(
                f"{self.base_url}/agent-os/create-tasks",
                json=data,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def execute_tasks(self) -> Dict[str, Any]:
        """Execute tasks with specialized agents."""
        try:
            data = {
                "project_id": self.project_info["project_id"],
                "project_path": self.project_info["project_path"]
            }
            response = self.session.post(
                f"{self.base_url}/agent-os/execute-tasks",
                json=data,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def complete_tasks(self) -> Dict[str, Any]:
        """Complete tasks with quality validation."""
        try:
            data = {
                "project_id": self.project_info["project_id"],
                "project_path": self.project_info["project_path"]
            }
            response = self.session.post(
                f"{self.base_url}/agent-os/complete-tasks",
                json=data,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def run_full_workflow(self, feature_description: str, user_requirements: str = "") -> Dict[str, Any]:
        """Run complete Agent OS workflow."""
        try:
            data = {
                "feature_description": feature_description,
                "user_requirements": user_requirements,
                "project_id": self.project_info["project_id"],
                "project_path": self.project_info["project_path"]
            }
            response = self.session.post(
                f"{self.base_url}/agent-os/workflow",
                json=data,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}

def main():
    parser = argparse.ArgumentParser(description="Trigger Docker Agent Orchestration")
    parser.add_argument("command", choices=[
        "health", "status", "analyze", "spec", "tasks", "execute", "complete", "workflow"
    ], help="Command to execute")
    parser.add_argument("--feature", help="Feature description for spec/workflow")
    parser.add_argument("--requirements", help="User requirements for analysis")
    parser.add_argument("--url", default="http://localhost:8052", help="Base URL for agent service")
    
    args = parser.parse_args()
    
    client = AgentOrchestratorClient(args.url)
    
    if args.command == "health":
        result = client.health_check()
    elif args.command == "status":
        result = client.get_status()
    elif args.command == "analyze":
        result = client.analyze_product(args.requirements or "")
    elif args.command == "spec":
        if not args.feature:
            print("Error: --feature required for spec command")
            sys.exit(1)
        result = client.create_spec(args.feature)
    elif args.command == "tasks":
        result = client.create_tasks()
    elif args.command == "execute":
        result = client.execute_tasks()
    elif args.command == "complete":
        result = client.complete_tasks()
    elif args.command == "workflow":
        if not args.feature:
            print("Error: --feature required for workflow command")
            sys.exit(1)
        result = client.run_full_workflow(args.feature, args.requirements or "")
    
    print(json.dumps(result, indent=2))
    
    if "error" in result:
        sys.exit(1)

if __name__ == "__main__":
    main()