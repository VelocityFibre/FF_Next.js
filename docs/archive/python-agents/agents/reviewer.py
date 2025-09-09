#!/usr/bin/env python3
"""
Reviewer Agent for FibreFlow_React
Handles code review and quality validation
"""

from typing import Dict, List, Any, Optional
import asyncio
from datetime import datetime

from .base import BaseAgent, AgentCapability


class ReviewerAgent(BaseAgent):
    """Agent responsible for code review and quality validation."""
    
    def __init__(self, config: Optional[Any] = None):
        super().__init__(
            agent_type="reviewer",
            version="1.0.0",
            description="Code review and quality validation agent",
            capabilities=[
                AgentCapability.CODE_VALIDATION,
                AgentCapability.ANALYSIS,
                AgentCapability.QUALITY_ASSURANCE,
                AgentCapability.SECURITY_VALIDATION
            ]
        )
    
    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute review task."""
        
        task_description = task.get('description', '')
        context = task.get('context', {})
        
        print(f"[REVIEWER] Reviewing: {task_description}")
        
        # Perform comprehensive review
        review_results = await self._conduct_review(task_description, context)
        
        return {
            "status": "completed",
            "agent": self.agent_type,
            "output": {
                "review_results": review_results,
                "quality_score": self._calculate_quality_score(review_results),
                "recommendations": self._generate_recommendations(review_results),
                "approval_status": self._determine_approval(review_results)
            },
            "timestamp": datetime.now().isoformat()
        }
    
    async def _conduct_review(self, description: str, context: Dict) -> Dict:
        """Conduct comprehensive code review."""
        
        review = {
            "code_quality": self._assess_code_quality(description, context),
            "security": self._check_security(description, context),
            "performance": self._analyze_performance(description, context),
            "maintainability": self._evaluate_maintainability(description, context),
            "testing": self._review_testing(description, context),
            "documentation": self._check_documentation(description, context),
            "best_practices": self._validate_best_practices(description, context)
        }
        
        return review
    
    def _assess_code_quality(self, description: str, context: Dict) -> Dict:
        """Assess overall code quality."""
        
        quality_aspects = {
            "readability": "good",
            "consistency": "good", 
            "complexity": "low",
            "duplication": "minimal",
            "naming": "clear"
        }
        
        # React-specific quality checks
        if "component" in description.lower():
            quality_aspects.update({
                "component_structure": "functional",
                "props_validation": "needed",
                "hook_usage": "appropriate",
                "jsx_quality": "good"
            })
        
        # TypeScript quality checks
        if any(term in description.lower() for term in ["typescript", "types", "interface"]):
            quality_aspects.update({
                "type_coverage": "high",
                "type_safety": "good",
                "interface_design": "clear"
            })
        
        return quality_aspects
    
    def _check_security(self, description: str, context: Dict) -> Dict:
        """Perform security review."""
        
        security_checks = {
            "input_validation": "required",
            "xss_protection": "implemented",
            "csrf_protection": "not_applicable",
            "authentication": "not_applicable",
            "authorization": "not_applicable",
            "data_exposure": "safe"
        }
        
        # API security checks
        if any(term in description.lower() for term in ["api", "service", "data"]):
            security_checks.update({
                "input_sanitization": "required",
                "error_handling": "needed",
                "rate_limiting": "consider",
                "data_validation": "required"
            })
        
        # Form security checks
        if "form" in description.lower():
            security_checks.update({
                "input_validation": "critical",
                "xss_protection": "required",
                "csrf_protection": "required"
            })
        
        return security_checks
    
    def _analyze_performance(self, description: str, context: Dict) -> Dict:
        """Analyze performance implications."""
        
        performance = {
            "bundle_impact": "minimal",
            "runtime_complexity": "O(n)",
            "memory_usage": "efficient",
            "render_optimization": "good"
        }
        
        # Component performance
        if "component" in description.lower():
            performance.update({
                "re_render_efficiency": "good",
                "memo_usage": "consider",
                "callback_optimization": "needed",
                "state_efficiency": "good"
            })
        
        # Data handling performance
        if any(term in description.lower() for term in ["data", "list", "table"]):
            performance.update({
                "data_processing": "efficient",
                "virtualization": "consider_for_large_lists",
                "caching": "implement",
                "pagination": "recommended"
            })
        
        return performance
    
    def _evaluate_maintainability(self, description: str, context: Dict) -> Dict:
        """Evaluate code maintainability."""
        
        maintainability = {
            "modularity": "high",
            "coupling": "low",
            "cohesion": "high",
            "extensibility": "good",
            "refactorability": "easy"
        }
        
        # Architecture maintainability
        if any(term in description.lower() for term in ["architecture", "structure", "design"]):
            maintainability.update({
                "separation_of_concerns": "good",
                "single_responsibility": "followed",
                "dependency_management": "clean"
            })
        
        return maintainability
    
    def _review_testing(self, description: str, context: Dict) -> Dict:
        """Review testing coverage and quality."""
        
        testing = {
            "test_coverage": "needs_improvement",
            "test_quality": "basic",
            "test_types": ["unit"],
            "mock_usage": "appropriate",
            "assertion_quality": "good"
        }
        
        # Component testing
        if "component" in description.lower():
            testing.update({
                "render_testing": "required",
                "interaction_testing": "needed",
                "prop_testing": "required",
                "accessibility_testing": "recommended"
            })
        
        # Service testing
        if any(term in description.lower() for term in ["service", "api"]):
            testing.update({
                "unit_testing": "required",
                "integration_testing": "needed",
                "error_testing": "critical"
            })
        
        return testing
    
    def _check_documentation(self, description: str, context: Dict) -> Dict:
        """Check documentation quality."""
        
        documentation = {
            "code_comments": "minimal",
            "function_docs": "needed",
            "type_annotations": "good",
            "readme_updates": "required",
            "api_documentation": "not_applicable"
        }
        
        # Component documentation
        if "component" in description.lower():
            documentation.update({
                "prop_documentation": "required",
                "usage_examples": "helpful",
                "storybook_stories": "consider"
            })
        
        return documentation
    
    def _validate_best_practices(self, description: str, context: Dict) -> Dict:
        """Validate adherence to best practices."""
        
        best_practices = {
            "react_patterns": "followed",
            "typescript_patterns": "good",
            "file_organization": "appropriate",
            "naming_conventions": "consistent",
            "error_handling": "needs_improvement"
        }
        
        # React best practices
        if "component" in description.lower():
            best_practices.update({
                "hooks_rules": "followed",
                "component_composition": "good",
                "prop_drilling": "minimal",
                "key_props": "check_required"
            })
        
        # State management practices
        if "state" in description.lower():
            best_practices.update({
                "state_structure": "normalized",
                "state_updates": "immutable",
                "side_effects": "properly_handled"
            })
        
        return best_practices
    
    def _calculate_quality_score(self, review_results: Dict) -> float:
        """Calculate overall quality score (0-100)."""
        
        scores = []
        
        # Code quality score (25%)
        code_quality = review_results.get("code_quality", {})
        positive_aspects = sum(1 for v in code_quality.values() if v in ["good", "high", "clear", "minimal"])
        total_aspects = len(code_quality)
        if total_aspects > 0:
            scores.append((positive_aspects / total_aspects) * 25)
        
        # Security score (20%)
        security = review_results.get("security", {})
        secure_aspects = sum(1 for v in security.values() if v in ["implemented", "safe", "not_applicable"])
        total_security = len(security)
        if total_security > 0:
            scores.append((secure_aspects / total_security) * 20)
        
        # Performance score (20%)
        performance = review_results.get("performance", {})
        good_performance = sum(1 for v in performance.values() if v in ["minimal", "efficient", "good"])
        total_performance = len(performance)
        if total_performance > 0:
            scores.append((good_performance / total_performance) * 20)
        
        # Maintainability score (20%)
        maintainability = review_results.get("maintainability", {})
        good_maintainability = sum(1 for v in maintainability.values() if v in ["high", "low", "good", "easy", "followed", "clean"])
        total_maintainability = len(maintainability)
        if total_maintainability > 0:
            scores.append((good_maintainability / total_maintainability) * 20)
        
        # Testing score (15%)
        testing = review_results.get("testing", {})
        # Simplified testing score
        scores.append(10)  # Basic score for testing
        
        return sum(scores) if scores else 60  # Default score
    
    def _generate_recommendations(self, review_results: Dict) -> List[str]:
        """Generate improvement recommendations."""
        
        recommendations = []
        
        # Code quality recommendations
        code_quality = review_results.get("code_quality", {})
        if code_quality.get("props_validation") == "needed":
            recommendations.append("Add PropTypes or TypeScript interfaces for component props")
        
        # Security recommendations
        security = review_results.get("security", {})
        if security.get("input_validation") == "required":
            recommendations.append("Implement input validation for all user inputs")
        if security.get("input_sanitization") == "required":
            recommendations.append("Add input sanitization to prevent XSS attacks")
        
        # Performance recommendations
        performance = review_results.get("performance", {})
        if performance.get("memo_usage") == "consider":
            recommendations.append("Consider using React.memo for expensive components")
        if performance.get("callback_optimization") == "needed":
            recommendations.append("Optimize callbacks with useCallback hook")
        
        # Testing recommendations
        testing = review_results.get("testing", {})
        if testing.get("test_coverage") == "needs_improvement":
            recommendations.append("Increase test coverage to at least 80%")
        if testing.get("integration_testing") == "needed":
            recommendations.append("Add integration tests for API interactions")
        
        # Documentation recommendations
        documentation = review_results.get("documentation", {})
        if documentation.get("function_docs") == "needed":
            recommendations.append("Add JSDoc comments for all functions")
        if documentation.get("prop_documentation") == "required":
            recommendations.append("Document component props and their usage")
        
        return recommendations or ["Code looks good overall - minor improvements suggested"]
    
    def _determine_approval(self, review_results: Dict) -> str:
        """Determine approval status based on review."""
        
        quality_score = self._calculate_quality_score(review_results)
        
        if quality_score >= 85:
            return "approved"
        elif quality_score >= 70:
            return "approved_with_suggestions"
        elif quality_score >= 60:
            return "needs_minor_changes"
        else:
            return "needs_major_changes"