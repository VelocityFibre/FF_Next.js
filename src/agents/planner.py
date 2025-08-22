#!/usr/bin/env python3
"""
Planner Agent for FibreFlow_React
Handles project planning and task breakdown
"""

from typing import Dict, List, Any, Optional
import asyncio
from datetime import datetime

from .base import BaseAgent, AgentCapability


class PlannerAgent(BaseAgent):
    """Agent responsible for project planning and task breakdown."""
    
    def __init__(self, config: Optional[Any] = None):
        super().__init__(
            agent_type="planner",
            version="1.0.0",
            description="Strategic planning and task decomposition agent",
            capabilities=[
                AgentCapability.ANALYSIS,
                AgentCapability.REASONING,
                AgentCapability.PROJECT_MANAGEMENT,
                AgentCapability.ORCHESTRATION
            ]
        )
    
    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute planning task."""
        
        task_description = task.get('description', '')
        context = task.get('context', {})
        
        print(f"[PLANNER] Starting task analysis: {task_description}")
        
        # Analyze task and create plan
        plan = await self._create_execution_plan(task_description, context)
        
        return {
            "status": "completed",
            "agent": self.agent_type,
            "output": {
                "plan": plan,
                "estimated_duration": self._estimate_duration(plan),
                "required_agents": self._identify_required_agents(plan),
                "dependencies": self._identify_dependencies(plan)
            },
            "timestamp": datetime.now().isoformat()
        }
    
    async def _create_execution_plan(self, description: str, context: Dict) -> List[Dict]:
        """Create detailed execution plan."""
        
        # Basic planning logic
        plan_steps = []
        
        if "feature" in description.lower():
            plan_steps.extend([
                {"step": 1, "action": "analyze_requirements", "agent": "planner"},
                {"step": 2, "action": "design_architecture", "agent": "architect"},
                {"step": 3, "action": "implement_feature", "agent": "coder"},
                {"step": 4, "action": "write_tests", "agent": "tester"},
                {"step": 5, "action": "review_code", "agent": "reviewer"}
            ])
        
        elif "bug" in description.lower() or "fix" in description.lower():
            plan_steps.extend([
                {"step": 1, "action": "identify_root_cause", "agent": "planner"},
                {"step": 2, "action": "design_solution", "agent": "architect"},
                {"step": 3, "action": "implement_fix", "agent": "coder"},
                {"step": 4, "action": "test_fix", "agent": "tester"},
                {"step": 5, "action": "validate_solution", "agent": "reviewer"}
            ])
        
        else:
            plan_steps.extend([
                {"step": 1, "action": "analyze_task", "agent": "planner"},
                {"step": 2, "action": "execute_task", "agent": "coder"},
                {"step": 3, "action": "verify_completion", "agent": "reviewer"}
            ])
        
        return plan_steps
    
    def _estimate_duration(self, plan: List[Dict]) -> str:
        """Estimate task duration based on plan complexity."""
        step_count = len(plan)
        
        if step_count <= 3:
            return "15-30 minutes"
        elif step_count <= 5:
            return "30-60 minutes"
        else:
            return "1-2 hours"
    
    def _identify_required_agents(self, plan: List[Dict]) -> List[str]:
        """Identify which agents are needed for this plan."""
        agents = set()
        for step in plan:
            agents.add(step.get("agent", "coder"))
        return list(agents)
    
    def _identify_dependencies(self, plan: List[Dict]) -> List[Dict]:
        """Identify dependencies between plan steps."""
        dependencies = []
        for i, step in enumerate(plan):
            if i > 0:
                dependencies.append({
                    "step": step["step"],
                    "depends_on": plan[i-1]["step"],
                    "type": "sequential"
                })
        return dependencies