"""
Advanced Dependency Management System - Sophisticated dependency resolution and optimization.

Provides intelligent dependency analysis, circular dependency detection,
optimization recommendations, and dynamic dependency adjustment.
"""

import asyncio
from datetime import datetime
from typing import Any, Dict, List, Optional, Set, Tuple
from uuid import UUID
from collections import defaultdict, deque
# Note: networkx would need to be added to requirements.txt
# For now, implementing simple dependency graph without networkx
# import networkx as nx

import structlog

from .models import AgentExecution, PipelineRun, ExecutionStatus

logger = structlog.get_logger()


class SimpleDependencyGraph:
    """Simple dependency graph implementation without networkx."""
    
    def __init__(self):
        self.nodes: Set[str] = set()
        self.edges: Dict[str, Set[str]] = defaultdict(set)  # node -> set of successors
        self.reverse_edges: Dict[str, Set[str]] = defaultdict(set)  # node -> set of predecessors
        
    def add_node(self, node: str):
        """Add a node to the graph."""
        self.nodes.add(node)
        
    def add_edge(self, from_node: str, to_node: str):
        """Add an edge from from_node to to_node."""
        self.nodes.add(from_node)
        self.nodes.add(to_node)
        self.edges[from_node].add(to_node)
        self.reverse_edges[to_node].add(from_node)
        
    def remove_node(self, node: str):
        """Remove a node and all its edges."""
        if node not in self.nodes:
            return
            
        # Remove all edges involving this node
        for successor in list(self.edges[node]):
            self.reverse_edges[successor].discard(node)
        del self.edges[node]
        
        for predecessor in list(self.reverse_edges[node]):
            self.edges[predecessor].discard(node)
        del self.reverse_edges[node]
        
        self.nodes.discard(node)
        
    def predecessors(self, node: str) -> Set[str]:
        """Get predecessors (dependencies) of a node."""
        return self.reverse_edges.get(node, set())
        
    def successors(self, node: str) -> Set[str]:
        """Get successors (dependents) of a node."""
        return self.edges.get(node, set())
        
    def ancestors(self, node: str, visited: Set[str] = None) -> Set[str]:
        """Get all ancestors (transitive dependencies) of a node."""
        if visited is None:
            visited = set()
        if node in visited:
            return set()  # Avoid cycles
            
        visited.add(node)
        ancestors = set()
        
        for pred in self.predecessors(node):
            ancestors.add(pred)
            ancestors.update(self.ancestors(pred, visited.copy()))
            
        return ancestors
        
    def descendants(self, node: str, visited: Set[str] = None) -> Set[str]:
        """Get all descendants (transitive dependents) of a node."""
        if visited is None:
            visited = set()
        if node in visited:
            return set()  # Avoid cycles
            
        visited.add(node)
        descendants = set()
        
        for succ in self.successors(node):
            descendants.add(succ)
            descendants.update(self.descendants(succ, visited.copy()))
            
        return descendants
        
    def has_cycles(self) -> List[List[str]]:
        """Detect cycles using DFS."""
        visited = set()
        rec_stack = set()
        cycles = []
        
        def dfs(node: str, path: List[str]) -> bool:
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            for neighbor in self.successors(node):
                if neighbor in rec_stack:
                    # Found cycle
                    cycle_start = path.index(neighbor)
                    cycle = path[cycle_start:] + [neighbor]
                    cycles.append(cycle)
                    return True
                elif neighbor not in visited and dfs(neighbor, path.copy()):
                    return True
                    
            rec_stack.remove(node)
            return False
            
        for node in self.nodes:
            if node not in visited:
                dfs(node, [])
                
        return cycles
        
    def topological_sort(self) -> List[str]:
        """Get topological ordering using Kahn's algorithm."""
        in_degree = {node: len(self.predecessors(node)) for node in self.nodes}
        queue = deque([node for node in self.nodes if in_degree[node] == 0])
        result = []
        
        while queue:
            node = queue.popleft()
            result.append(node)
            
            for successor in self.successors(node):
                in_degree[successor] -= 1
                if in_degree[successor] == 0:
                    queue.append(successor)
                    
        if len(result) != len(self.nodes):
            # Cycle detected
            return []
            
        return result


class DependencyGraph:
    """Advanced dependency graph with analysis capabilities."""
    
    def __init__(self):
        self.graph = SimpleDependencyGraph()
        self.agent_metadata: Dict[str, Dict[str, Any]] = {}
    
    def add_agent(
        self, 
        agent_type: str, 
        dependencies: List[str] = None,
        metadata: Dict[str, Any] = None
    ):
        """Add agent with dependencies to the graph."""
        self.graph.add_node(agent_type)
        self.agent_metadata[agent_type] = metadata or {}
        
        if dependencies:
            for dep in dependencies:
                self.graph.add_edge(dep, agent_type)
    
    def remove_agent(self, agent_type: str):
        """Remove agent from the graph."""
        if agent_type in self.graph:
            self.graph.remove_node(agent_type)
            self.agent_metadata.pop(agent_type, None)
    
    def get_dependencies(self, agent_type: str) -> List[str]:
        """Get direct dependencies of an agent."""
        if agent_type not in self.graph.nodes:
            return []
        return list(self.graph.predecessors(agent_type))
    
    def get_dependents(self, agent_type: str) -> List[str]:
        """Get agents that depend on this agent."""
        if agent_type not in self.graph.nodes:
            return []
        return list(self.graph.successors(agent_type))
    
    def get_transitive_dependencies(self, agent_type: str) -> Set[str]:
        """Get all transitive dependencies (ancestors)."""
        if agent_type not in self.graph.nodes:
            return set()
        return self.graph.ancestors(agent_type)
    
    def get_transitive_dependents(self, agent_type: str) -> Set[str]:
        """Get all transitive dependents (descendants)."""
        if agent_type not in self.graph.nodes:
            return set()
        return self.graph.descendants(agent_type)
    
    def has_circular_dependencies(self) -> List[List[str]]:
        """Check for circular dependencies."""
        return self.graph.has_cycles()
    
    def get_topological_order(self) -> List[str]:
        """Get topological ordering of agents."""
        result = self.graph.topological_sort()
        if not result and self.graph.nodes:
            logger.error("topological_sort_failed", reason="cycles_detected")
        return result
    
    def get_execution_levels(self) -> List[List[str]]:
        """Group agents by execution level (agents in same level can run in parallel)."""
        if not self.graph.nodes:
            return []
        
        levels = []
        remaining_nodes = set(self.graph.nodes)
        
        while remaining_nodes:
            # Find nodes with no dependencies among remaining nodes
            current_level = []
            for node in remaining_nodes.copy():
                deps = set(self.get_dependencies(node))
                if not (deps & remaining_nodes):  # No dependencies in remaining nodes
                    current_level.append(node)
                    remaining_nodes.remove(node)
            
            if not current_level:
                # Circular dependency detected
                logger.warning(
                    "circular_dependency_in_execution_levels",
                    remaining_nodes=list(remaining_nodes)
                )
                break
            
            levels.append(sorted(current_level))
        
        return levels
    
    def calculate_critical_path(self, durations: Dict[str, float] = None) -> Tuple[List[str], float]:
        """Calculate critical path through the dependency graph."""
        if not durations:
            durations = {node: 1.0 for node in self.graph.nodes}
        
        # Simple critical path calculation without networkx
        # Use longest path algorithm with topological ordering
        topo_order = self.get_topological_order()
        if not topo_order:
            return [], 0.0
        
        # Calculate longest distances
        distances = {node: 0.0 for node in self.graph.nodes}
        predecessors = {node: None for node in self.graph.nodes}
        
        for node in topo_order:
            node_duration = durations.get(node, 1.0)
            for successor in self.graph.successors(node):
                new_distance = distances[node] + node_duration
                if new_distance > distances[successor]:
                    distances[successor] = new_distance
                    predecessors[successor] = node
        
        # Find the node with maximum distance (end of critical path)
        if not distances:
            return [], 0.0
            
        max_node = max(distances.keys(), key=lambda x: distances[x])
        max_distance = distances[max_node]
        
        # Reconstruct path
        path = []
        current = max_node
        while current is not None:
            path.append(current)
            current = predecessors[current]
        
        path.reverse()
        return path, max_distance
    
    def analyze_parallelism_potential(self) -> Dict[str, Any]:
        """Analyze potential for parallel execution."""
        total_nodes = len(self.graph.nodes)
        if total_nodes == 0:
            return {'potential': 0.0, 'levels': [], 'max_parallel': 0}
        
        levels = self.get_execution_levels()
        max_parallel = max(len(level) for level in levels) if levels else 0
        
        # Calculate parallelism potential (0.0 = fully sequential, 1.0 = fully parallel)
        if total_nodes == 1:
            potential = 1.0
        else:
            # Use level distribution to estimate parallelism
            level_sizes = [len(level) for level in levels]
            avg_level_size = sum(level_sizes) / len(level_sizes) if level_sizes else 0
            potential = min(1.0, avg_level_size / total_nodes)
        
        return {
            'potential': potential,
            'levels': levels,
            'max_parallel': max_parallel,
            'total_levels': len(levels),
            'average_level_size': sum(len(level) for level in levels) / len(levels) if levels else 0
        }
    
    def suggest_optimizations(self) -> List[Dict[str, Any]]:
        """Suggest dependency optimizations."""
        suggestions = []
        
        # Check for circular dependencies
        cycles = self.has_circular_dependencies()
        if cycles:
            suggestions.append({
                'type': 'circular_dependency',
                'severity': 'critical',
                'description': f'Found {len(cycles)} circular dependencies',
                'details': cycles,
                'recommendation': 'Remove or restructure dependencies to eliminate cycles'
            })
        
        # Check for bottleneck nodes
        bottlenecks = []
        for node in self.graph.nodes:
            dependents = list(self.graph.successors(node))
            if len(dependents) > 3:  # Arbitrary threshold
                bottlenecks.append({
                    'node': node,
                    'dependent_count': len(dependents),
                    'dependents': dependents
                })
        
        if bottlenecks:
            suggestions.append({
                'type': 'bottleneck_nodes',
                'severity': 'medium',
                'description': f'Found {len(bottlenecks)} potential bottleneck nodes',
                'details': bottlenecks,
                'recommendation': 'Consider breaking down bottleneck agents or reducing dependencies'
            })
        
        # Check parallelism potential
        parallelism = self.analyze_parallelism_potential()
        if parallelism['potential'] < 0.3:
            suggestions.append({
                'type': 'low_parallelism',
                'severity': 'medium',
                'description': f'Low parallelism potential: {parallelism["potential"]:.2f}',
                'details': parallelism,
                'recommendation': 'Consider restructuring dependencies to enable more parallel execution'
            })
        
        return suggestions


class DependencyResolver:
    """Resolves and validates agent dependencies."""
    
    def __init__(self):
        self.dependency_graph = DependencyGraph()
        self.resolution_cache: Dict[str, List[str]] = {}
    
    def add_execution_dependencies(self, executions: List[AgentExecution]):
        """Add executions and their dependencies to the resolver."""
        # Clear existing graph
        self.dependency_graph = DependencyGraph()
        self.resolution_cache.clear()
        
        # Add all agents first
        for execution in executions:
            metadata = {
                'execution_id': str(execution.id),
                'priority': execution.priority,
                'estimated_duration': execution.estimated_duration or 60.0,
                'max_attempts': execution.max_attempts
            }
            self.dependency_graph.add_agent(
                execution.agent_type, 
                execution.depends_on,
                metadata
            )
    
    def validate_dependencies(self) -> Dict[str, Any]:
        """Validate all dependencies and return validation results."""
        validation_results = {
            'valid': True,
            'errors': [],
            'warnings': [],
            'circular_dependencies': [],
            'missing_dependencies': [],
            'optimizations': []
        }
        
        # Check for circular dependencies
        cycles = self.dependency_graph.has_circular_dependencies()
        if cycles:
            validation_results['valid'] = False
            validation_results['circular_dependencies'] = cycles
            validation_results['errors'].append(
                f"Found {len(cycles)} circular dependency cycles"
            )
        
        # Check for missing dependencies
        all_agents = set(self.dependency_graph.graph.nodes())
        for agent in all_agents:
            dependencies = self.dependency_graph.get_dependencies(agent)
            missing = [dep for dep in dependencies if dep not in all_agents]
            if missing:
                validation_results['missing_dependencies'].extend(missing)
                validation_results['errors'].append(
                    f"Agent {agent} depends on missing agents: {missing}"
                )
        
        # Get optimization suggestions
        validation_results['optimizations'] = self.dependency_graph.suggest_optimizations()
        
        # Add warnings for optimization suggestions
        for opt in validation_results['optimizations']:
            if opt['severity'] in ['medium', 'high']:
                validation_results['warnings'].append(opt['description'])
        
        logger.info(
            "dependency_validation_completed",
            valid=validation_results['valid'],
            error_count=len(validation_results['errors']),
            warning_count=len(validation_results['warnings'])
        )
        
        return validation_results
    
    def get_execution_order(self, strategy: str = 'topological') -> List[str]:
        """Get optimal execution order based on strategy."""
        if strategy == 'topological':
            return self.dependency_graph.get_topological_order()
        elif strategy == 'critical_path':
            critical_path, _ = self.dependency_graph.calculate_critical_path()
            return critical_path
        elif strategy == 'levels':
            levels = self.dependency_graph.get_execution_levels()
            return [agent for level in levels for agent in level]
        else:
            return self.dependency_graph.get_topological_order()
    
    def get_parallel_execution_plan(self) -> List[List[str]]:
        """Get plan for parallel execution grouped by dependency levels."""
        return self.dependency_graph.get_execution_levels()
    
    def can_execute(self, agent_type: str, completed_agents: Set[str]) -> bool:
        """Check if agent can execute given completed agents."""
        dependencies = set(self.dependency_graph.get_dependencies(agent_type))
        return dependencies.issubset(completed_agents)
    
    def get_ready_agents(self, completed_agents: Set[str], all_agents: Set[str]) -> List[str]:
        """Get agents that are ready to execute."""
        ready = []
        remaining_agents = all_agents - completed_agents
        
        for agent in remaining_agents:
            if self.can_execute(agent, completed_agents):
                ready.append(agent)
        
        return ready
    
    def get_dependency_impact(self, agent_type: str) -> Dict[str, Any]:
        """Analyze the impact of an agent's dependencies."""
        direct_deps = self.dependency_graph.get_dependencies(agent_type)
        transitive_deps = self.dependency_graph.get_transitive_dependencies(agent_type)
        direct_dependents = self.dependency_graph.get_dependents(agent_type)
        transitive_dependents = self.dependency_graph.get_transitive_dependents(agent_type)
        
        return {
            'agent_type': agent_type,
            'direct_dependencies': direct_deps,
            'transitive_dependencies': list(transitive_deps),
            'direct_dependents': direct_dependents,
            'transitive_dependents': list(transitive_dependents),
            'dependency_depth': len(transitive_deps),
            'dependent_count': len(transitive_dependents),
            'criticality_score': len(transitive_dependents) / max(len(self.dependency_graph.graph.nodes()), 1)
        }


class DependencyOptimizer:
    """Optimizes dependency structures for better performance."""
    
    def __init__(self, dependency_resolver: DependencyResolver):
        self.resolver = dependency_resolver
        
    def optimize_execution_order(
        self, 
        executions: List[AgentExecution],
        optimization_criteria: List[str] = None
    ) -> List[AgentExecution]:
        """Optimize execution order based on multiple criteria."""
        if not optimization_criteria:
            optimization_criteria = ['dependency_order', 'priority', 'estimated_duration']
        
        # Create optimization scoring
        def optimization_score(execution: AgentExecution) -> Tuple:
            scores = []
            
            if 'dependency_order' in optimization_criteria:
                # Prefer agents with fewer dependencies (can start earlier)
                dep_score = -len(execution.depends_on)
                scores.append(dep_score)
            
            if 'priority' in optimization_criteria:
                # Higher priority first
                scores.append(-execution.priority)
            
            if 'estimated_duration' in optimization_criteria:
                # Longer tasks first (for better parallelization)
                duration_score = -(execution.estimated_duration or 60.0)
                scores.append(duration_score)
            
            if 'criticality' in optimization_criteria:
                # More critical agents (more dependents) first
                impact = self.resolver.get_dependency_impact(execution.agent_type)
                criticality_score = -impact['criticality_score']
                scores.append(criticality_score)
            
            return tuple(scores)
        
        # Sort by optimization score
        optimized_executions = sorted(executions, key=optimization_score)
        
        logger.info(
            "execution_order_optimized",
            total_executions=len(executions),
            criteria=optimization_criteria,
            original_order=[e.agent_type for e in executions],
            optimized_order=[e.agent_type for e in optimized_executions]
        )
        
        return optimized_executions
    
    def suggest_dependency_restructuring(self) -> List[Dict[str, Any]]:
        """Suggest ways to restructure dependencies for better performance."""
        suggestions = []
        
        # Analyze current structure
        parallelism = self.resolver.dependency_graph.analyze_parallelism_potential()
        
        if parallelism['potential'] < 0.4:
            # Low parallelism - suggest restructuring
            suggestions.append({
                'type': 'increase_parallelism',
                'current_potential': parallelism['potential'],
                'description': 'Consider breaking agent dependencies to enable more parallel execution',
                'specific_suggestions': self._generate_parallelism_suggestions()
            })
        
        # Check for long critical paths
        critical_path, path_length = self.resolver.dependency_graph.calculate_critical_path()
        if len(critical_path) > 4:  # Arbitrary threshold
            suggestions.append({
                'type': 'reduce_critical_path',
                'critical_path': critical_path,
                'path_length': path_length,
                'description': 'Long critical path detected - consider reducing sequential dependencies',
                'recommendation': 'Look for opportunities to parallelize agents on the critical path'
            })
        
        return suggestions
    
    def _generate_parallelism_suggestions(self) -> List[str]:
        """Generate specific suggestions for increasing parallelism."""
        suggestions = []
        
        # Find bottleneck nodes
        for node in self.resolver.dependency_graph.graph.nodes():
            dependents = list(self.resolver.dependency_graph.graph.successors(node))
            if len(dependents) > 2:
                suggestions.append(
                    f"Agent '{node}' blocks {len(dependents)} other agents. "
                    f"Consider if some dependents can run without waiting for '{node}'"
                )
        
        # Find long dependency chains
        for node in self.resolver.dependency_graph.graph.nodes():
            transitive_deps = self.resolver.dependency_graph.get_transitive_dependencies(node)
            if len(transitive_deps) > 3:
                suggestions.append(
                    f"Agent '{node}' has a long dependency chain ({len(transitive_deps)} ancestors). "
                    f"Consider if some dependencies are truly necessary"
                )
        
        return suggestions


class DependencyManager:
    """
    Comprehensive dependency management system combining resolution,
    validation, and optimization capabilities.
    """
    
    def __init__(self):
        self.resolver = DependencyResolver()
        self.optimizer = DependencyOptimizer(self.resolver)
        
        # Dependency management statistics
        self.stats = {
            'total_validations': 0,
            'validation_errors': 0,
            'optimizations_applied': 0,
            'circular_dependencies_detected': 0
        }
        
        logger.info("dependency_manager_initialized")
    
    async def analyze_pipeline_dependencies(
        self, 
        pipeline_run: PipelineRun
    ) -> Dict[str, Any]:
        """Comprehensive dependency analysis for a pipeline."""
        self.stats['total_validations'] += 1
        
        # Add executions to resolver
        self.resolver.add_execution_dependencies(pipeline_run.executions)
        
        # Validate dependencies
        validation_results = self.resolver.validate_dependencies()
        
        if not validation_results['valid']:
            self.stats['validation_errors'] += 1
        
        if validation_results['circular_dependencies']:
            self.stats['circular_dependencies_detected'] += len(
                validation_results['circular_dependencies']
            )
        
        # Get execution plan
        parallel_plan = self.resolver.get_parallel_execution_plan()
        
        # Analyze parallelism potential
        parallelism_analysis = self.resolver.dependency_graph.analyze_parallelism_potential()
        
        # Get optimization suggestions
        optimization_suggestions = self.optimizer.suggest_dependency_restructuring()
        
        analysis = {
            'validation': validation_results,
            'execution_plan': {
                'parallel_levels': parallel_plan,
                'total_levels': len(parallel_plan),
                'max_parallel': max(len(level) for level in parallel_plan) if parallel_plan else 0
            },
            'parallelism': parallelism_analysis,
            'optimizations': optimization_suggestions,
            'statistics': self.stats.copy()
        }
        
        logger.info(
            "pipeline_dependency_analysis_completed",
            pipeline_id=str(pipeline_run.id),
            valid=validation_results['valid'],
            error_count=len(validation_results['errors']),
            parallelism_potential=parallelism_analysis['potential']
        )
        
        return analysis
    
    def get_optimized_execution_order(
        self, 
        executions: List[AgentExecution]
    ) -> List[AgentExecution]:
        """Get optimized execution order for better performance."""
        return self.optimizer.optimize_execution_order(executions)
    
    def can_agent_execute(
        self, 
        agent_type: str, 
        completed_agents: Set[str]
    ) -> bool:
        """Check if an agent can execute given completed agents."""
        return self.resolver.can_execute(agent_type, completed_agents)
    
    def get_ready_executions(
        self, 
        pipeline_run: PipelineRun
    ) -> List[AgentExecution]:
        """Get executions that are ready to run based on dependencies."""
        completed_agents = {
            e.agent_type for e in pipeline_run.executions 
            if e.status == ExecutionStatus.SUCCESS
        }
        
        all_agents = {e.agent_type for e in pipeline_run.executions}
        ready_agent_types = self.resolver.get_ready_agents(completed_agents, all_agents)
        
        # Return execution objects for ready agents
        ready_executions = []
        for execution in pipeline_run.executions:
            if (execution.agent_type in ready_agent_types and 
                execution.status == ExecutionStatus.PENDING):
                ready_executions.append(execution)
        
        return ready_executions
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on dependency management system."""
        return {
            'status': 'healthy',
            'total_validations': self.stats['total_validations'],
            'validation_error_rate': (
                (self.stats['validation_errors'] / max(self.stats['total_validations'], 1)) * 100.0
            ),
            'circular_dependencies_detected': self.stats['circular_dependencies_detected'],
            'optimizations_applied': self.stats['optimizations_applied']
        }