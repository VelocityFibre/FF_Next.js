#!/usr/bin/env python3
"""
Tester Agent for FibreFlow_React
Handles test creation and quality assurance
"""

from typing import Dict, List, Any, Optional
import asyncio
from datetime import datetime

from .base import BaseAgent, AgentCapability


class TesterAgent(BaseAgent):
    """Agent responsible for testing and quality assurance."""
    
    def __init__(self, config: Optional[Any] = None):
        super().__init__(
            agent_type="tester",
            version="1.0.0",
            description="Test creation and quality assurance agent",
            capabilities=[
                AgentCapability.TESTING,
                AgentCapability.ANALYSIS,
                AgentCapability.CODE_VALIDATION,
                AgentCapability.QUALITY_ASSURANCE
            ]
        )
    
    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute testing task."""
        
        task_description = task.get('description', '')
        context = task.get('context', {})
        
        print(f"[TESTER] Creating tests for: {task_description}")
        
        # Generate test suite
        test_suite = await self._generate_tests(task_description, context)
        
        return {
            "status": "completed",
            "agent": self.agent_type,
            "output": {
                "test_suite": test_suite,
                "coverage_estimate": self._estimate_coverage(test_suite),
                "test_types": self._identify_test_types(test_suite),
                "quality_metrics": self._calculate_quality_metrics(test_suite)
            },
            "timestamp": datetime.now().isoformat()
        }
    
    async def _generate_tests(self, description: str, context: Dict) -> Dict:
        """Generate comprehensive test suite."""
        
        test_suite = {
            "framework": "vitest",
            "files": [],
            "test_count": 0,
            "categories": []
        }
        
        # Unit tests
        if any(term in description.lower() for term in ["component", "function", "hook"]):
            unit_tests = self._generate_unit_tests(description)
            test_suite["files"].extend(unit_tests)
            test_suite["categories"].append("unit")
        
        # Integration tests
        if any(term in description.lower() for term in ["service", "api", "integration"]):
            integration_tests = self._generate_integration_tests(description)
            test_suite["files"].extend(integration_tests)
            test_suite["categories"].append("integration")
        
        # E2E tests
        if any(term in description.lower() for term in ["feature", "workflow", "user"]):
            e2e_tests = self._generate_e2e_tests(description)
            test_suite["files"].extend(e2e_tests)
            test_suite["categories"].append("e2e")
        
        test_suite["test_count"] = sum(len(file.get("tests", [])) for file in test_suite["files"])
        
        return test_suite
    
    def _generate_unit_tests(self, description: str) -> List[Dict]:
        """Generate unit test files."""
        
        component_name = self._extract_component_name(description)
        
        return [{
            "path": f"src/components/__tests__/{component_name}.test.tsx",
            "type": "unit",
            "tests": [
                {
                    "name": f"renders {component_name} without crashing",
                    "type": "rendering",
                    "content": self._generate_render_test(component_name)
                },
                {
                    "name": f"displays correct content in {component_name}",
                    "type": "content",
                    "content": self._generate_content_test(component_name)
                },
                {
                    "name": f"handles props correctly in {component_name}",
                    "type": "props",
                    "content": self._generate_props_test(component_name)
                }
            ]
        }]
    
    def _generate_integration_tests(self, description: str) -> List[Dict]:
        """Generate integration test files."""
        
        service_name = self._extract_service_name(description)
        
        return [{
            "path": f"src/services/__tests__/{service_name}.integration.test.ts",
            "type": "integration",
            "tests": [
                {
                    "name": f"fetches data successfully from {service_name}",
                    "type": "api",
                    "content": self._generate_api_test(service_name, "fetch")
                },
                {
                    "name": f"handles errors in {service_name}",
                    "type": "error_handling",
                    "content": self._generate_error_test(service_name)
                },
                {
                    "name": f"validates data format from {service_name}",
                    "type": "validation",
                    "content": self._generate_validation_test(service_name)
                }
            ]
        }]
    
    def _generate_e2e_tests(self, description: str) -> List[Dict]:
        """Generate end-to-end test files."""
        
        feature_name = self._extract_feature_name(description)
        
        return [{
            "path": f"dev-tools/testing/tests/e2e/{feature_name}.spec.ts",
            "type": "e2e",
            "tests": [
                {
                    "name": f"user can complete {feature_name} workflow",
                    "type": "workflow",
                    "content": self._generate_workflow_test(feature_name)
                },
                {
                    "name": f"error states work correctly in {feature_name}",
                    "type": "error_state",
                    "content": self._generate_error_state_test(feature_name)
                },
                {
                    "name": f"{feature_name} is accessible",
                    "type": "accessibility",
                    "content": self._generate_accessibility_test(feature_name)
                }
            ]
        }]
    
    def _generate_render_test(self, component_name: str) -> str:
        """Generate render test content."""
        return f'''import {{ render, screen }} from '@testing-library/react';
import {{ {component_name} }} from '../{component_name}';

test('renders {component_name} without crashing', () => {{
  render(<{component_name} />);
  expect(screen.getByRole('heading')).toBeInTheDocument();
}});'''
    
    def _generate_content_test(self, component_name: str) -> str:
        """Generate content test."""
        return f'''test('displays correct content in {component_name}', () => {{
  const testProps = {{ /* add test props */ }};
  render(<{component_name} {{...testProps}} />);
  
  expect(screen.getByText('{component_name}')).toBeInTheDocument();
  // Add more content assertions
}});'''
    
    def _generate_props_test(self, component_name: str) -> str:
        """Generate props test."""
        return f'''test('handles props correctly in {component_name}', () => {{
  const mockProps = {{
    // Define mock props
  }};
  
  render(<{component_name} {{...mockProps}} />);
  
  // Test prop handling
  expect(screen.getByTestId('{component_name.lower()}')).toHaveClass('expected-class');
}});'''
    
    def _generate_api_test(self, service_name: str, operation: str) -> str:
        """Generate API test content."""
        return f'''import {{ {service_name} }} from '../{service_name}';

test('fetches data successfully from {service_name}', async () => {{
  const mockData = [{{ id: 1, name: 'test' }}];
  
  // Mock the API call
  const result = await {service_name}.getData();
  
  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
}});'''
    
    def _generate_error_test(self, service_name: str) -> str:
        """Generate error handling test."""
        return f'''test('handles errors in {service_name}', async () => {{
  // Mock error scenario
  
  await expect({service_name}.getData()).rejects.toThrow();
}});'''
    
    def _generate_validation_test(self, service_name: str) -> str:
        """Generate validation test."""
        return f'''test('validates data format from {service_name}', async () => {{
  const result = await {service_name}.getData();
  
  if (result.length > 0) {{
    expect(result[0]).toHaveProperty('id');
    expect(typeof result[0].id).toBe('number');
  }}
}});'''
    
    def _generate_workflow_test(self, feature_name: str) -> str:
        """Generate workflow test for Playwright."""
        return f'''import {{ test, expect }} from '@playwright/test';

test('user can complete {feature_name} workflow', async ({{ page }}) => {{
  await page.goto('/');
  
  // Navigate to {feature_name}
  await page.click('[data-testid="{feature_name.lower()}-nav"]');
  
  // Complete workflow steps
  await expect(page.locator('h1')).toContainText('{feature_name}');
  
  // Add workflow assertions
}});'''
    
    def _generate_error_state_test(self, feature_name: str) -> str:
        """Generate error state test."""
        return f'''test('error states work correctly in {feature_name}', async ({{ page }}) => {{
  await page.goto('/{feature_name.lower()}');
  
  // Trigger error state
  await page.route('**/api/**', route => {{
    route.fulfill({{
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({{ error: 'Internal server error' }})
    }});
  }});
  
  await page.reload();
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
}});'''
    
    def _generate_accessibility_test(self, feature_name: str) -> str:
        """Generate accessibility test."""
        return f'''test('{feature_name} is accessible', async ({{ page }}) => {{
  await page.goto('/{feature_name.lower()}');
  
  // Check for accessible elements
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[aria-label]')).toHaveCount(1);
  
  // Keyboard navigation
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();
}});'''
    
    def _extract_component_name(self, description: str) -> str:
        """Extract component name from description."""
        words = description.replace('-', ' ').replace('_', ' ').split()
        for i, word in enumerate(words):
            if word.lower() in ["component", "page", "form", "modal"]:
                if i > 0:
                    return ''.join(word.capitalize() for word in words[:i]) + word.capitalize()
        return "TestComponent"
    
    def _extract_service_name(self, description: str) -> str:
        """Extract service name from description."""
        words = description.replace('-', ' ').replace('_', ' ').split()
        for i, word in enumerate(words):
            if word.lower() in ["service", "api", "client"]:
                if i > 0:
                    return ''.join(word.lower() for word in words[:i]) + "Service"
        return "testService"
    
    def _extract_feature_name(self, description: str) -> str:
        """Extract feature name from description."""
        words = description.replace('-', ' ').replace('_', ' ').split()
        return '-'.join(words[:2]) if len(words) > 1 else words[0]
    
    def _estimate_coverage(self, test_suite: Dict) -> str:
        """Estimate test coverage percentage."""
        test_count = test_suite["test_count"]
        
        if test_count >= 10:
            return "85-95%"
        elif test_count >= 5:
            return "70-85%"
        else:
            return "50-70%"
    
    def _identify_test_types(self, test_suite: Dict) -> List[str]:
        """Identify types of tests in the suite."""
        return test_suite.get("categories", ["unit"])
    
    def _calculate_quality_metrics(self, test_suite: Dict) -> Dict[str, str]:
        """Calculate quality metrics for the test suite."""
        return {
            "completeness": "high" if test_suite["test_count"] >= 5 else "medium",
            "coverage": "good" if len(test_suite["categories"]) >= 2 else "basic",
            "maintainability": "high",
            "reliability": "medium"
        }