#!/usr/bin/env python3
"""
Deployment Pipeline Templates for ForgeFlow
Predefined templates for common deployment scenarios
"""

from typing import Dict, List, Any
from .base import PipelineTemplate, TemplateCategory


class DeploymentTemplateRegistry:
    """Registry for deployment pipeline templates."""
    
    def __init__(self):
        self.templates = self._create_default_templates()
    
    def _create_default_templates(self) -> Dict[str, PipelineTemplate]:
        """Create default deployment templates."""
        
        return {
            "simple_deployment": self._create_simple_deployment_template(),
            "staging_production": self._create_staging_production_template(),
            "multi_environment": self._create_multi_environment_template(),
            "ci_cd_full": self._create_full_ci_cd_template(),
            "hotfix_deployment": self._create_hotfix_template(),
            "rollback_pipeline": self._create_rollback_template()
        }
    
    def _create_simple_deployment_template(self) -> PipelineTemplate:
        """Create simple single-environment deployment template."""
        
        return PipelineTemplate(
            id="simple_deployment",
            name="Simple Deployment",
            description="Basic deployment to a single environment",
            category=TemplateCategory.DEPLOYMENT,
            version="1.0.0",
            tags=["deployment", "simple", "single-environment"],
            
            agent_sequence=["deployment"],
            
            default_config={
                "deployment_strategy": "simple",
                "environment": "production",
                "build_required": True,
                "test_required": True,
                "rollback_enabled": True,
                
                "tasks": [
                    {
                        "agent": "deployment",
                        "task_type": "build",
                        "config": {
                            "build_type": "production",
                            "environment": "production"
                        }
                    },
                    {
                        "agent": "deployment", 
                        "task_type": "test",
                        "config": {
                            "test_type": "all",
                            "environment": "production"
                        }
                    },
                    {
                        "agent": "deployment",
                        "task_type": "deploy",
                        "config": {
                            "environment": "production",
                            "force_deploy": False
                        }
                    },
                    {
                        "agent": "deployment",
                        "task_type": "health_check",
                        "config": {
                            "environment": "production"
                        }
                    }
                ]
            },
            
            required_capabilities=["deployment", "testing", "monitoring"],
            
            pipeline_config={
                "max_parallel": 1,
                "timeout_minutes": 30,
                "retry_on_failure": True,
                "max_retries": 2,
                "rollback_on_failure": True
            }
        )
    
    def _create_staging_production_template(self) -> PipelineTemplate:
        """Create staging -> production deployment template."""
        
        return PipelineTemplate(
            id="staging_production",
            name="Staging to Production Pipeline",
            description="Deploy to staging first, then production with approval",
            category=TemplateCategory.DEPLOYMENT,
            version="1.0.0",
            tags=["deployment", "staging", "production", "approval"],
            
            agent_sequence=["deployment"],
            
            default_config={
                "deployment_strategy": "staged",
                "environments": ["staging", "production"],
                "requires_approval": True,
                "build_once": True,
                
                "tasks": [
                    # Build phase
                    {
                        "agent": "deployment",
                        "task_type": "build",
                        "config": {
                            "build_type": "production",
                            "environment": "production"
                        }
                    },
                    
                    # Deploy to staging
                    {
                        "agent": "deployment",
                        "task_type": "deploy",
                        "config": {
                            "environment": "staging",
                            "branch": "develop"
                        }
                    },
                    {
                        "agent": "deployment",
                        "task_type": "test",
                        "config": {
                            "test_type": "integration",
                            "environment": "staging"
                        }
                    },
                    {
                        "agent": "deployment",
                        "task_type": "health_check",
                        "config": {
                            "environment": "staging"
                        }
                    },
                    
                    # Manual approval checkpoint
                    {
                        "agent": "deployment",
                        "task_type": "approval",
                        "config": {
                            "message": "Staging deployment successful. Approve production deployment?",
                            "timeout_minutes": 60
                        }
                    },
                    
                    # Deploy to production
                    {
                        "agent": "deployment",
                        "task_type": "deploy",
                        "config": {
                            "environment": "production",
                            "branch": "main"
                        }
                    },
                    {
                        "agent": "deployment",
                        "task_type": "health_check",
                        "config": {
                            "environment": "production"
                        }
                    }
                ]
            },
            
            required_capabilities=["deployment", "testing", "monitoring"],
            
            pipeline_config={
                "max_parallel": 1,
                "timeout_minutes": 90,
                "retry_on_failure": True,
                "max_retries": 2,
                "rollback_on_failure": True
            }
        )
    
    def _create_multi_environment_template(self) -> PipelineTemplate:
        """Create multi-environment deployment template."""
        
        return PipelineTemplate(
            id="multi_environment",
            name="Multi-Environment Deployment",
            description="Deploy to development, staging, and production environments",
            category=TemplateCategory.DEPLOYMENT,
            version="1.0.0",
            tags=["deployment", "multi-environment", "dev", "staging", "production"],
            
            agent_sequence=["deployment"],
            
            default_config={
                "deployment_strategy": "multi_environment",
                "environments": ["development", "staging", "production"],
                "parallel_environments": ["development"],
                "sequential_environments": ["staging", "production"],
                
                "tasks": [
                    # Build phase
                    {
                        "agent": "deployment",
                        "task_type": "build",
                        "config": {
                            "build_type": "production"
                        }
                    },
                    
                    # Deploy to development (automatic)
                    {
                        "agent": "deployment",
                        "task_type": "deploy",
                        "config": {
                            "environment": "development",
                            "branch": "develop",
                            "auto_approve": True
                        }
                    },
                    
                    # Deploy to staging (with tests)
                    {
                        "agent": "deployment", 
                        "task_type": "deploy",
                        "config": {
                            "environment": "staging",
                            "branch": "staging",
                            "requires_approval": False
                        }
                    },
                    {
                        "agent": "deployment",
                        "task_type": "test",
                        "config": {
                            "test_type": "integration",
                            "environment": "staging"
                        }
                    },
                    
                    # Deploy to production (with approval)
                    {
                        "agent": "deployment",
                        "task_type": "approval",
                        "config": {
                            "message": "Deploy to production?",
                            "timeout_minutes": 120
                        }
                    },
                    {
                        "agent": "deployment",
                        "task_type": "deploy",
                        "config": {
                            "environment": "production",
                            "branch": "main"
                        }
                    },
                    {
                        "agent": "deployment",
                        "task_type": "health_check",
                        "config": {
                            "environment": "production"
                        }
                    }
                ]
            },
            
            required_capabilities=["deployment", "testing", "monitoring"],
            
            pipeline_config={
                "max_parallel": 2,
                "timeout_minutes": 120,
                "retry_on_failure": True,
                "max_retries": 2,
                "rollback_on_failure": True
            }
        )
    
    def _create_full_ci_cd_template(self) -> PipelineTemplate:
        """Create full CI/CD pipeline template."""
        
        return PipelineTemplate(
            id="ci_cd_full",
            name="Complete CI/CD Pipeline",
            description="Full CI/CD with build, test, security scan, and deployment",
            category=TemplateCategory.DEPLOYMENT,
            version="1.0.0",
            tags=["ci-cd", "complete", "security", "quality"],
            
            agent_sequence=["deployment", "reviewer", "tester"],
            
            default_config={
                "deployment_strategy": "full_ci_cd",
                "include_security_scan": True,
                "include_code_review": True,
                "include_performance_tests": True,
                
                "tasks": [
                    # CI Phase
                    {
                        "agent": "deployment",
                        "task_type": "setup_pipeline",
                        "config": {
                            "pipeline_type": "github_actions",
                            "environments": ["development", "staging", "production"]
                        }
                    },
                    
                    # Quality Gates
                    {
                        "agent": "reviewer",
                        "task_type": "code_review",
                        "config": {
                            "include_security": True,
                            "include_performance": True
                        }
                    },
                    {
                        "agent": "tester",
                        "task_type": "test_suite",
                        "config": {
                            "test_types": ["unit", "integration", "e2e"],
                            "coverage_threshold": 80
                        }
                    },
                    
                    # Security Scan
                    {
                        "agent": "deployment",
                        "task_type": "security_scan",
                        "config": {
                            "scan_dependencies": True,
                            "scan_secrets": True,
                            "scan_vulnerabilities": True
                        }
                    },
                    
                    # Build and Deploy
                    {
                        "agent": "deployment",
                        "task_type": "build",
                        "config": {
                            "build_type": "production",
                            "include_source_maps": False
                        }
                    },
                    {
                        "agent": "deployment",
                        "task_type": "deploy",
                        "config": {
                            "environment": "production",
                            "strategy": "blue_green"
                        }
                    },
                    
                    # Post-deployment
                    {
                        "agent": "deployment",
                        "task_type": "health_check",
                        "config": {
                            "environment": "production",
                            "include_performance": True
                        }
                    }
                ]
            },
            
            required_capabilities=["deployment", "testing", "review", "security_scanning", "monitoring"],
            
            pipeline_config={
                "max_parallel": 3,
                "timeout_minutes": 180,
                "retry_on_failure": True,
                "max_retries": 2,
                "rollback_on_failure": True,
                "notification_channels": ["slack", "email"]
            }
        )
    
    def _create_hotfix_template(self) -> PipelineTemplate:
        """Create hotfix deployment template."""
        
        return PipelineTemplate(
            id="hotfix_deployment",
            name="Hotfix Deployment",
            description="Rapid deployment for critical fixes with minimal gates",
            category=TemplateCategory.DEPLOYMENT,
            version="1.0.0", 
            tags=["hotfix", "emergency", "fast", "critical"],
            
            agent_sequence=["deployment", "tester"],
            
            default_config={
                "deployment_strategy": "hotfix",
                "skip_staging": True,
                "minimal_testing": True,
                "fast_track": True,
                
                "tasks": [
                    # Minimal quality gates
                    {
                        "agent": "tester",
                        "task_type": "test",
                        "config": {
                            "test_type": "unit",
                            "timeout_minutes": 5
                        }
                    },
                    
                    # Quick build
                    {
                        "agent": "deployment",
                        "task_type": "build",
                        "config": {
                            "build_type": "production",
                            "fast_build": True
                        }
                    },
                    
                    # Direct to production
                    {
                        "agent": "deployment",
                        "task_type": "deploy",
                        "config": {
                            "environment": "production",
                            "branch": "hotfix",
                            "force_deploy": True,
                            "skip_approval": True
                        }
                    },
                    
                    # Critical health check
                    {
                        "agent": "deployment",
                        "task_type": "health_check",
                        "config": {
                            "environment": "production",
                            "critical_only": True
                        }
                    }
                ]
            },
            
            required_capabilities=["deployment", "testing", "monitoring"],
            
            pipeline_config={
                "max_parallel": 1,
                "timeout_minutes": 15,
                "retry_on_failure": True,
                "max_retries": 1,
                "rollback_on_failure": True,
                "priority": "critical"
            }
        )
    
    def _create_rollback_template(self) -> PipelineTemplate:
        """Create rollback pipeline template."""
        
        return PipelineTemplate(
            id="rollback_pipeline",
            name="Rollback Pipeline", 
            description="Rollback to previous version with verification",
            category=TemplateCategory.DEPLOYMENT,
            version="1.0.0",
            tags=["rollback", "recovery", "emergency"],
            
            agent_sequence=["deployment"],
            
            default_config={
                "deployment_strategy": "rollback",
                "rollback_type": "previous_version",
                "verify_rollback": True,
                
                "tasks": [
                    # Find rollback target
                    {
                        "agent": "deployment",
                        "task_type": "rollback_analysis",
                        "config": {
                            "environment": "production",
                            "find_last_good": True
                        }
                    },
                    
                    # Execute rollback
                    {
                        "agent": "deployment", 
                        "task_type": "rollback",
                        "config": {
                            "environment": "production",
                            "strategy": "immediate"
                        }
                    },
                    
                    # Verify rollback
                    {
                        "agent": "deployment",
                        "task_type": "health_check",
                        "config": {
                            "environment": "production",
                            "post_rollback": True
                        }
                    },
                    
                    # Notify stakeholders
                    {
                        "agent": "deployment",
                        "task_type": "notification",
                        "config": {
                            "message": "Production rollback completed",
                            "channels": ["slack", "email", "pager"]
                        }
                    }
                ]
            },
            
            required_capabilities=["deployment", "monitoring"],
            
            pipeline_config={
                "max_parallel": 1,
                "timeout_minutes": 10,
                "retry_on_failure": True,
                "max_retries": 2,
                "priority": "urgent"
            }
        )
    
    def get_template(self, template_id: str) -> PipelineTemplate:
        """Get template by ID."""
        return self.templates.get(template_id)
    
    def list_templates(self) -> List[PipelineTemplate]:
        """List all deployment templates."""
        return list(self.templates.values())
    
    def get_templates_by_tag(self, tag: str) -> List[PipelineTemplate]:
        """Get templates by tag."""
        return [t for t in self.templates.values() if tag in t.tags]


# Global deployment template registry
_deployment_registry = DeploymentTemplateRegistry()


def get_deployment_templates() -> DeploymentTemplateRegistry:
    """Get the global deployment template registry."""
    return _deployment_registry