#!/usr/bin/env python3
"""
Unicode-safe test script for all 7 agents in FibreFlow_React
"""

import sys
import os
from pathlib import Path

# Set encoding for Windows
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

def test_agent_discovery():
    """Test that all 7 agents can be discovered."""
    
    print("=" * 60)
    print("TESTING AGENT DISCOVERY - FIBREFLOW_REACT")
    print("=" * 60)
    
    try:
        from src.agents import get_registry, list_agents, get_factory
        
        print("[1/4] Importing agent system...")
        registry = get_registry()
        factory = get_factory()
        print("SUCCESS: Agent system imported")
        
        print("\n[2/4] Discovering agents...")
        agents = list_agents()
        print(f"SUCCESS: Found {len(agents)} agents")
        print(f"Agents: {agents}")
        
        print("\n[3/4] Testing agent creation...")
        created_agents = []
        failed_agents = []
        
        for agent_type in agents:
            try:
                agent = factory.create_agent(agent_type)
                created_agents.append(agent_type)
                print(f"SUCCESS: Created {agent_type} agent")
                
                # Test basic properties
                print(f"  Type: {agent.agent_type}")
                print(f"  Version: {agent.version}")
                print(f"  Capabilities: {len(agent.capabilities)}")
                
                # Cleanup
                factory.destroy_agent(agent.instance_id)
                
            except Exception as e:
                failed_agents.append((agent_type, str(e)))
                print(f"FAILED: Could not create {agent_type}: {e}")
        
        print(f"\n[4/4] Summary:")
        print(f"Expected agents: 7")
        print(f"Discovered agents: {len(agents)}")
        print(f"Successfully created: {len(created_agents)}")
        print(f"Failed: {len(failed_agents)}")
        
        if failed_agents:
            print("\nFailure details:")
            for agent_type, error in failed_agents:
                print(f"  {agent_type}: {error}")
        
        if len(agents) == 7 and len(created_agents) == 7:
            print("\nSUCCESS: All 7 agents working perfectly!")
            return True
        else:
            print(f"\nWARNING: Missing {7 - len(agents)} agents or {7 - len(created_agents)} creation failures")
            return False
            
    except Exception as e:
        print(f"CRITICAL FAILURE: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_coordinator_specifically():
    """Test the coordinator agent specifically."""
    
    print("\n" + "=" * 60)
    print("TESTING COORDINATOR AGENT")
    print("=" * 60)
    
    try:
        from src.agents import get_factory
        
        factory = get_factory()
        
        print("[1/3] Creating CoordinatorAgent...")
        coordinator = factory.create_agent("coordinator")
        print(f"SUCCESS: Created coordinator")
        print(f"  Type: {coordinator.agent_type}")
        print(f"  Version: {coordinator.version}")
        
        print("\n[2/3] Testing coordinator capabilities...")
        capabilities = list(coordinator.capabilities)
        print(f"SUCCESS: Capabilities loaded")
        print(f"  Count: {len(capabilities)}")
        print(f"  List: {capabilities}")
        
        print(f"\nDescription: {coordinator.description}")
        
        print("\n[3/3] Cleanup...")
        factory.destroy_agent(coordinator.instance_id)
        print("SUCCESS: Coordinator cleaned up")
        
        print("\nCOORDINATOR TEST PASSED!")
        return True
        
    except Exception as e:
        print(f"COORDINATOR TEST FAILED: {e}")
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
    
    # Final summary
    print("\n" + "=" * 60)
    print("FINAL RESULTS")
    print("=" * 60)
    
    tests_passed = sum([test1_passed, test2_passed])
    
    print(f"Agent Discovery: {'PASS' if test1_passed else 'FAIL'}")
    print(f"Coordinator Test: {'PASS' if test2_passed else 'FAIL'}")
    
    print(f"\nOverall: {tests_passed}/2 tests passed")
    
    if tests_passed == 2:
        print("\nALL TESTS PASSED! Multi-agent coordination ready!")
        print("\nYou should now see 7 agents when starting ForgeFlow:")
        print("1. planner")
        print("2. architect") 
        print("3. coder")
        print("4. tester")
        print("5. reviewer")
        print("6. antihallucination")
        print("7. coordinator (NEW FOR MULTI-AGENT COORDINATION!)")
    else:
        print(f"\n{2 - tests_passed} tests failed - check errors above")
    
    return tests_passed == 2


if __name__ == "__main__":
    try:
        success = main()
        print(f"\nTest result: {'SUCCESS' if success else 'FAILURE'}")
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        sys.exit(1)