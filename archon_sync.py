#!/usr/bin/env python3
"""
Archon Task Synchronization for FibreFlow React Project
Project ID: a82eb260-b1ca-4581-bbb5-d71719beefd3
"""

import json
import sys
from pathlib import Path
from datetime import datetime

# Project configuration
ARCHON_PROJECT_ID = "a82eb260-b1ca-4581-bbb5-d71719beefd3"
PROJECT_PATH = Path("C:/Jarvis/AI Workspace/FibreFlow_React")
TASKS_FILE = PROJECT_PATH / "ARCHON_TASKS.json"
CONFIG_FILE = PROJECT_PATH / "archon_project_config.json"

def load_tasks():
    """Load tasks from ARCHON_TASKS.json"""
    if not TASKS_FILE.exists():
        print(f"[ERROR] Tasks file not found: {TASKS_FILE}")
        return None
    
    with open(TASKS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def verify_project_connection():
    """Verify the Archon project connection"""
    print(f"[INFO] Verifying Archon project connection...")
    print(f"       Project ID: {ARCHON_PROJECT_ID}")
    print(f"       Project Path: {PROJECT_PATH}")
    
    # Check if config file exists
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            config = json.load(f)
            
        if config.get('archon_project_id') == ARCHON_PROJECT_ID:
            print(f"[OK] Project configuration verified")
            print(f"     - Project Name: {config.get('project_name')}")
            print(f"     - Total Tasks: {config['project_statistics']['total_tasks']}")
            print(f"     - Completed: {config['project_statistics']['completed_tasks']}")
            print(f"     - Completion: {config['project_statistics']['completion_percentage']}%")
            return True
        else:
            print(f"[ERROR] Project ID mismatch!")
            print(f"        Expected: {ARCHON_PROJECT_ID}")
            print(f"        Found: {config.get('archon_project_id')}")
            return False
    else:
        print(f"[ERROR] Configuration file not found: {CONFIG_FILE}")
        return False

def generate_archon_commands():
    """Generate Archon commands for task management"""
    tasks_data = load_tasks()
    if not tasks_data:
        return
    
    print("\n" + "="*60)
    print("ARCHON COMMANDS FOR TASK MANAGEMENT")
    print("="*60)
    
    print("\n[1] LIST ALL TASKS:")
    print(f"archon:manage_task(action='list', project_id='{ARCHON_PROJECT_ID}')")
    
    print("\n[2] LIST CRITICAL TASKS (3 blockers):")
    print(f"archon:manage_task(action='list', project_id='{ARCHON_PROJECT_ID}', filter_by='priority', filter_value='critical')")
    
    print("\n[3] LIST HIGH PRIORITY TASKS (5 tasks):")
    print(f"archon:manage_task(action='list', project_id='{ARCHON_PROJECT_ID}', filter_by='priority', filter_value='high')")
    
    print("\n[4] START WORKING ON A TASK (Example: CRIT-001):")
    print(f"archon:manage_task(action='update', task_id='CRIT-001', update_fields={{'status': 'in_progress'}})")
    
    print("\n[5] COMPLETE A TASK (Example: CRIT-001):")
    print(f"archon:manage_task(action='update', task_id='CRIT-001', update_fields={{'status': 'completed'}})")
    
    print("\n[6] CREATE NEW TASK:")
    print(f"archon:manage_task(action='create', project_id='{ARCHON_PROJECT_ID}', title='New Task Title', description='Task description', priority='medium')")
    
    print("\n[7] SEARCH PROJECT KNOWLEDGE:")
    print(f"archon:perform_rag_query(query='TypeScript configuration', project_id='{ARCHON_PROJECT_ID}')")
    
    print("\n[8] SEARCH CODE EXAMPLES:")
    print(f"archon:search_code_examples(query='Firebase auth React', project_id='{ARCHON_PROJECT_ID}')")

def display_task_summary():
    """Display a summary of all tasks"""
    tasks_data = load_tasks()
    if not tasks_data:
        return
    
    print("\n" + "="*60)
    print("TASK SUMMARY")
    print("="*60)
    
    # Count tasks by priority
    priority_counts = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
    status_counts = {'todo': 0, 'in_progress': 0, 'completed': 0}
    
    for task in tasks_data['tasks']:
        priority_counts[task['priority']] += 1
        status_counts[task['status']] += 1
    
    print(f"\nBY PRIORITY:")
    print(f"  [CRITICAL] : {priority_counts['critical']} tasks")
    print(f"  [HIGH]     : {priority_counts['high']} tasks")
    print(f"  [MEDIUM]   : {priority_counts['medium']} tasks")
    print(f"  [LOW]      : {priority_counts['low']} tasks")
    
    print(f"\nBY STATUS:")
    print(f"  [TODO]       : {status_counts['todo']} tasks")
    print(f"  [IN PROGRESS]: {status_counts['in_progress']} tasks")
    print(f"  [COMPLETED]  : {status_counts['completed']} tasks")
    
    print(f"\nCRITICAL BLOCKERS:")
    for task in tasks_data['tasks']:
        if task['priority'] == 'critical':
            blocked = len(task.get('blocked_tasks', []))
            print(f"  - {task['task_id']}: {task['title']}")
            if blocked > 0:
                print(f"    [!] Blocking {blocked} other tasks: {', '.join(task['blocked_tasks'])}")

def display_next_actions():
    """Display recommended next actions"""
    print("\n" + "="*60)
    print("RECOMMENDED NEXT ACTIONS")
    print("="*60)
    
    print("\n[1] FIX TYPESCRIPT ERRORS (CRIT-001)")
    print("    - Check tsconfig.json configuration")
    print("    - Resolve type definition conflicts")
    print("    - Fix import path issues")
    print("    - Run: npm run typecheck")
    
    print("\n[2] TEST FIREBASE CONNECTION (CRIT-002)")
    print("    - Verify .env.local has correct keys")
    print("    - Test authentication flow")
    print("    - Check Firestore read/write")
    print("    - Verify offline persistence")
    
    print("\n[3] CONFIGURE ESLINT (CRIT-003)")
    print("    - Install @typescript-eslint/parser")
    print("    - Configure .eslintrc.json")
    print("    - Add React and TypeScript rules")
    print("    - Run: npm run lint")
    
    print("\n[4] CREATE CORE SERVICES (HIGH-005)")
    print("    - No blockers - can start immediately")
    print("    - Base service patterns")
    print("    - API interceptors")
    print("    - Utility functions")
    
    print("\n[5] BEGIN POLE TRACKER (HIGH-001)")
    print("    - After fixing TypeScript errors")
    print("    - Start with desktop UI")
    print("    - Implement GPS tracking")
    print("    - Add photo capture")

def main():
    """Main execution"""
    print("="*60)
    print("ARCHON PROJECT SYNC - FIBREFLOW REACT")
    print(f"Project ID: {ARCHON_PROJECT_ID}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    # Verify connection
    if not verify_project_connection():
        print("\n[ERROR] Failed to verify project connection")
        sys.exit(1)
    
    # Display task summary
    display_task_summary()
    
    # Generate Archon commands
    generate_archon_commands()
    
    # Display next actions
    display_next_actions()
    
    print("\n" + "="*60)
    print("SYNC COMPLETE")
    print("="*60)
    print("\n[INFO] Use the Archon commands above to manage tasks")
    print("[INFO] Focus on CRITICAL tasks first to unblock development")
    print("[INFO] Project completion: 43.5% (37/85 tasks)")
    print("[INFO] Estimated days remaining: 35-48")

if __name__ == "__main__":
    main()