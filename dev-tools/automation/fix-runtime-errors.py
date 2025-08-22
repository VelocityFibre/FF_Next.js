#!/usr/bin/env python3
"""
Fix common runtime errors in React TypeScript files
"""

import os
import re
from pathlib import Path

def fix_char_at_errors(content):
    """Fix charAt errors by adding null checks"""
    
    # Pattern 1: Simple charAt on variables
    # project.status.charAt(0) -> (project.status || '').charAt(0)
    pattern1 = r'(\w+)\.(\w+)\.charAt\('
    replacement1 = r'(\1.\2 || "").charAt('
    content = re.sub(pattern1, replacement1, content)
    
    # Pattern 2: charAt with toUpperCase
    # status.charAt(0).toUpperCase() -> (status || '').charAt(0).toUpperCase()
    pattern2 = r'(\w+)\.charAt\(0\)\.toUpperCase\(\)'
    replacement2 = r'(\1 || "").charAt(0).toUpperCase()'
    content = re.sub(pattern2, replacement2, content)
    
    # Pattern 3: Complex charAt expressions with slice
    # value.charAt(0).toUpperCase() + value.slice(1)
    pattern3 = r'(\w+)\.charAt\(0\)\.toUpperCase\(\)\s*\+\s*\1\.slice\(1\)'
    replacement3 = r'(\1 ? \1.charAt(0).toUpperCase() + \1.slice(1) : "")'
    content = re.sub(pattern3, replacement3, content)
    
    return content

def fix_to_date_errors(content):
    """Fix toDate() errors from Firebase timestamps"""
    
    # Pattern: .toDate() without checks
    # timestamp.toDate() -> (timestamp?.toDate ? timestamp.toDate() : new Date())
    pattern = r'(\w+)\.toDate\(\)'
    replacement = r'(\1?.toDate ? \1.toDate() : new Date())'
    content = re.sub(pattern, replacement, content)
    
    return content

def fix_array_access_errors(content):
    """Fix array access without bounds checking"""
    
    # Pattern: array[0] without checks
    # items[0].name -> items?.[0]?.name
    pattern = r'(\w+)\[(\d+)\]\.(\w+)'
    replacement = r'\1?.[\2]?.\3'
    content = re.sub(pattern, replacement, content)
    
    return content

def process_file(filepath):
    """Process a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply fixes
        content = fix_char_at_errors(content)
        content = fix_to_date_errors(content)
        content = fix_array_access_errors(content)
        
        # Write back if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Main function"""
    src_dir = Path("src")
    
    # File patterns to process
    patterns = ["*.tsx", "*.ts"]
    
    # Directories to exclude
    exclude_dirs = {"node_modules", ".git", "dist", "build"}
    
    files_processed = 0
    files_changed = 0
    
    for pattern in patterns:
        for filepath in src_dir.rglob(pattern):
            # Skip excluded directories
            if any(excluded in filepath.parts for excluded in exclude_dirs):
                continue
            
            # Skip test files
            if ".test." in str(filepath) or ".spec." in str(filepath):
                continue
            
            files_processed += 1
            if process_file(filepath):
                files_changed += 1
                print(f"✓ Fixed: {filepath}")
    
    print(f"\nProcessed {files_processed} files, fixed {files_changed} files")
    
    # List specific files that need manual review
    critical_files = [
        "src/pages/ProjectDetail.tsx",
        "src/pages/StaffDetail.tsx", 
        "src/pages/ClientDetail.tsx",
        "src/components/layout/Sidebar.tsx",
        "src/pages/ProjectForm.tsx"
    ]
    
    print("\n⚠️  Critical files to verify:")
    for file in critical_files:
        if Path(file).exists():
            print(f"  - {file}")

if __name__ == "__main__":
    main()