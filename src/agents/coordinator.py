"""
CoordinatorAgent - Manages multi-agent collaboration workflows.

Orchestrates multiple agents working on the same project with conflict resolution,
git branch management, and GitHub integration.
"""

import asyncio
import json
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Union
from uuid import uuid4

import structlog
from pydantic import BaseModel, Field

from .base import BaseAgent, AgentInput, AgentOutput, AgentCapability, create_agent_output
from .factory import AgentFactory
from .registry import get_registry

logger = structlog.get_logger()


class CoordinationStrategy(BaseModel):
    """Defines how agents coordinate on a project."""
    
    name: str = Field(..., description="Strategy name")
    type: str = Field(..., description="sequential, parallel, or hybrid")
    conflict_resolution: str = Field(default="auto", description="auto, manual, or ai_assisted")
    branch_strategy: str = Field(default="feature_branches", description="Git branching strategy")
    merge_strategy: str = Field(default="merge_commits", description="How to merge agent work")
    handoff_points: List[str] = Field(default_factory=list, description="Where to pause for approval")


class AgentAssignment(BaseModel):
    """Assigns an agent to specific files/tasks."""
    
    agent_type: str = Field(..., description="Type of agent")
    file_patterns: List[str] = Field(..., description="File patterns this agent works on")
    task_description: str = Field(..., description="Specific task for this agent")
    dependencies: List[str] = Field(default_factory=list, description="Other agents this depends on")
    priority: int = Field(default=1, description="Execution priority")


class CoordinationPlan(BaseModel):
    """Complete plan for multi-agent coordination."""
    
    feature_brief: str = Field(..., description="Overall feature description")
    strategy: CoordinationStrategy = Field(..., description="Coordination strategy")
    assignments: List[AgentAssignment] = Field(..., description="Agent assignments")
    base_branch: str = Field(default="main", description="Base git branch")
    target_branch: Optional[str] = Field(None, description="Target branch for merge")
    estimated_duration: Optional[int] = Field(None, description="Estimated minutes")


class CoordinationResult(BaseModel):
    """Result of multi-agent coordination."""
    
    success: bool = Field(..., description="Overall success status")
    feature_branch: str = Field(..., description="Final feature branch")
    agent_results: Dict[str, Dict] = Field(..., description="Results from each agent")
    conflicts_resolved: List[str] = Field(default_factory=list, description="Conflicts that were resolved")
    manual_conflicts: List[str] = Field(default_factory=list, description="Conflicts needing manual resolution")
    pull_request_url: Optional[str] = Field(None, description="GitHub PR URL if created")
    artifacts: List[str] = Field(default_factory=list, description="Generated artifacts")


class CoordinatorAgent(BaseAgent):
    """
    Agent that orchestrates multiple agents working on the same project.
    
    Handles:
    - Multi-agent workflow planning
    - Git branch management
    - Conflict resolution
    - GitHub integration
    - Progress monitoring
    """
    
    agent_type: str = "coordinator"
    version: str = "1.0.0"
    description: str = "Orchestrates multi-agent collaboration with conflict resolution"
    capabilities: Set[AgentCapability] = {
        AgentCapability.ORCHESTRATION,
        AgentCapability.PROJECT_MANAGEMENT,
        AgentCapability.VERSION_CONTROL
    }
    
    def __init__(self, config: Optional[Any] = None):
        super().__init__()
        self.registry = get_registry()
        self.factory = AgentFactory()
        self.active_agents: Dict[str, Any] = {}
        self.project_path = Path(".")
        
        # Built-in coordination strategies
        self.strategies = {
            "sequential": CoordinationStrategy(
                name="Sequential Pipeline",
                type="sequential",
                conflict_resolution="auto",
                branch_strategy="single_branch",
                merge_strategy="linear_history"
            ),
            "parallel_isolated": CoordinationStrategy(
                name="Parallel with Isolation",
                type="parallel",
                conflict_resolution="auto",
                branch_strategy="feature_branches",
                merge_strategy="merge_commits",
                handoff_points=["before_merge"]
            ),
            "hybrid_review": CoordinationStrategy(
                name="Hybrid with Review Points",
                type="hybrid",
                conflict_resolution="ai_assisted",
                branch_strategy="feature_branches",
                merge_strategy="merge_commits",
                handoff_points=["after_planning", "before_merge", "before_push"]
            )
        }
    
    async def _execute_impl(self, agent_input: AgentInput) -> AgentOutput:
        """Execute multi-agent coordination."""
        
        try:
            # Parse coordination request
            coordination_plan = await self._create_coordination_plan(agent_input)
            
            logger.info("Starting multi-agent coordination",
                       strategy=coordination_plan.strategy.name,
                       agents=len(coordination_plan.assignments))
            
            # Execute coordination based on strategy
            if coordination_plan.strategy.type == "sequential":
                result = await self._execute_sequential(coordination_plan)
            elif coordination_plan.strategy.type == "parallel":
                result = await self._execute_parallel(coordination_plan)
            elif coordination_plan.strategy.type == "hybrid":
                result = await self._execute_hybrid(coordination_plan)
            else:
                raise ValueError(f"Unknown coordination strategy: {coordination_plan.strategy.type}")
            
            # Create GitHub PR if requested
            if agent_input.context.get("create_pr", False):
                result.pull_request_url = await self._create_github_pr(result, coordination_plan)
            
            return create_agent_output(
                agent_type=self.agent_type,
                result=result.model_dump(),
                artifacts=[f"coordination_result_{result.feature_branch}.json"],
                confidence=0.95 if result.success else 0.6,
                reasoning=f"Coordinated {len(coordination_plan.assignments)} agents using {coordination_plan.strategy.name}"
            )
            
        except Exception as e:
            logger.error("Coordination failed", error=str(e))
            return create_agent_output(
                agent_type=self.agent_type,
                result={"error": str(e)},
                success=False,
                confidence=0.1,
                reasoning=f"Coordination failed: {str(e)}"
            )
    
    async def _create_coordination_plan(self, agent_input: AgentInput) -> CoordinationPlan:
        """Analyze request and create coordination plan."""
        
        feature_brief = agent_input.context.get("feature_brief", "")
        strategy_name = agent_input.context.get("strategy", "parallel_isolated")
        
        # Get or create strategy
        strategy = self.strategies.get(strategy_name)
        if not strategy:
            strategy = self.strategies["parallel_isolated"]
        
        # Auto-generate agent assignments if not provided
        assignments = agent_input.context.get("assignments")
        if not assignments:
            assignments = await self._auto_generate_assignments(feature_brief, agent_input.context)
        else:
            assignments = [AgentAssignment(**a) for a in assignments]
        
        return CoordinationPlan(
            feature_brief=feature_brief,
            strategy=strategy,
            assignments=assignments,
            base_branch=agent_input.context.get("base_branch", "main"),
            target_branch=agent_input.context.get("target_branch"),
            estimated_duration=len(assignments) * 15  # 15 min per agent estimate
        )
    
    async def _auto_generate_assignments(self, feature_brief: str, context: Dict) -> List[AgentAssignment]:
        """Automatically generate agent assignments based on feature description."""
        
        # Use the planner agent to break down the feature
        planner = await self.factory.create_agent("planner")
        
        try:
            planning_result = await planner.execute(AgentInput(
                task_description=f"Break down this feature for multi-agent development: {feature_brief}",
                context={
                    "coordination_mode": True,
                    "output_format": "agent_assignments"
                }
            ))
            
            # Parse planning result into assignments
            assignments = []
            if planning_result.success and "agent_assignments" in planning_result.result:
                for assignment_data in planning_result.result["agent_assignments"]:
                    assignments.append(AgentAssignment(**assignment_data))
            
            # Fallback to default assignments if planning failed
            if not assignments:
                assignments = self._get_default_assignments(feature_brief)
            
            return assignments
            
        finally:
            await self.factory.destroy_agent(planner.instance_id)
    
    def _get_default_assignments(self, feature_brief: str) -> List[AgentAssignment]:
        """Get default agent assignments for a feature."""
        
        return [
            AgentAssignment(
                agent_type="planner",
                file_patterns=["docs/**/*.md", "PLANNING.md"],
                task_description="Create detailed implementation plan",
                priority=1
            ),
            AgentAssignment(
                agent_type="architect",
                file_patterns=["src/api/**/*.py", "src/models/**/*.py"],
                task_description="Design API structure and data models",
                dependencies=["planner"],
                priority=2
            ),
            AgentAssignment(
                agent_type="coder",
                file_patterns=["src/**/*.py", "!src/tests/**"],
                task_description="Implement core functionality",
                dependencies=["architect"],
                priority=3
            ),
            AgentAssignment(
                agent_type="tester",
                file_patterns=["tests/**/*.py", "src/tests/**/*.py"],
                task_description="Create comprehensive test suite",
                dependencies=["coder"],
                priority=4
            ),
            AgentAssignment(
                agent_type="reviewer",
                file_patterns=["**/*.py", "**/*.md"],
                task_description="Review all changes for quality and compliance",
                dependencies=["tester"],
                priority=5
            )
        ]
    
    async def _execute_sequential(self, plan: CoordinationPlan) -> CoordinationResult:
        """Execute agents sequentially."""
        
        feature_branch = await self._create_feature_branch(plan)
        agent_results = {}
        
        # Sort assignments by priority and dependencies
        sorted_assignments = self._sort_assignments_by_dependencies(plan.assignments)
        
        for assignment in sorted_assignments:
            logger.info("Executing agent", agent=assignment.agent_type, task=assignment.task_description)
            
            # Execute agent
            result = await self._execute_single_agent(assignment, plan, feature_branch)
            agent_results[assignment.agent_type] = result
            
            # Commit agent's work
            await self._commit_agent_work(assignment.agent_type, assignment.task_description)
            
            # Check for handoff points
            if f"after_{assignment.agent_type}" in plan.strategy.handoff_points:
                await self._handle_handoff_point(assignment.agent_type, plan)
        
        return CoordinationResult(
            success=True,
            feature_branch=feature_branch,
            agent_results=agent_results,
            conflicts_resolved=[],
            manual_conflicts=[]
        )
    
    async def _execute_parallel(self, plan: CoordinationPlan) -> CoordinationResult:
        """Execute agents in parallel with conflict resolution."""
        
        feature_branch = await self._create_feature_branch(plan)
        
        # Create agent-specific branches
        agent_branches = {}
        for assignment in plan.assignments:
            branch_name = f"{feature_branch}-{assignment.agent_type}"
            await self._create_agent_branch(branch_name, feature_branch)
            agent_branches[assignment.agent_type] = branch_name
        
        # Execute agents in parallel
        agent_tasks = []
        for assignment in plan.assignments:
            task = asyncio.create_task(
                self._execute_agent_on_branch(assignment, plan, agent_branches[assignment.agent_type])
            )
            agent_tasks.append((assignment.agent_type, task))
        
        # Wait for all agents to complete
        agent_results = {}
        for agent_type, task in agent_tasks:
            try:
                result = await task
                agent_results[agent_type] = result
            except Exception as e:
                logger.error("Agent failed", agent=agent_type, error=str(e))
                agent_results[agent_type] = {"error": str(e), "success": False}
        
        # Merge agent branches with conflict resolution
        conflicts_resolved, manual_conflicts = await self._merge_agent_branches(
            list(agent_branches.values()), feature_branch, plan
        )
        
        return CoordinationResult(
            success=len(manual_conflicts) == 0,
            feature_branch=feature_branch,
            agent_results=agent_results,
            conflicts_resolved=conflicts_resolved,
            manual_conflicts=manual_conflicts
        )
    
    async def _execute_hybrid(self, plan: CoordinationPlan) -> CoordinationResult:
        """Execute hybrid strategy with both sequential and parallel phases."""
        
        # Phase 1: Sequential planning and architecture
        planning_assignments = [a for a in plan.assignments if a.agent_type in ["planner", "architect"]]
        implementation_assignments = [a for a in plan.assignments if a.agent_type not in ["planner", "architect"]]
        
        # Execute planning phase sequentially
        planning_plan = CoordinationPlan(
            feature_brief=plan.feature_brief,
            strategy=self.strategies["sequential"],
            assignments=planning_assignments,
            base_branch=plan.base_branch
        )
        
        planning_result = await self._execute_sequential(planning_plan)
        
        # Phase 2: Parallel implementation
        if implementation_assignments:
            impl_plan = CoordinationPlan(
                feature_brief=plan.feature_brief,
                strategy=self.strategies["parallel_isolated"],
                assignments=implementation_assignments,
                base_branch=planning_result.feature_branch
            )
            
            impl_result = await self._execute_parallel(impl_plan)
            
            # Combine results
            all_results = {**planning_result.agent_results, **impl_result.agent_results}
            
            return CoordinationResult(
                success=planning_result.success and impl_result.success,
                feature_branch=impl_result.feature_branch,
                agent_results=all_results,
                conflicts_resolved=impl_result.conflicts_resolved,
                manual_conflicts=impl_result.manual_conflicts
            )
        
        return planning_result
    
    async def _create_feature_branch(self, plan: CoordinationPlan) -> str:
        """Create main feature branch."""
        
        feature_id = str(uuid4())[:8]
        branch_name = f"feature/multi-agent-{feature_id}"
        
        await self._run_git_command(f"checkout -b {branch_name} {plan.base_branch}")
        
        return branch_name
    
    async def _create_agent_branch(self, branch_name: str, parent_branch: str):
        """Create a branch for an agent."""
        await self._run_git_command(f"checkout -b {branch_name} {parent_branch}")
    
    async def _execute_single_agent(
        self, 
        assignment: AgentAssignment, 
        plan: CoordinationPlan,
        branch_name: str
    ) -> Dict:
        """Execute a single agent."""
        
        agent = await self.factory.create_agent(assignment.agent_type)
        
        try:
            # Prepare agent input with constraints
            agent_input = AgentInput(
                task_description=assignment.task_description,
                context={
                    "feature_brief": plan.feature_brief,
                    "file_patterns": assignment.file_patterns,
                    "branch_name": branch_name,
                    "coordination_mode": True
                }
            )
            
            # Execute agent
            result = await agent.execute(agent_input)
            
            return {
                "success": result.success,
                "artifacts": result.artifacts,
                "confidence": result.confidence,
                "reasoning": result.reasoning
            }
            
        finally:
            await self.factory.destroy_agent(agent.instance_id)
    
    async def _execute_agent_on_branch(
        self,
        assignment: AgentAssignment,
        plan: CoordinationPlan,
        branch_name: str
    ) -> Dict:
        """Execute agent on its dedicated branch."""
        
        # Switch to agent's branch
        await self._run_git_command(f"checkout {branch_name}")
        
        # Execute agent
        result = await self._execute_single_agent(assignment, plan, branch_name)
        
        # Commit work
        await self._commit_agent_work(assignment.agent_type, assignment.task_description)
        
        return result
    
    async def _merge_agent_branches(
        self,
        agent_branches: List[str],
        feature_branch: str,
        plan: CoordinationPlan
    ) -> tuple[List[str], List[str]]:
        """Merge agent branches with conflict resolution."""
        
        await self._run_git_command(f"checkout {feature_branch}")
        
        conflicts_resolved = []
        manual_conflicts = []
        
        for branch in agent_branches:
            try:
                # Attempt merge
                result = await self._run_git_command(f"merge {branch}", check=False)
                
                if result.returncode != 0:
                    # Handle conflicts
                    conflict_files = await self._detect_merge_conflicts()
                    
                    if plan.strategy.conflict_resolution == "auto":
                        resolved = await self._auto_resolve_conflicts(conflict_files)
                        if resolved:
                            conflicts_resolved.extend(conflict_files)
                            await self._run_git_command("add .")
                            await self._run_git_command(f'commit -m "Auto-resolve conflicts from {branch}"')
                        else:
                            manual_conflicts.extend(conflict_files)
                    elif plan.strategy.conflict_resolution == "ai_assisted":
                        resolved = await self._ai_resolve_conflicts(conflict_files)
                        if resolved:
                            conflicts_resolved.extend(conflict_files)
                        else:
                            manual_conflicts.extend(conflict_files)
                    else:
                        manual_conflicts.extend(conflict_files)
                        
            except Exception as e:
                logger.error("Branch merge failed", branch=branch, error=str(e))
                manual_conflicts.append(f"{branch}: {str(e)}")
        
        return conflicts_resolved, manual_conflicts
    
    async def _ai_resolve_conflicts(self, conflict_files: List[str]) -> bool:
        """Use AI to resolve merge conflicts."""
        
        reviewer = await self.factory.create_agent("reviewer")
        
        try:
            # Analyze conflicts
            conflict_content = {}
            for file_path in conflict_files:
                if Path(file_path).exists():
                    with open(file_path, 'r', encoding='utf-8') as f:
                        conflict_content[file_path] = f.read()
            
            # Let reviewer resolve conflicts
            result = await reviewer.execute(AgentInput(
                task_description="Resolve merge conflicts intelligently",
                context={
                    "conflict_files": conflict_content,
                    "resolution_strategy": "prefer_both_with_intelligence",
                    "output_format": "resolved_files"
                }
            ))
            
            if result.success and "resolved_files" in result.result:
                # Apply resolutions
                for file_path, content in result.result["resolved_files"].items():
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                
                await self._run_git_command("add .")
                await self._run_git_command('commit -m "AI-assisted conflict resolution"')
                return True
            
        except Exception as e:
            logger.error("AI conflict resolution failed", error=str(e))
        finally:
            await self.factory.destroy_agent(reviewer.instance_id)
        
        return False
    
    async def _auto_resolve_conflicts(self, conflict_files: List[str]) -> bool:
        """Simple automatic conflict resolution."""
        
        try:
            for file_path in conflict_files:
                if Path(file_path).exists():
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Simple strategy: take both sides and remove conflict markers
                    resolved_content = content.replace('<<<<<<< HEAD\n', '')
                    resolved_content = resolved_content.replace('=======\n', '\n# --- Merged content ---\n')
                    resolved_content = resolved_content.replace('>>>>>>> ', '# From branch: ')
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(resolved_content)
            
            return True
            
        except Exception as e:
            logger.error("Auto conflict resolution failed", error=str(e))
            return False
    
    async def _detect_merge_conflicts(self) -> List[str]:
        """Detect files with merge conflicts."""
        
        result = await self._run_git_command("diff --name-only --diff-filter=U", check=False)
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip().split('\n')
        return []
    
    async def _commit_agent_work(self, agent_type: str, task_description: str):
        """Commit an agent's work."""
        
        commit_message = f"""
{agent_type}: {task_description}

Generated by {agent_type.title()}Agent
Timestamp: {datetime.now().isoformat()}

Generated with ForgeFlow CoordinatorAgent
Co-Authored-By: {agent_type.title()}Agent <{agent_type}@forgeflow.ai>
        """.strip()
        
        await self._run_git_command("add .")
        await self._run_git_command(f'commit -m "{commit_message}"')
    
    async def _create_github_pr(self, result: CoordinationResult, plan: CoordinationPlan) -> Optional[str]:
        """Create GitHub PR using GitHub CLI."""
        
        try:
            # Check if gh CLI is available
            await self._run_git_command("gh --version")
            
            # Create PR
            pr_title = f"feat: {plan.feature_brief}"
            pr_body = f"""
## Multi-Agent Implementation

**Feature:** {plan.feature_brief}
**Strategy:** {plan.strategy.name}
**Agents Used:** {', '.join(result.agent_results.keys())}

### Agent Contributions

{chr(10).join(f"- **{agent}**: {data.get('reasoning', 'Implementation completed')}" for agent, data in result.agent_results.items())}

### Conflict Resolution

- **Auto-resolved:** {len(result.conflicts_resolved)} conflicts
- **Manual resolution needed:** {len(result.manual_conflicts)} conflicts

Generated with ForgeFlow Multi-Agent Coordination
            """.strip()
            
            gh_result = await self._run_git_command(
                f'gh pr create --title "{pr_title}" --body "{pr_body}" --base {plan.base_branch} --head {result.feature_branch}'
            )
            
            if gh_result.returncode == 0:
                return gh_result.stdout.strip()
                
        except Exception as e:
            logger.warning("Failed to create GitHub PR", error=str(e))
        
        return None
    
    async def _sort_assignments_by_dependencies(self, assignments: List[AgentAssignment]) -> List[AgentAssignment]:
        """Sort assignments by dependencies and priority."""
        
        # Simple topological sort by dependencies
        sorted_assignments = []
        remaining = assignments.copy()
        
        while remaining:
            # Find assignments with no unmet dependencies
            ready = []
            for assignment in remaining:
                deps_met = all(
                    any(a.agent_type == dep for a in sorted_assignments)
                    for dep in assignment.dependencies
                )
                if deps_met:
                    ready.append(assignment)
            
            if not ready:
                # No dependencies, sort by priority
                ready = [min(remaining, key=lambda a: a.priority)]
            
            # Sort ready assignments by priority
            ready.sort(key=lambda a: a.priority)
            
            # Add first ready assignment
            sorted_assignments.append(ready[0])
            remaining.remove(ready[0])
        
        return sorted_assignments
    
    async def _handle_handoff_point(self, current_agent: str, plan: CoordinationPlan):
        """Handle handoff point for human review."""
        
        logger.info("Handoff point reached", agent=current_agent)
        
        # In a real implementation, this would integrate with the WebSocket system
        # to notify the frontend and wait for user approval
        
        # For now, just log the handoff
        handoff_data = {
            "current_agent": current_agent,
            "feature": plan.feature_brief,
            "timestamp": datetime.now().isoformat(),
            "status": "waiting_for_approval"
        }
        
        # Save handoff state
        handoff_file = self.project_path / f"handoff_{current_agent}.json"
        with open(handoff_file, 'w') as f:
            json.dump(handoff_data, f, indent=2)
    
    async def _run_git_command(self, command: str, check: bool = True) -> subprocess.CompletedProcess:
        """Run a git command."""
        
        full_command = f"git {command}"
        result = subprocess.run(
            full_command,
            shell=True,
            cwd=self.project_path,
            capture_output=True,
            text=True,
            check=False
        )
        
        if check and result.returncode != 0:
            raise RuntimeError(f"Git command failed: {full_command}\n{result.stderr}")
        
        return result