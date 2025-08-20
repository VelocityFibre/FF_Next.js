#!/usr/bin/env python3
"""
Script to identify and help refactor files exceeding 300 lines
according to RULES.md requirements
"""

import os
import shutil
from pathlib import Path
from typing import List, Tuple

def find_large_files(src_dir: str, max_lines: int = 300) -> List[Tuple[str, int]]:
    """Find all TypeScript/TSX files exceeding max_lines."""
    large_files = []
    
    for root, dirs, files in os.walk(src_dir):
        # Skip node_modules and other build directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', 'build', '.git']]
        
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        line_count = sum(1 for _ in f)
                    
                    if line_count > max_lines:
                        large_files.append((file_path, line_count))
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")
    
    return sorted(large_files, key=lambda x: x[1], reverse=True)

def analyze_file_structure(file_path: str) -> dict:
    """Analyze the structure of a TypeScript/TSX file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    analysis = {
        'path': file_path,
        'is_component': file_path.endswith('.tsx'),
        'is_service': 'Service' in file_path or 'service' in file_path,
        'is_types': 'types' in file_path.lower(),
        'has_interfaces': 'interface ' in content,
        'has_classes': 'class ' in content,
        'has_exports': 'export ' in content,
        'import_count': content.count('import '),
        'function_count': content.count('function ') + content.count('const ') + content.count('export const'),
        'suggestions': []
    }
    
    # Add refactoring suggestions
    if analysis['is_types']:
        analysis['suggestions'].append("Split into domain-specific type files")
        analysis['suggestions'].append("Create an index.ts to re-export all types")
    
    if analysis['is_service']:
        analysis['suggestions'].append("Split by functionality (CRUD, validation, utilities)")
        analysis['suggestions'].append("Extract helper functions to separate utils file")
    
    if analysis['is_component'] and analysis['function_count'] > 5:
        analysis['suggestions'].append("Extract sub-components to separate files")
        analysis['suggestions'].append("Move hooks to custom hooks file")
        analysis['suggestions'].append("Extract complex logic to services/utils")
    
    return analysis

def create_backup(file_path: str):
    """Create a backup of the file before refactoring."""
    backup_path = file_path + '.backup'
    shutil.copy2(file_path, backup_path)
    return backup_path

def main():
    src_dir = 'src'
    large_files = find_large_files(src_dir)
    
    print(f"Found {len(large_files)} files exceeding 300 lines:\n")
    print(f"{'File Path':<80} {'Lines':>8}")
    print("-" * 90)
    
    for file_path, line_count in large_files[:10]:  # Show top 10
        rel_path = os.path.relpath(file_path, src_dir)
        print(f"{rel_path:<80} {line_count:>8}")
    
    if len(large_files) > 10:
        print(f"\n... and {len(large_files) - 10} more files")
    
    print(f"\nTotal files to refactor: {len(large_files)}")
    
    # Analyze top 5 files
    print("\n" + "=" * 90)
    print("DETAILED ANALYSIS OF TOP 5 FILES:")
    print("=" * 90)
    
    for file_path, line_count in large_files[:5]:
        print(f"\n[FILE] {os.path.relpath(file_path, src_dir)} ({line_count} lines)")
        analysis = analyze_file_structure(file_path)
        
        print(f"   Type: {'Component' if analysis['is_component'] else 'Service' if analysis['is_service'] else 'Types' if analysis['is_types'] else 'Other'}")
        print(f"   Imports: {analysis['import_count']}")
        print(f"   Functions/Constants: {analysis['function_count']}")
        
        if analysis['suggestions']:
            print("   [SUGGESTIONS]:")
            for suggestion in analysis['suggestions']:
                print(f"      - {suggestion}")
    
    # Summary by type
    print("\n" + "=" * 90)
    print("SUMMARY BY FILE TYPE:")
    print("=" * 90)
    
    types_files = [f for f in large_files if 'types' in f[0].lower()]
    service_files = [f for f in large_files if 'service' in f[0].lower()]
    component_files = [f for f in large_files if f[0].endswith('.tsx')]
    
    print(f"Type files: {len(types_files)}")
    print(f"Service files: {len(service_files)}")
    print(f"Component files: {len(component_files)}")
    
    # Calculate total lines over limit
    total_excess_lines = sum(lines - 300 for _, lines in large_files)
    print(f"\nTotal lines over 300-line limit: {total_excess_lines}")
    print(f"Average lines per file: {sum(l for _, l in large_files) // len(large_files) if large_files else 0}")

if __name__ == "__main__":
    main()