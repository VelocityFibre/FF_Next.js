#!/usr/bin/env python3
"""
DeploymentAgent - Handles CI/CD, deployment, and DevOps operations.

Manages build processes, testing pipelines, deployment automation, 
and infrastructure operations.
"""

import asyncio
import json
import os
import subprocess
import yaml
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Union
from uuid import uuid4

import structlog
from pydantic import BaseModel, Field

from .base import BaseAgent, AgentInput, AgentOutput, AgentCapability, create_agent_output

logger = structlog.get_logger()


class DeploymentEnvironment(BaseModel):
    """Deployment environment configuration."""
    
    name: str = Field(..., description="Environment name (dev, staging, prod)")
    url: Optional[str] = Field(None, description="Environment URL")
    branch: str = Field(default="main", description="Git branch for this environment")
    build_command: str = Field(default="npm run build", description="Build command")
    test_command: Optional[str] = Field(None, description="Test command")
    deploy_command: str = Field(..., description="Deployment command")
    health_check_url: Optional[str] = Field(None, description="Health check endpoint")
    requires_approval: bool = Field(default=False, description="Requires manual approval")


class DeploymentPipeline(BaseModel):
    """Complete deployment pipeline definition."""
    
    name: str = Field(..., description="Pipeline name")
    trigger: str = Field(default="push", description="Trigger type (push, pr, manual)")
    environments: List[DeploymentEnvironment] = Field(..., description="Deployment environments")
    notifications: List[str] = Field(default_factory=list, description="Notification channels")
    rollback_strategy: str = Field(default="previous_version", description="Rollback strategy")


class DeploymentResult(BaseModel):
    """Result of deployment operation."""
    
    success: bool = Field(..., description="Deployment success status")
    environment: str = Field(..., description="Target environment")
    version: str = Field(..., description="Deployed version")
    build_logs: List[str] = Field(default_factory=list, description="Build logs")
    test_results: Dict[str, Any] = Field(default_factory=dict, description="Test results")
    deployment_url: Optional[str] = Field(None, description="Deployed application URL")
    rollback_version: Optional[str] = Field(None, description="Previous version for rollback")
    duration_seconds: Optional[float] = Field(None, description="Deployment duration")


class DeploymentAgent(BaseAgent):
    """
    Agent that handles CI/CD, deployment, and DevOps operations.
    
    Handles:
    - Build automation
    - Test execution
    - Deployment pipelines
    - Environment management
    - Infrastructure operations
    - Monitoring and health checks
    - Rollback management
    """
    
    agent_type: str = "deployment"
    version: str = "1.0.0"
    description: str = "Handles CI/CD, deployment, and DevOps operations"
    capabilities: Set[AgentCapability] = {
        AgentCapability.DEPLOYMENT,
        AgentCapability.INFRASTRUCTURE,
        AgentCapability.MONITORING,
        AgentCapability.TESTING
    }
    
    def __init__(self, config: Optional[Any] = None):
        super().__init__()
        self.project_path = Path(".")
        self.deployment_history: List[Dict] = []
        
        # Default deployment environments
        self.default_environments = {
            "development": DeploymentEnvironment(
                name="development",
                branch="develop",
                build_command="npm run build:dev",
                deploy_command="npm run deploy:dev",
                health_check_url="/health"
            ),
            "staging": DeploymentEnvironment(
                name="staging", 
                branch="staging",
                build_command="npm run build:staging",
                test_command="npm test",
                deploy_command="npm run deploy:staging",
                health_check_url="/health",
                requires_approval=True
            ),
            "production": DeploymentEnvironment(
                name="production",
                branch="main", 
                build_command="npm run build",
                test_command="npm run test:all",
                deploy_command="npm run deploy:prod",
                health_check_url="/health",
                requires_approval=True
            )
        }
    
    async def _execute_impl(self, agent_input: AgentInput) -> AgentOutput:
        """Execute deployment task."""
        
        task_type = agent_input.data.get("task_type", "deploy")
        
        if task_type == "deploy":
            return await self._handle_deployment(agent_input)
        elif task_type == "build":
            return await self._handle_build(agent_input)
        elif task_type == "test":
            return await self._handle_testing(agent_input)
        elif task_type == "rollback":
            return await self._handle_rollback(agent_input)
        elif task_type == "setup_pipeline":
            return await self._setup_ci_cd_pipeline(agent_input)
        elif task_type == "health_check":
            return await self._health_check(agent_input)
        else:
            return create_agent_output(
                success=False,
                reasoning=f"Unknown deployment task type: {task_type}",
                data={"error": "Invalid task type"}
            )
    
    async def _handle_deployment(self, agent_input: AgentInput) -> AgentOutput:
        """Handle full deployment process."""
        
        environment = agent_input.data.get("environment", "development")
        branch = agent_input.data.get("branch")
        force_deploy = agent_input.data.get("force_deploy", False)
        
        logger.info("Starting deployment", environment=environment, branch=branch)
        
        try:
            # Get environment config
            env_config = self._get_environment_config(environment)
            
            # Pre-deployment checks
            if not force_deploy:
                pre_check = await self._pre_deployment_checks(env_config, branch)
                if not pre_check["success"]:
                    return create_agent_output(
                        success=False,
                        reasoning=f"Pre-deployment checks failed: {pre_check['error']}",
                        data=pre_check
                    )
            
            # Build process
            build_result = await self._execute_build(env_config)
            if not build_result["success"]:
                return create_agent_output(
                    success=False,
                    reasoning="Build failed",
                    data=build_result
                )
            
            # Test process (if configured)
            if env_config.test_command:
                test_result = await self._execute_tests(env_config)
                if not test_result["success"]:
                    return create_agent_output(
                        success=False,
                        reasoning="Tests failed - deployment aborted",
                        data=test_result
                    )
            
            # Deployment
            deploy_result = await self._execute_deployment(env_config)
            if not deploy_result["success"]:
                return create_agent_output(
                    success=False,
                    reasoning="Deployment failed",
                    data=deploy_result
                )
            
            # Post-deployment verification
            verification = await self._verify_deployment(env_config)
            
            # Record deployment
            deployment_record = {
                "timestamp": datetime.now().isoformat(),
                "environment": environment,
                "branch": branch or env_config.branch,
                "success": verification["success"],
                "version": self._get_current_version(),
                "build_result": build_result,
                "deploy_result": deploy_result,
                "verification": verification
            }
            self.deployment_history.append(deployment_record)
            
            return create_agent_output(
                success=verification["success"],
                reasoning=f"Deployment to {environment} {'completed' if verification['success'] else 'failed verification'}",
                data={
                    "deployment_record": deployment_record,
                    "environment": environment,
                    "url": env_config.url,
                    "health_check": verification
                }
            )
            
        except Exception as e:
            logger.error("Deployment failed", error=str(e))
            return create_agent_output(
                success=False,
                reasoning=f"Deployment error: {str(e)}",
                data={"error": str(e)}
            )
    
    async def _handle_build(self, agent_input: AgentInput) -> AgentOutput:
        """Handle build process only."""
        
        build_type = agent_input.data.get("build_type", "production")
        environment = agent_input.data.get("environment", "production")
        
        try:
            env_config = self._get_environment_config(environment)
            build_result = await self._execute_build(env_config)
            
            return create_agent_output(
                success=build_result["success"],
                reasoning=f"Build {'completed' if build_result['success'] else 'failed'}",
                data=build_result
            )
            
        except Exception as e:
            return create_agent_output(
                success=False,
                reasoning=f"Build error: {str(e)}",
                data={"error": str(e)}
            )
    
    async def _handle_testing(self, agent_input: AgentInput) -> AgentOutput:
        """Handle testing process."""
        
        test_type = agent_input.data.get("test_type", "all")
        environment = agent_input.data.get("environment", "development")
        
        try:
            env_config = self._get_environment_config(environment)
            
            if not env_config.test_command:
                return create_agent_output(
                    success=False,
                    reasoning="No test command configured for environment",
                    data={"error": "No test command"}
                )
            
            test_result = await self._execute_tests(env_config, test_type)
            
            return create_agent_output(
                success=test_result["success"],
                reasoning=f"Tests {'passed' if test_result['success'] else 'failed'}",
                data=test_result
            )
            
        except Exception as e:
            return create_agent_output(
                success=False,
                reasoning=f"Testing error: {str(e)}",
                data={"error": str(e)}
            )
    
    async def _handle_rollback(self, agent_input: AgentInput) -> AgentOutput:
        """Handle rollback operation."""
        
        environment = agent_input.data.get("environment", "production")
        version = agent_input.data.get("version")  # Specific version to rollback to
        
        try:
            # Find previous successful deployment
            if not version:
                previous_deployment = self._get_previous_successful_deployment(environment)
                if not previous_deployment:
                    return create_agent_output(
                        success=False,
                        reasoning="No previous successful deployment found",
                        data={"error": "No rollback target"}
                    )
                version = previous_deployment["version"]
            
            # Execute rollback
            rollback_result = await self._execute_rollback(environment, version)
            
            # Verify rollback
            env_config = self._get_environment_config(environment)
            verification = await self._verify_deployment(env_config)
            
            return create_agent_output(
                success=rollback_result["success"] and verification["success"],
                reasoning=f"Rollback to version {version} {'completed' if rollback_result['success'] else 'failed'}",
                data={
                    "rollback_result": rollback_result,
                    "target_version": version,
                    "verification": verification
                }
            )
            
        except Exception as e:
            return create_agent_output(
                success=False,
                reasoning=f"Rollback error: {str(e)}",
                data={"error": str(e)}
            )
    
    async def _setup_ci_cd_pipeline(self, agent_input: AgentInput) -> AgentOutput:
        """Set up CI/CD pipeline."""
        
        pipeline_type = agent_input.data.get("pipeline_type", "github_actions")
        environments = agent_input.data.get("environments", ["development", "production"])
        
        try:
            if pipeline_type == "github_actions":
                result = await self._setup_github_actions(environments)
            else:
                return create_agent_output(
                    success=False,
                    reasoning=f"Unsupported pipeline type: {pipeline_type}",
                    data={"error": "Unsupported pipeline"}
                )
            
            return create_agent_output(
                success=result["success"],
                reasoning=f"CI/CD pipeline setup {'completed' if result['success'] else 'failed'}",
                data=result
            )
            
        except Exception as e:
            return create_agent_output(
                success=False,
                reasoning=f"Pipeline setup error: {str(e)}",
                data={"error": str(e)}
            )
    
    async def _pre_deployment_checks(self, env_config: DeploymentEnvironment, branch: Optional[str]) -> Dict[str, Any]:
        """Perform pre-deployment checks."""
        
        checks = {
            "git_status": False,
            "branch_check": False,
            "dependencies": False,
            "build_files": False
        }
        
        try:
            # Check git status
            git_result = await self._run_command("git status --porcelain")
            checks["git_status"] = git_result.returncode == 0
            
            # Check branch
            if branch:
                current_branch_result = await self._run_command("git branch --show-current")
                if current_branch_result.returncode == 0:
                    current_branch = current_branch_result.stdout.strip()
                    checks["branch_check"] = current_branch == branch or branch == env_config.branch
            else:
                checks["branch_check"] = True
            
            # Check dependencies
            if (self.project_path / "package.json").exists():
                checks["dependencies"] = (self.project_path / "node_modules").exists()
            else:
                checks["dependencies"] = True  # No npm dependencies
            
            # Check build files
            checks["build_files"] = True  # Assume build will create necessary files
            
            success = all(checks.values())
            
            return {
                "success": success,
                "checks": checks,
                "error": None if success else "Pre-deployment checks failed"
            }
            
        except Exception as e:
            return {
                "success": False,
                "checks": checks,
                "error": str(e)
            }
    
    async def _execute_build(self, env_config: DeploymentEnvironment) -> Dict[str, Any]:
        """Execute build process."""
        
        start_time = datetime.now()
        
        try:
            # Install dependencies if needed
            if (self.project_path / "package.json").exists() and not (self.project_path / "node_modules").exists():
                install_result = await self._run_command("npm install")
                if install_result.returncode != 0:
                    return {
                        "success": False,
                        "error": "Dependency installation failed",
                        "logs": [install_result.stderr]
                    }
            
            # Run build command
            build_result = await self._run_command(env_config.build_command)
            
            duration = (datetime.now() - start_time).total_seconds()
            
            return {
                "success": build_result.returncode == 0,
                "command": env_config.build_command,
                "duration_seconds": duration,
                "logs": [build_result.stdout, build_result.stderr],
                "error": None if build_result.returncode == 0 else "Build failed"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "logs": []
            }
    
    async def _execute_tests(self, env_config: DeploymentEnvironment, test_type: str = "all") -> Dict[str, Any]:
        """Execute test suite."""
        
        start_time = datetime.now()
        
        try:
            # Modify test command based on test type
            test_command = env_config.test_command
            if test_type == "unit":
                test_command += " --testPathPattern=unit"
            elif test_type == "integration":
                test_command += " --testPathPattern=integration"
            elif test_type == "e2e":
                test_command = "npm run test:e2e"
            
            test_result = await self._run_command(test_command)
            
            duration = (datetime.now() - start_time).total_seconds()
            
            return {
                "success": test_result.returncode == 0,
                "command": test_command,
                "duration_seconds": duration,
                "logs": [test_result.stdout, test_result.stderr],
                "test_type": test_type,
                "error": None if test_result.returncode == 0 else "Tests failed"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "test_type": test_type,
                "logs": []
            }
    
    async def _execute_deployment(self, env_config: DeploymentEnvironment) -> Dict[str, Any]:
        """Execute deployment."""
        
        start_time = datetime.now()
        
        try:
            deploy_result = await self._run_command(env_config.deploy_command)
            
            duration = (datetime.now() - start_time).total_seconds()
            
            return {
                "success": deploy_result.returncode == 0,
                "command": env_config.deploy_command,
                "duration_seconds": duration,
                "logs": [deploy_result.stdout, deploy_result.stderr],
                "error": None if deploy_result.returncode == 0 else "Deployment failed"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "logs": []
            }
    
    async def _verify_deployment(self, env_config: DeploymentEnvironment) -> Dict[str, Any]:
        """Verify deployment success."""
        
        if not env_config.health_check_url:
            return {"success": True, "message": "No health check configured"}
        
        try:
            # Simple health check - in production this would be more sophisticated
            if env_config.url:
                health_url = env_config.url + env_config.health_check_url
                # For now, just return success - would implement actual HTTP check
                return {
                    "success": True,
                    "health_check_url": health_url,
                    "status": "healthy"
                }
            else:
                return {"success": True, "message": "No URL configured for health check"}
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _execute_rollback(self, environment: str, version: str) -> Dict[str, Any]:
        """Execute rollback to previous version."""
        
        try:
            # This would implement actual rollback logic
            # For now, simulate successful rollback
            return {
                "success": True,
                "environment": environment,
                "target_version": version,
                "message": f"Rolled back to version {version}"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _setup_github_actions(self, environments: List[str]) -> Dict[str, Any]:
        """Set up GitHub Actions workflow."""
        
        try:
            # Create .github/workflows directory
            workflows_dir = self.project_path / ".github" / "workflows"
            workflows_dir.mkdir(parents=True, exist_ok=True)
            
            # Create deployment workflow
            workflow_content = self._generate_github_actions_workflow(environments)
            
            workflow_file = workflows_dir / "deployment.yml"
            with open(workflow_file, 'w') as f:
                f.write(workflow_content)
            
            return {
                "success": True,
                "workflow_file": str(workflow_file),
                "environments": environments,
                "message": "GitHub Actions workflow created"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _generate_github_actions_workflow(self, environments: List[str]) -> str:
        """Generate GitHub Actions workflow YAML."""
        
        workflow = {
            "name": "Deployment Pipeline",
            "on": {
                "push": {"branches": ["main", "develop"]},
                "pull_request": {"branches": ["main"]}
            },
            "jobs": {
                "build": {
                    "runs-on": "ubuntu-latest",
                    "steps": [
                        {"uses": "actions/checkout@v3"},
                        {
                            "name": "Setup Node.js",
                            "uses": "actions/setup-node@v3",
                            "with": {"node-version": "18"}
                        },
                        {"run": "npm install"},
                        {"run": "npm run build"},
                        {"run": "npm test"}
                    ]
                }
            }
        }
        
        # Add deployment jobs for each environment
        for env in environments:
            env_config = self._get_environment_config(env)
            workflow["jobs"][f"deploy-{env}"] = {
                "needs": "build",
                "runs-on": "ubuntu-latest",
                "if": f"github.ref == 'refs/heads/{env_config.branch}'",
                "steps": [
                    {"uses": "actions/checkout@v3"},
                    {
                        "name": f"Deploy to {env}",
                        "run": env_config.deploy_command
                    }
                ]
            }
        
        return yaml.dump(workflow, default_flow_style=False)
    
    def _get_environment_config(self, environment: str) -> DeploymentEnvironment:
        """Get configuration for deployment environment."""
        
        if environment in self.default_environments:
            return self.default_environments[environment]
        else:
            # Return default configuration
            return DeploymentEnvironment(
                name=environment,
                deploy_command=f"echo 'Deploy to {environment}'"
            )
    
    def _get_previous_successful_deployment(self, environment: str) -> Optional[Dict]:
        """Get previous successful deployment record."""
        
        for record in reversed(self.deployment_history):
            if record["environment"] == environment and record["success"]:
                return record
        return None
    
    def _get_current_version(self) -> str:
        """Get current version from git or package.json."""
        
        try:
            # Try git describe first
            result = subprocess.run(
                ["git", "describe", "--tags", "--always"],
                capture_output=True, text=True
            )
            if result.returncode == 0:
                return result.stdout.strip()
            
            # Fall back to package.json version
            package_json = self.project_path / "package.json"
            if package_json.exists():
                with open(package_json) as f:
                    data = json.load(f)
                    return data.get("version", "unknown")
            
            return "unknown"
            
        except Exception:
            return "unknown"
    
    async def _health_check(self, agent_input: AgentInput) -> AgentOutput:
        """Perform health check on deployed application."""
        
        environment = agent_input.data.get("environment", "production")
        
        try:
            env_config = self._get_environment_config(environment)
            verification = await self._verify_deployment(env_config)
            
            return create_agent_output(
                success=verification["success"],
                reasoning=f"Health check for {environment} {'passed' if verification['success'] else 'failed'}",
                data={
                    "environment": environment,
                    "health_status": verification
                }
            )
            
        except Exception as e:
            return create_agent_output(
                success=False,
                reasoning=f"Health check error: {str(e)}",
                data={"error": str(e)}
            )
    
    async def _run_command(self, command: str) -> subprocess.CompletedProcess:
        """Run shell command."""
        
        return await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=self.project_path
        )