#!/usr/bin/env python3
"""
Test Script for All 7 Agents in FibreFlow_React
Verifies that all agents are properly discovered and functional
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

def test_agent_discovery():
    """Test that all 7 agents can be discovered."""
    
    print("="*60)
    print("TESTING AGENT DISCOVERY - FIBREFLOW_REACT")
    print("="*60)
    
    try:
        from src.agents import get_registry, list_agents, get_factory
        
        print("[1/4] Importing agent system...")
        registry = get_registry()
        factory = get_factory()
        print("[OK] Agent system imported successfully")
        
        print("\n[2/4] Discovering agents...")
        agents = list_agents()
        print(f"[OK] Found {len(agents)} agents: {agents}")
        
        print("\n[3/4] Testing agent creation...")
        created_agents = []
        
        for agent_type in agents:
            try:
                agent = factory.create_agent(agent_type)
                created_agents.append(agent_type)
                print(f"✅ Created {agent_type} agent successfully")
                
                # Cleanup
                factory.destroy_agent(agent.instance_id)
                
            except Exception as e:
                print(f"❌ Failed to create {agent_type}: {e}")
        
        print(f"\n[4/4] Summary:")
        print(f"Expected agents: 7")
        print(f"Discovered agents: {len(agents)}")
        print(f"Successfully created: {len(created_agents)}")
        
        if len(agents) == 7 and len(created_agents) == 7:
            print("\n🎉 SUCCESS: All 7 agents working perfectly!")
            return True
        else:
            print(f"\n⚠️  WARNING: Missing {7 - len(agents)} agents")
            return False
            
    except Exception as e:
        print(f"❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_coordinator_specifically():
    """Test the coordinator agent specifically."""
    
    print("\n" + "="*60)
    print("TESTING COORDINATOR AGENT SPECIFICALLY")
    print("="*60)
    
    try:
        from src.agents import get_factory
        
        factory = get_factory()
        
        print("[1/3] Creating CoordinatorAgent...")
        coordinator = factory.create_agent("coordinator")
        print(f"✅ Created coordinator: {coordinator.agent_type} v{coordinator.version}")
        
        print("\n[2/3] Testing coordinator capabilities...")
        capabilities = list(coordinator.capabilities)
        print(f"✅ Capabilities: {capabilities}")
        
        print(f"✅ Description: {coordinator.description}")
        
        print("\n[3/3] Cleanup...")
        factory.destroy_agent(coordinator.instance_id)
        print("✅ Coordinator cleaned up successfully")
        
        print("\n🎉 COORDINATOR TEST PASSED!")
        return True
        
    except Exception as e:
        print(f"❌ COORDINATOR TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_coordination_templates():
    """Test if coordination templates are available."""
    
    print("\n" + "="*60)
    print("TESTING COORDINATION TEMPLATES")
    print("="*60)
    
    try:
        from src.orchestration.templates import get_template_registry
        
        print("[1/2] Loading template registry...")
        template_registry = get_template_registry()
        templates = template_registry.list_templates()
        print(f"✅ Found {len(templates)} total templates")
        
        print("\n[2/2] Finding coordination templates...")
        coordination_templates = []
        
        for template in templates:
            if ("coordination" in template.tags or 
                "multi-agent" in template.tags or
                "multi_agent" in template.id):
                coordination_templates.append(template)
                print(f"✅ Found coordination template: {template.id}")
                print(f"    Name: {template.name}")
                print(f"    Strategy: {template.default_config.get('coordination_strategy', 'N/A')}")
        
        if len(coordination_templates) > 0:
            print(f"\n🎉 SUCCESS: Found {len(coordination_templates)} coordination templates!")
            return True
        else:
            print("\n⚠️  No coordination templates found")
            return False
        
    except Exception as e:
        print(f"❌ TEMPLATE TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    
    print("FIBREFLOW_REACT AGENT SYSTEM VERIFICATION")
    print("Testing all 7 agents + coordination system")
    print()
    
    # Test 1: Agent discovery
    test1_passed = test_agent_discovery()
    
    # Test 2: Coordinator specifically
    test2_passed = test_coordinator_specifically()
    
    # Test 3: Coordination templates
    test3_passed = test_coordination_templates()
    
    # Final summary
    print("\n" + "="*60)
    print("FINAL RESULTS")
    print("="*60)
    
    tests_passed = sum([test1_passed, test2_passed, test3_passed])
    
    print(f"Agent Discovery: {'✅ PASS' if test1_passed else '❌ FAIL'}")
    print(f"Coordinator Test: {'✅ PASS' if test2_passed else '❌ FAIL'}")  
    print(f"Template Test: {'✅ PASS' if test3_passed else '❌ FAIL'}")
    
    print(f"\nOverall: {tests_passed}/3 tests passed")
    
    if tests_passed == 3:
        print("\n🎉 ALL TESTS PASSED! Multi-agent coordination ready!")
        print("\nYou should now see 7 agents when starting ForgeFlow in this project:")
        print("1. Planner")
        print("2. Architect") 
        print("3. Coder")
        print("4. Tester")
        print("5. Reviewer")
        print("6. AntiHallucination")
        print("7. Coordinator (NEW!)")
    else:
        print(f"\n⚠️  {3 - tests_passed} tests failed - check errors above")
    
    return tests_passed == 3


if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        sys.exit(1)