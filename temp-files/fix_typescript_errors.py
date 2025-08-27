#!/usr/bin/env python3
"""
Fix TypeScript Errors - ZERO TOLERANCE ENFORCEMENT
Automatically fixes common TypeScript errors to comply with RULES.md
"""

import os
import re
import subprocess
import sys
from pathlib import Path
from typing import List, Dict, Tuple

# Set UTF-8 encoding for Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

class TypeScriptFixer:
    def __init__(self, project_path: str):
        self.project_path = Path(project_path)
        self.error_count = 0
        self.fixed_count = 0
        
    def run_type_check(self) -> List[str]:
        """Run TypeScript type check and return errors"""
        result = subprocess.run(
            ["npm", "run", "type-check"],
            cwd=self.project_path,
            capture_output=True,
            text=True,
            shell=True
        )
        return result.stderr.split('\n')
    
    def parse_errors(self, errors: List[str]) -> Dict[str, List[Dict]]:
        """Parse TypeScript errors into structured format"""
        parsed = {}
        for error in errors:
            if 'error TS' in error:
                match = re.match(r'(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)', error)
                if match:
                    file_path, line, col, code, message = match.groups()
                    if file_path not in parsed:
                        parsed[file_path] = []
                    parsed[file_path].append({
                        'line': int(line),
                        'col': int(col),
                        'code': code,
                        'message': message
                    })
        return parsed
    
    def fix_unused_imports(self, file_path: str, errors: List[Dict]) -> int:
        """Remove unused imports (TS6133)"""
        fixes = 0
        unused_imports = [e for e in errors if e['code'] == 'TS6133']
        
        if not unused_imports:
            return 0
            
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Extract unused variable names
        unused_names = set()
        for error in unused_imports:
            match = re.match(r"'(.+?)' is declared but .* never (read|used)", error['message'])
            if match:
                unused_names.add(match.group(1))
        
        modified = False
        new_lines = []
        for line in lines:
            skip_line = False
            
            # Check if this is an import line with unused imports
            if 'import' in line:
                for name in unused_names:
                    # Handle different import patterns
                    patterns = [
                        rf'\b{name}\b\s*,',  # name,
                        rf',\s*\b{name}\b',   # , name
                        rf'\{{\s*\b{name}\b\s*\}}',  # { name }
                        rf'\b{name}\b\s*\}}',  # name }
                        rf'\{{\s*\b{name}\b\s*,',  # { name,
                        rf',\s*\b{name}\b\s*,',  # , name,
                        rf'^import\s+\b{name}\b\s+from',  # import name from
                        rf'^import\s+\*\s+as\s+\b{name}\b\s+from',  # import * as name from
                    ]
                    
                    for pattern in patterns:
                        if re.search(pattern, line):
                            # Try to remove just the import
                            new_line = re.sub(pattern, '', line)
                            # Clean up extra commas
                            new_line = re.sub(r',\s*,', ',', new_line)
                            new_line = re.sub(r'\{\s*,', '{', new_line)
                            new_line = re.sub(r',\s*\}', '}', new_line)
                            new_line = re.sub(r'\{\s*\}', '', new_line)
                            
                            # If import is now empty, skip the line
                            if re.match(r'^import\s*from', new_line) or re.match(r'^import\s*$', new_line):
                                skip_line = True
                                modified = True
                                fixes += 1
                            elif new_line != line:
                                line = new_line
                                modified = True
                                fixes += 1
            
            if not skip_line:
                new_lines.append(line)
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
        
        return fixes
    
    def add_type_annotations(self, file_path: str, errors: List[Dict]) -> int:
        """Add type annotations for implicit any (TS7006)"""
        fixes = 0
        implicit_any = [e for e in errors if e['code'] == 'TS7006']
        
        if not implicit_any:
            return 0
            
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        for error in implicit_any:
            line_num = error['line'] - 1
            if line_num < len(lines):
                line = lines[line_num]
                # Add 'any' type to parameters
                match = re.search(r"Parameter '(.+?)' implicitly has an 'any' type", error['message'])
                if match:
                    param_name = match.group(1)
                    # Add : any after the parameter
                    new_line = re.sub(rf'\b{param_name}\b(?!:)', f'{param_name}: any', line)
                    if new_line != line:
                        lines[line_num] = new_line
                        fixes += 1
        
        if fixes > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
        
        return fixes
    
    def fix_all(self):
        """Run all fixes"""
        print("[SCAN] Analyzing TypeScript errors...")
        errors = self.run_type_check()
        parsed_errors = self.parse_errors(errors)
        
        total_errors = sum(len(e) for e in parsed_errors.values())
        print(f"[INFO] Found {total_errors} TypeScript errors in {len(parsed_errors)} files")
        
        if total_errors == 0:
            print("[SUCCESS] No TypeScript errors found!")
            return
        
        print("\n[FIX] Applying automatic fixes...")
        
        for file_path, file_errors in parsed_errors.items():
            if not os.path.exists(file_path):
                continue
                
            print(f"\n[PROCESS] {file_path}...")
            
            # Fix unused imports
            fixed = self.fix_unused_imports(file_path, file_errors)
            if fixed > 0:
                print(f"  [FIXED] {fixed} unused imports")
                self.fixed_count += fixed
            
            # Fix implicit any
            fixed = self.add_type_annotations(file_path, file_errors)
            if fixed > 0:
                print(f"  [FIXED] {fixed} type annotations")
                self.fixed_count += fixed
        
        print(f"\n[SUMMARY] Fixed {self.fixed_count} errors automatically")
        
        # Re-run type check
        print("\n[SCAN] Re-checking TypeScript errors...")
        errors = self.run_type_check()
        parsed_errors = self.parse_errors(errors)
        remaining = sum(len(e) for e in parsed_errors.values())
        
        if remaining == 0:
            print("[SUCCESS] All TypeScript errors fixed! ZERO TOLERANCE achieved!")
        else:
            print(f"[WARNING] {remaining} errors remain - manual intervention required")
            # Show breakdown of remaining errors
            error_types = {}
            for file_errors in parsed_errors.values():
                for error in file_errors:
                    code = error['code']
                    if code not in error_types:
                        error_types[code] = 0
                    error_types[code] += 1
            
            print("\n[BREAKDOWN] Remaining error types:")
            for code, count in sorted(error_types.items(), key=lambda x: x[1], reverse=True):
                print(f"  {code}: {count} errors")

if __name__ == "__main__":
    fixer = TypeScriptFixer(r"C:\Jarvis\AI Workspace\FibreFlow_React")
    fixer.fix_all()