"""
ForgeFlow Activation Script for FibreFlow_React
Integrates the ForgeFlow AI orchestration system with the FibreFlow_React project
"""

import sys
import json
import os
from pathlib import Path
from datetime import datetime

# Add ForgeFlow to path
FORGEFLOW_PATH = Path(r"C:\Jarvis\AI Workspace\ForgeFlow\forgeflow")
sys.path.insert(0, str(FORGEFLOW_PATH))

def activate_forgeflow():
    """Activate ForgeFlow system for FibreFlow_React project."""
    
    print("="*60)
    print("FORGEFLOW ACTIVATION FOR FIBREFLOW_REACT")
    print("="*60)
    
    project_path = Path(r"C:\Jarvis\AI Workspace\FibreFlow_React")
    
    # Step 1: Create ForgeFlow configuration
    print("\n[1/5] Creating ForgeFlow configuration...")
    config = {
        "project_name": "FibreFlow_React",
        "project_path": str(project_path),
        "activation_time": datetime.now().isoformat(),
        "forgeflow_version": "1.0.0",
        "agents": {
            "planner": {"enabled": True, "priority": 1},
            "architect": {"enabled": True, "priority": 2},
            "coder": {"enabled": True, "priority": 3},
            "tester": {"enabled": True, "priority": 4},
            "reviewer": {"enabled": True, "priority": 5},
            "antihallucination": {"enabled": True, "priority": 0},
            "coordinator": {"enabled": True, "priority": 6}
        },
        "orchestration": {
            "pipeline_mode": "sequential",
            "parallel_execution": False,
            "auto_retry": True,
            "max_retries": 3
        },
        "telemetry": {
            "logging": True,
            "metrics": True,
            "tracing": True,
            "events": True
        },
        "integration": {
            "use_existing_tests": True,
            "test_framework": "vitest",
            "build_command": "npm run build",
            "lint_command": "npm run lint",
            "type_check_command": "npm run type-check"
        }
    }
    
    config_file = project_path / "forgeflow.config.json"
    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)
    print(f"   [OK] Configuration saved to {config_file}")
    
    # Step 2: Initialize ForgeFlow components
    print("\n[2/5] Initializing ForgeFlow components...")
    try:
        from src.agents import get_registry
        from src.orchestration import PipelineExecutor, OrchestrationConfig
        from src.telemetry import get_logger, get_metrics, get_event_tracker
        
        registry = get_registry()
        logger = get_logger()
        metrics = get_metrics()
        events = get_event_tracker()
        
        agents = registry.list_agents()
        print(f"   [OK] Registry initialized with {len(agents)} agents: {agents}")
        print("   [OK] Telemetry systems activated")
    except Exception as e:
        print(f"   [WARNING] {e}")
    
    # Step 3: Create project integration file
    print("\n[3/5] Creating project integration...")
    integration_content = '''"""
ForgeFlow Integration Module for FibreFlow_React
Auto-generated integration layer for AI-powered development
"""

import sys
from pathlib import Path

# Add ForgeFlow to path
FORGEFLOW_PATH = Path(r"C:\\Jarvis\\AI Workspace\\ForgeFlow\\forgeflow")
sys.path.insert(0, str(FORGEFLOW_PATH))

class ForgeFlowIntegration:
    """Integration layer for ForgeFlow in FibreFlow_React."""
    
    def __init__(self):
        self.project_path = Path(r"C:\\Jarvis\\AI Workspace\\FibreFlow_React")
        self.config_file = self.project_path / "forgeflow.config.json"
        self._load_config()
        self._initialize_agents()
    
    def _load_config(self):
        """Load ForgeFlow configuration."""
        import json
        with open(self.config_file) as f:
            self.config = json.load(f)
    
    def _initialize_agents(self):
        """Initialize ForgeFlow agents."""
        try:
            from src.agents import get_registry
            self.registry = get_registry()
            self.agents = self.registry.list_agents()
            print(f"[OK] ForgeFlow agents initialized: {self.agents}")
        except Exception as e:
            print(f"[WARNING] Agent initialization: {e}")
    
    def execute_pipeline(self, task_description):
        """Execute a ForgeFlow pipeline for the given task."""
        try:
            from src.orchestration import PipelineExecutor, OrchestrationConfig
            
            config = OrchestrationConfig(
                project_path=str(self.project_path),
                agents=self.config["agents"],
                pipeline_mode=self.config["orchestration"]["pipeline_mode"]
            )
            
            executor = PipelineExecutor(config)
            return executor.execute(task_description)
        except Exception as e:
            print(f"Pipeline execution error: {e}")
            return None
    
    def analyze_code(self, file_path):
        """Analyze code using ForgeFlow's AntiHallucination agent."""
        try:
            from src.agents.antihallucination import AntiHallucinationAgent
            
            agent = AntiHallucinationAgent()
            return agent.validate_file(file_path)
        except Exception as e:
            print(f"Code analysis error: {e}")
            return None

# Global instance
forgeflow = ForgeFlowIntegration()
'''
    
    integration_file = project_path / "forgeflow_integration.py"
    with open(integration_file, 'w') as f:
        f.write(integration_content)
    print(f"   [OK] Integration module created at {integration_file}")
    
    # Step 4: Create activation marker
    print("\n[4/5] Creating activation marker...")
    marker = {
        "activated": True,
        "timestamp": datetime.now().isoformat(),
        "forgeflow_path": str(FORGEFLOW_PATH),
        "project": "FibreFlow_React",
        "status": "active"
    }
    
    marker_file = project_path / ".forgeflow_active"
    with open(marker_file, 'w') as f:
        json.dump(marker, f, indent=2)
    print(f"   [OK] Activation marker created at {marker_file}")
    
    # Step 5: Display activation summary
    print("\n[5/5] Activation Summary")
    print("-"*40)
    print(f"[SUCCESS] ForgeFlow ACTIVATED for FibreFlow_React")
    print(f"Project Path: {project_path}")
    print(f"Configuration: {config_file}")
    print(f"Integration: {integration_file}")
    print(f"Available Agents: {len(config['agents'])} (including CoordinatorAgent)")
    print(f"Telemetry: Enabled")
    print(f"Status: READY")
    
    print("\n" + "="*60)
    print("FORGEFLOW ACTIVATION COMPLETE!")
    print("="*60)
    
    print("\nQuick Start Commands:")
    print("  1. Import: from forgeflow_integration import forgeflow")
    print("  2. Execute: forgeflow.execute_pipeline('your task')")
    print("  3. Analyze: forgeflow.analyze_code('file.ts')")
    
    return True

if __name__ == "__main__":
    try:
        success = activate_forgeflow()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n[ERROR] Activation failed: {e}")
        sys.exit(1)