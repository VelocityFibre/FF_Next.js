"""
ForgeFlow Integration Module for FibreFlow_React
Auto-generated integration layer for AI-powered development
"""

import sys
from pathlib import Path

# Add ForgeFlow to path
FORGEFLOW_PATH = Path(r"C:\Jarvis\AI Workspace\ForgeFlow\forgeflow")
sys.path.insert(0, str(FORGEFLOW_PATH))

class ForgeFlowIntegration:
    """Integration layer for ForgeFlow in FibreFlow_React."""
    
    def __init__(self):
        self.project_path = Path(r"C:\Jarvis\AI Workspace\FibreFlow_React")
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
