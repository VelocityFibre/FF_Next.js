#!/bin/bash

# Generate Section Summary Script
# Usage: ./generate-section-summary.sh [section-name] [files-pattern]
# Example: ./generate-section-summary.sh "authentication" "src/services/auth src/contexts/AuthContext"

SECTION=$1
PATTERN=$2

echo "=== Generating Summary for Section: $SECTION ==="
echo ""
echo "Files to process: $PATTERN"
echo ""

# Create prompt file for Claude
cat > /tmp/claude-prompt.txt << EOF
Please analyze these files and create a comprehensive summary following this structure:

# $SECTION

## Overview
- Purpose and responsibility
- Key files and directories  
- Dependencies on other sections

## Architecture
- Design patterns used
- Data flow
- Key abstractions

## Public API
- Exported functions/components
- Key interfaces/types
- Usage examples

## Integration Points
- How it connects to other sections
- Events emitted/consumed
- Database tables accessed

## Technical Debt & TODOs
- Known issues
- Improvement opportunities
- Missing features

---
Files to analyze:
EOF

# Add file contents
for pattern in $PATTERN; do
  echo "Processing: $pattern"
  find $pattern -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) 2>/dev/null | while read file; do
    echo "=== FILE: $file ===" >> /tmp/claude-prompt.txt
    head -100 $file >> /tmp/claude-prompt.txt
    echo "" >> /tmp/claude-prompt.txt
  done
done

echo ""
echo "Prompt generated at: /tmp/claude-prompt.txt"
echo "Size: $(wc -l /tmp/claude-prompt.txt | awk '{print $1}') lines"
echo ""
echo "Next steps:"
echo "1. Copy the prompt to Claude"
echo "2. Save the response to docs/[section].md"
echo "3. Update PROGRESS.md"