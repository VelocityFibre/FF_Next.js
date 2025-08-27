#!/bin/bash

# Script to fix invalid Tailwind CSS classes that reference CSS variables incorrectly
# This fixes the development server styling issues

echo "🎨 Fixing CSS class references for proper Tailwind compilation..."

# Find all TSX files and fix CSS variable references
find src -name "*.tsx" -type f -exec sed -i \
    -e 's/bg-background-primary/bg-[var(--ff-background-primary)]/g' \
    -e 's/bg-background-secondary/bg-[var(--ff-background-secondary)]/g' \
    -e 's/bg-background-tertiary/bg-[var(--ff-background-tertiary)]/g' \
    -e 's/bg-background-inverse/bg-[var(--ff-background-inverse)]/g' \
    -e 's/bg-surface-primary/bg-[var(--ff-surface-primary)]/g' \
    -e 's/bg-surface-secondary/bg-[var(--ff-surface-secondary)]/g' \
    -e 's/bg-surface-tertiary/bg-[var(--ff-surface-tertiary)]/g' \
    -e 's/bg-surface-elevated/bg-[var(--ff-surface-elevated)]/g' \
    -e 's/bg-surface-overlay/bg-[var(--ff-surface-overlay)]/g' \
    -e 's/text-text-primary/text-[var(--ff-text-primary)]/g' \
    -e 's/text-text-secondary/text-[var(--ff-text-secondary)]/g' \
    -e 's/text-text-tertiary/text-[var(--ff-text-tertiary)]/g' \
    -e 's/text-text-inverse/text-[var(--ff-text-inverse)]/g' \
    -e 's/text-text-disabled/text-[var(--ff-text-disabled)]/g' \
    -e 's/text-text-accent/text-[var(--ff-text-accent)]/g' \
    -e 's/text-text-success/text-[var(--ff-text-success)]/g' \
    -e 's/text-text-warning/text-[var(--ff-text-warning)]/g' \
    -e 's/text-text-error/text-[var(--ff-text-error)]/g' \
    -e 's/border-border-primary/border-[var(--ff-border-primary)]/g' \
    -e 's/border-border-secondary/border-[var(--ff-border-secondary)]/g' \
    -e 's/border-border-subtle/border-[var(--ff-border-subtle)]/g' \
    -e 's/border-border-focus/border-[var(--ff-border-focus)]/g' \
    -e 's/border-border-error/border-[var(--ff-border-error)]/g' \
    -e 's/border-border-success/border-[var(--ff-border-success)]/g' \
    -e 's/border-border-warning/border-[var(--ff-border-warning)]/g' \
    {} \;

echo "✅ Fixed CSS class references in all TSX files"

# Count the number of files that were processed
file_count=$(find src -name "*.tsx" -type f | wc -l)
echo "📁 Processed $file_count TSX files"

echo "🚀 Styling fixes complete! Development server should now display properly."