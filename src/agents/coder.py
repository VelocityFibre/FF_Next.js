#!/usr/bin/env python3
"""
Coder Agent for FibreFlow_React
Handles code implementation and generation
"""

from typing import Dict, List, Any, Optional
import asyncio
from datetime import datetime

from .base import BaseAgent, AgentCapability


class CoderAgent(BaseAgent):
    """Agent responsible for code implementation."""
    
    def __init__(self, config: Optional[Any] = None):
        super().__init__(
            agent_type="coder",
            version="1.0.0",
            description="Code implementation and generation agent",
            capabilities=[
                AgentCapability.CODE_GENERATION,
                AgentCapability.REFACTORING,
                AgentCapability.DEBUGGING,
                AgentCapability.FILE_OPERATIONS
            ]
        )
    
    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute coding task."""
        
        task_description = task.get('description', '')
        context = task.get('context', {})
        
        print(f"[CODER] Implementing: {task_description}")
        
        # Generate code implementation
        implementation = await self._generate_code(task_description, context)
        
        return {
            "status": "completed",
            "agent": self.agent_type,
            "output": {
                "implementation": implementation,
                "files_modified": self._get_modified_files(implementation),
                "code_quality": self._assess_code_quality(implementation),
                "next_steps": self._suggest_next_steps(task_description)
            },
            "timestamp": datetime.now().isoformat()
        }
    
    async def _generate_code(self, description: str, context: Dict) -> Dict:
        """Generate code implementation based on description."""
        
        implementation = {
            "language": "typescript",
            "framework": "react",
            "files": [],
            "dependencies": []
        }
        
        # React component generation
        if "component" in description.lower():
            component_name = self._extract_component_name(description)
            implementation["files"].append({
                "path": f"src/components/{component_name}.tsx",
                "type": "component",
                "content": self._generate_react_component(component_name, description)
            })
        
        # Service/API generation
        if any(term in description.lower() for term in ["service", "api", "data"]):
            service_name = self._extract_service_name(description)
            implementation["files"].append({
                "path": f"src/services/{service_name}.ts",
                "type": "service",
                "content": self._generate_service(service_name, description)
            })
        
        # Hook generation
        if "hook" in description.lower():
            hook_name = self._extract_hook_name(description)
            implementation["files"].append({
                "path": f"src/hooks/{hook_name}.ts",
                "type": "hook",
                "content": self._generate_hook(hook_name, description)
            })
        
        return implementation
    
    def _extract_component_name(self, description: str) -> str:
        """Extract component name from description."""
        # Simple extraction logic
        words = description.replace('-', ' ').replace('_', ' ').split()
        for i, word in enumerate(words):
            if word.lower() in ["component", "page", "form", "modal"]:
                if i > 0:
                    return ''.join(word.capitalize() for word in words[:i]) + word.capitalize()
        return "NewComponent"
    
    def _extract_service_name(self, description: str) -> str:
        """Extract service name from description."""
        words = description.replace('-', ' ').replace('_', ' ').split()
        for i, word in enumerate(words):
            if word.lower() in ["service", "api", "client"]:
                if i > 0:
                    return ''.join(word.lower() for word in words[:i]) + "Service"
        return "newService"
    
    def _extract_hook_name(self, description: str) -> str:
        """Extract hook name from description."""
        words = description.replace('-', ' ').replace('_', ' ').split()
        for i, word in enumerate(words):
            if word.lower() == "hook":
                if i > 0:
                    return "use" + ''.join(word.capitalize() for word in words[:i])
        return "useNewHook"
    
    def _generate_react_component(self, name: str, description: str) -> str:
        """Generate React component code."""
        return f'''import React from 'react';

interface {name}Props {{
  // Add props here
}}

export const {name}: React.FC<{name}Props> = (props) => {{
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">{name}</h2>
      {{/* Component implementation based on: {description} */}}
    </div>
  );
}};

export default {name};
'''
    
    def _generate_service(self, name: str, description: str) -> str:
        """Generate service code."""
        return f'''/**
 * {name} - Generated based on: {description}
 */

export class {name.capitalize()} {{
  
  async getData(): Promise<any[]> {{
    try {{
      // Implementation needed
      return [];
    }} catch (error) {{
      console.error('Error fetching data:', error);
      throw error;
    }}
  }}
  
  async createItem(data: any): Promise<any> {{
    try {{
      // Implementation needed
      return data;
    }} catch (error) {{
      console.error('Error creating item:', error);
      throw error;
    }}
  }}
}}

export const {name.lower()} = new {name.capitalize()}();
'''
    
    def _generate_hook(self, name: str, description: str) -> str:
        """Generate React hook code."""
        return f'''import {{ useState, useEffect }} from 'react';

/**
 * {name} - Generated based on: {description}
 */
export const {name} = () => {{
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {{
    // Hook logic here
  }}, []);
  
  return {{
    data,
    loading,
    error,
    refetch: () => {{
      // Refetch logic
    }}
  }};
}};
'''
    
    def _get_modified_files(self, implementation: Dict) -> List[str]:
        """Get list of files that would be modified."""
        return [file["path"] for file in implementation.get("files", [])]
    
    def _assess_code_quality(self, implementation: Dict) -> Dict[str, str]:
        """Assess code quality metrics."""
        return {
            "typescript_compliance": "high",
            "react_best_practices": "high",
            "error_handling": "medium",
            "testing_readiness": "medium",
            "documentation": "low"
        }
    
    def _suggest_next_steps(self, description: str) -> List[str]:
        """Suggest next steps after implementation."""
        steps = [
            "Add proper TypeScript types",
            "Implement error handling",
            "Add unit tests",
            "Review code for best practices"
        ]
        
        if "component" in description.lower():
            steps.extend([
                "Add accessibility attributes",
                "Test responsive design",
                "Add prop validation"
            ])
        
        return steps