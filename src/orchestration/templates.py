"""
Pipeline Templates and Presets

Provides predefined pipeline configurations for common use cases:
- Web API development
- Data processing pipelines
- Microservice architecture
- Frontend applications
- Full-stack applications
"""

from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from enum import Enum

class TemplateCategory(str, Enum):
    """Categories of pipeline templates."""
    WEB_API = "web_api"
    DATA_PIPELINE = "data_pipeline"
    MICROSERVICE = "microservice"
    FRONTEND = "frontend"
    FULLSTACK = "fullstack"
    MOBILE = "mobile"
    DEVOPS = "devops"
    TESTING = "testing"
    ORCHESTRATION = "orchestration"
    CUSTOM = "custom"

@dataclass
class PipelineTemplate:
    """Pipeline template definition."""
    id: str
    name: str
    description: str
    category: TemplateCategory
    agent_sequence: List[str]
    default_config: Dict[str, Any]
    required_context: List[str]
    optional_context: List[str]
    tags: List[str]
    difficulty: str  # beginner, intermediate, advanced
    estimated_duration: int  # in seconds
    
class PipelineTemplateRegistry:
    """Registry for pipeline templates."""
    
    def __init__(self):
        self.templates: Dict[str, PipelineTemplate] = {}
        self._register_default_templates()
    
    def _register_default_templates(self):
        """Register built-in pipeline templates."""
        
        # Fast API Web Service Template
        self.register(PipelineTemplate(
            id="fastapi_crud",
            name="FastAPI CRUD Service",
            description="Complete REST API with CRUD operations, validation, and testing",
            category=TemplateCategory.WEB_API,
            agent_sequence=[
                "planner",
                "architect", 
                "coder",
                "tester",
                "reviewer",
                "antihallucination"
            ],
            default_config={
                "framework": "FastAPI",
                "database": "PostgreSQL",
                "orm": "SQLAlchemy",
                "testing": "pytest",
                "validation": "Pydantic",
                "authentication": "JWT"
            },
            required_context=["entity_name", "fields"],
            optional_context=["authentication", "authorization", "caching"],
            tags=["api", "rest", "crud", "backend"],
            difficulty="intermediate",
            estimated_duration=300
        ))
        
        # Data Processing Pipeline Template
        self.register(PipelineTemplate(
            id="data_etl",
            name="Data ETL Pipeline",
            description="Extract, Transform, Load pipeline with validation and monitoring",
            category=TemplateCategory.DATA_PIPELINE,
            agent_sequence=[
                "planner",
                "architect",
                "coder",
                "tester",
                "antihallucination"
            ],
            default_config={
                "framework": "Apache Airflow",
                "processing": "Pandas",
                "storage": "S3",
                "monitoring": "Prometheus",
                "scheduling": "Cron"
            },
            required_context=["data_source", "data_destination", "transformations"],
            optional_context=["schedule", "alerts", "retry_policy"],
            tags=["data", "etl", "pipeline", "automation"],
            difficulty="advanced",
            estimated_duration=450
        ))
        
        # Microservice Template
        self.register(PipelineTemplate(
            id="microservice",
            name="Microservice with gRPC",
            description="Containerized microservice with gRPC, health checks, and observability",
            category=TemplateCategory.MICROSERVICE,
            agent_sequence=[
                "planner",
                "architect",
                "coder",
                "tester",
                "reviewer",
                "antihallucination"
            ],
            default_config={
                "communication": "gRPC",
                "containerization": "Docker",
                "orchestration": "Kubernetes",
                "monitoring": "Prometheus + Grafana",
                "tracing": "Jaeger",
                "service_mesh": "Istio"
            },
            required_context=["service_name", "api_definition"],
            optional_context=["dependencies", "scaling_policy", "circuit_breaker"],
            tags=["microservice", "grpc", "kubernetes", "cloud-native"],
            difficulty="advanced",
            estimated_duration=600
        ))
        
        # React Frontend Template
        self.register(PipelineTemplate(
            id="react_spa",
            name="React Single Page Application",
            description="Modern React app with TypeScript, routing, and state management",
            category=TemplateCategory.FRONTEND,
            agent_sequence=[
                "planner",
                "architect",
                "coder",
                "tester",
                "reviewer"
            ],
            default_config={
                "framework": "React 18",
                "language": "TypeScript",
                "styling": "Tailwind CSS",
                "state": "Redux Toolkit",
                "routing": "React Router",
                "testing": "Jest + React Testing Library",
                "bundler": "Vite"
            },
            required_context=["app_name", "features"],
            optional_context=["design_system", "api_endpoints", "authentication"],
            tags=["frontend", "react", "spa", "typescript"],
            difficulty="intermediate",
            estimated_duration=400
        ))
        
        # Full Stack Template
        self.register(PipelineTemplate(
            id="fullstack_nextjs",
            name="Next.js Full Stack Application",
            description="Full-stack app with Next.js, Prisma, and PostgreSQL",
            category=TemplateCategory.FULLSTACK,
            agent_sequence=[
                "planner",
                "architect",
                "coder",
                "tester",
                "reviewer",
                "antihallucination"
            ],
            default_config={
                "framework": "Next.js 14",
                "database": "PostgreSQL",
                "orm": "Prisma",
                "authentication": "NextAuth",
                "styling": "Tailwind CSS",
                "api": "tRPC",
                "deployment": "Vercel"
            },
            required_context=["app_name", "features", "data_model"],
            optional_context=["third_party_integrations", "payment", "analytics"],
            tags=["fullstack", "nextjs", "typescript", "prisma"],
            difficulty="advanced",
            estimated_duration=800
        ))
        
        # Testing Pipeline Template
        self.register(PipelineTemplate(
            id="test_automation",
            name="Automated Testing Suite",
            description="Comprehensive test suite with unit, integration, and E2E tests",
            category=TemplateCategory.TESTING,
            agent_sequence=[
                "planner",
                "tester",
                "reviewer"
            ],
            default_config={
                "unit_testing": "pytest",
                "integration_testing": "pytest",
                "e2e_testing": "Playwright",
                "coverage": "pytest-cov",
                "mocking": "pytest-mock",
                "ci_cd": "GitHub Actions"
            },
            required_context=["codebase_path", "test_requirements"],
            optional_context=["coverage_threshold", "test_environments"],
            tags=["testing", "automation", "qa", "ci-cd"],
            difficulty="intermediate",
            estimated_duration=250
        ))
        
        # DevOps Pipeline Template
        self.register(PipelineTemplate(
            id="devops_cicd",
            name="CI/CD Pipeline Setup",
            description="Complete CI/CD pipeline with testing, building, and deployment",
            category=TemplateCategory.DEVOPS,
            agent_sequence=[
                "planner",
                "architect",
                "coder",
                "reviewer"
            ],
            default_config={
                "ci": "GitHub Actions",
                "containerization": "Docker",
                "registry": "Docker Hub",
                "orchestration": "Kubernetes",
                "monitoring": "Prometheus",
                "secrets": "HashiCorp Vault",
                "infrastructure": "Terraform"
            },
            required_context=["repository", "deployment_target"],
            optional_context=["environments", "approval_workflow", "rollback_strategy"],
            tags=["devops", "ci-cd", "automation", "infrastructure"],
            difficulty="advanced",
            estimated_duration=500
        ))
        
        # Mobile App Template
        self.register(PipelineTemplate(
            id="react_native",
            name="React Native Mobile App",
            description="Cross-platform mobile app with React Native and Expo",
            category=TemplateCategory.MOBILE,
            agent_sequence=[
                "planner",
                "architect",
                "coder",
                "tester",
                "reviewer"
            ],
            default_config={
                "framework": "React Native",
                "platform": "Expo",
                "navigation": "React Navigation",
                "state": "Redux Toolkit",
                "styling": "Styled Components",
                "testing": "Jest + React Native Testing Library",
                "backend": "Firebase"
            },
            required_context=["app_name", "target_platforms", "features"],
            optional_context=["push_notifications", "offline_support", "analytics"],
            tags=["mobile", "react-native", "cross-platform", "expo"],
            difficulty="intermediate",
            estimated_duration=600
        ))
        
        # Multi-Agent Coordination Templates
        self.register(PipelineTemplate(
            id="multi_agent_parallel",
            name="Parallel Multi-Agent Development",
            description="Multiple agents working in parallel with automatic conflict resolution",
            category=TemplateCategory.ORCHESTRATION,
            agent_sequence=["coordinator"],
            default_config={
                "coordination_strategy": "parallel_isolated",
                "conflict_resolution": "ai_assisted", 
                "branch_strategy": "feature_branches",
                "create_pr": True,
                "auto_merge": False
            },
            required_context=["feature_brief", "agent_assignments"],
            optional_context=["base_branch", "target_branch", "handoff_points"],
            tags=["coordination", "multi-agent", "parallel", "git"],
            difficulty="advanced",
            estimated_duration=120
        ))
        
        self.register(PipelineTemplate(
            id="multi_agent_sequential",
            name="Sequential Multi-Agent Pipeline", 
            description="Agents work sequentially with handoff points for review",
            category=TemplateCategory.ORCHESTRATION,
            agent_sequence=["coordinator"],
            default_config={
                "coordination_strategy": "sequential",
                "conflict_resolution": "auto",
                "branch_strategy": "single_branch",
                "handoff_points": ["after_planning", "after_architecture", "before_merge"]
            },
            required_context=["feature_brief"],
            optional_context=["agent_assignments", "base_branch"],
            tags=["coordination", "multi-agent", "sequential", "review"],
            difficulty="intermediate", 
            estimated_duration=90
        ))
        
        self.register(PipelineTemplate(
            id="multi_agent_hybrid",
            name="Hybrid Multi-Agent Workflow",
            description="Sequential planning followed by parallel implementation",
            category=TemplateCategory.ORCHESTRATION,
            agent_sequence=["coordinator"],
            default_config={
                "coordination_strategy": "hybrid_review",
                "conflict_resolution": "ai_assisted",
                "branch_strategy": "feature_branches", 
                "handoff_points": ["after_planning", "before_implementation", "before_merge"],
                "create_pr": True
            },
            required_context=["feature_brief"],
            optional_context=["agent_assignments", "base_branch", "review_required"],
            tags=["coordination", "multi-agent", "hybrid", "planning", "parallel"],
            difficulty="advanced",
            estimated_duration=150
        ))
    
    def register(self, template: PipelineTemplate):
        """Register a new pipeline template."""
        self.templates[template.id] = template
    
    def get_template(self, template_id: str) -> Optional[PipelineTemplate]:
        """Get a template by ID."""
        return self.templates.get(template_id)
    
    def list_templates(self, category: Optional[TemplateCategory] = None) -> List[PipelineTemplate]:
        """List all templates, optionally filtered by category."""
        templates = list(self.templates.values())
        if category:
            templates = [t for t in templates if t.category == category]
        return templates
    
    def search_templates(self, query: str) -> List[PipelineTemplate]:
        """Search templates by name, description, or tags."""
        query_lower = query.lower()
        results = []
        
        for template in self.templates.values():
            if (query_lower in template.name.lower() or
                query_lower in template.description.lower() or
                any(query_lower in tag for tag in template.tags)):
                results.append(template)
        
        return results
    
    def get_template_config(self, template_id: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate pipeline configuration from template and user context.
        
        Merges template defaults with user-provided context.
        """
        template = self.get_template(template_id)
        if not template:
            raise ValueError(f"Template {template_id} not found")
        
        # Validate required context
        missing = []
        for required in template.required_context:
            if required not in user_context:
                missing.append(required)
        
        if missing:
            raise ValueError(f"Missing required context: {', '.join(missing)}")
        
        # Merge configurations
        config = template.default_config.copy()
        config.update(user_context)
        
        return {
            "template_id": template_id,
            "name": f"{template.name} - {user_context.get('name', 'Pipeline')}",
            "description": template.description,
            "agent_sequence": template.agent_sequence,
            "config": config,
            "estimated_duration": template.estimated_duration
        }
    
    def create_custom_template(
        self,
        name: str,
        description: str,
        agent_sequence: List[str],
        config: Dict[str, Any],
        tags: Optional[List[str]] = None
    ) -> PipelineTemplate:
        """Create a custom template from user specifications."""
        template = PipelineTemplate(
            id=f"custom_{name.lower().replace(' ', '_')}",
            name=name,
            description=description,
            category=TemplateCategory.CUSTOM,
            agent_sequence=agent_sequence,
            default_config=config,
            required_context=[],
            optional_context=list(config.keys()),
            tags=tags or ["custom"],
            difficulty="custom",
            estimated_duration=len(agent_sequence) * 60  # Rough estimate
        )
        
        self.register(template)
        return template


# Global registry instance
_template_registry = PipelineTemplateRegistry()

def get_template_registry() -> PipelineTemplateRegistry:
    """Get the global template registry."""
    return _template_registry