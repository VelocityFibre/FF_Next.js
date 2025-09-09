# 🚨 FILE SPLITTING PROJECT - MANDATORY RULES & REFERENCE

## 🎯 MISSION
Split 106 files that violate the 300-line maximum rule into properly organized, maintainable components.

## ⚠️ CRITICAL RULES (ZERO TOLERANCE)

### 1. **FILE SIZE LIMIT**
- **MAXIMUM**: 300 lines per file - NO EXCEPTIONS
- **TARGET**: 200-250 lines for optimal readability
- **MINIMUM**: Don't create files < 50 lines unless necessary

### 2. **FUNCTIONALITY PRESERVATION**
- **ZERO** breaking changes allowed
- All features must work EXACTLY as before
- All tests must continue to pass
- No runtime errors or console warnings

### 3. **TYPE SAFETY**
- **NO** use of `any` type
- All imports must be properly typed
- `npm run type-check` must pass after EVERY split
- Maintain all existing type definitions

## 📂 STANDARD SPLITTING PATTERNS

### PATTERN 1: Component Splitting
```
BEFORE: LargeComponent.tsx (500+ lines)
AFTER:
├── components/
│   ├── ComponentContainer.tsx (150 lines - logic)
│   ├── ComponentView.tsx (150 lines - presentation)  
│   ├── ComponentTypes.ts (50 lines - interfaces)
│   └── hooks/
│       └── useComponent.ts (100 lines - custom hooks)
```

### PATTERN 2: Service Splitting
```
BEFORE: largeService.ts (600+ lines)
AFTER:
├── services/
│   ├── serviceCrud.ts (200 lines - CRUD operations)
│   ├── serviceBusiness.ts (200 lines - business logic)
│   ├── serviceQueries.ts (150 lines - complex queries)
│   ├── service.types.ts (50 lines - types)
│   └── index.ts (exports)
```

### PATTERN 3: Form Splitting
```
BEFORE: LargeForm.tsx (400+ lines)
AFTER:
├── forms/
│   ├── FormContainer.tsx (150 lines - main form)
│   ├── FormSection1.tsx (100 lines)
│   ├── FormSection2.tsx (100 lines)
│   ├── FormValidation.ts (50 lines)
│   └── useFormLogic.ts (100 lines)
```

## 🔧 MANDATORY WORKFLOW

### STEP 1: ANALYZE (Before touching ANY file)
```bash
# Use ForgeFlow to understand structure
@FF analyze "Show structure and dependencies for [filename]"

# Check current line count
wc -l src/path/to/file.tsx

# Find all files importing this one
@FF find "Files importing [filename]"
```

### STEP 2: PLAN
```bash
# Create splitting strategy
@FF plan "Split [filename] into files under 300 lines maintaining all functionality"

# Document the plan BEFORE starting
echo "Splitting plan for [filename]" > splitting-notes.md
```

### STEP 3: EXECUTE
```bash
# Split the file according to plan
# Update all imports immediately
# Run type-check after EACH file creation
npm run type-check
```

### STEP 4: VALIDATE
```bash
# Check no functionality broken
@FF validate "Verify [module] works after splitting"

# Run specific module tests
npm test -- --testPathPattern=[module]

# Check for console errors
npm run dev
# Open browser, test the feature manually
```

### STEP 5: UPDATE TASK LIST
```bash
# Mark your task as complete
# Update the master todo list with your progress
# Add any new discoveries or blockers
```

## 📋 TODO LIST MANAGEMENT

**EVERY AGENT MUST**:
1. Check the todo list when starting work
2. Mark tasks as `in_progress` when beginning
3. Mark tasks as `completed` when done
4. Add new tasks if you discover more files needing splits

**Example Update**:
```
"Update todo: Mark 'AGENT 1: Split BOQViewer.tsx' as completed"
```

## 🚦 QUALITY GATES

### Before marking ANY task complete:
- [ ] File is under 300 lines
- [ ] All imports updated in dependent files
- [ ] `npm run type-check` passes
- [ ] Feature tested manually in browser
- [ ] No console errors or warnings
- [ ] Original functionality preserved

## 🛠️ FORGEFLOW COMMANDS REFERENCE

### Analysis Commands
```bash
@FF analyze "Current structure of [file]"
@FF find "All imports of [file]"
@FF check "Dependencies for [module]"
```

### Planning Commands
```bash
@FF plan "Splitting strategy for [file]"
@FF suggest "Best pattern for [component] split"
```

### Validation Commands
```bash
@FF validate "All functionality preserved in [module]"
@FF test "Run tests for [module]"
@FF verify "No circular dependencies in [path]"
```

### Testing Commands
```bash
@FF playwright "Test [component] UI"
@FF check "API endpoints still working"
@FF review "Code quality after split"
```

## 🔴 COMMON PITFALLS TO AVOID

1. **DON'T** create circular dependencies
2. **DON'T** break prop drilling or context chains
3. **DON'T** lose event handler connections
4. **DON'T** change public API signatures
5. **DON'T** forget to update barrel exports
6. **DON'T** mix concerns (keep separation clean)
7. **DON'T** create files just to hit line limits (must be logical)

## 📊 PROGRESS TRACKING

### Current Status
- **Total Files Over 300 Lines**: 106
- **Target**: 0 files over 300 lines
- **Estimated New Files**: ~250-300 total

### Agent Assignments
- **AGENT 1**: 40 procurement/BOQ files
- **AGENT 2**: 35 service/schema files  
- **AGENT 3**: 31 UI component files

## ✅ DEFINITION OF DONE

A file split is ONLY complete when:
1. Original file and ALL new files < 300 lines
2. All imports updated everywhere
3. Type-check passes
4. Manual testing confirms functionality
5. Todo list updated
6. No console errors/warnings

## 🚨 ESCALATION

If you encounter:
- Circular dependency issues → Try different split pattern
- Type errors after split → Check all exports/imports
- Functionality breaks → Revert and try different approach
- File can't be logically split → Document why and propose alternative

## 💡 TIPS FOR SUCCESS

1. **Start with the largest file** in your assignment
2. **Extract types first** - they're easy wins
3. **Pull out hooks** - they're usually self-contained
4. **Split forms by section** - natural boundaries
5. **Separate view from logic** - clean architecture
6. **Test after EVERY split** - catch issues early

---

**REMEMBER**: This is a ZERO TOLERANCE project. No file over 300 lines will be accepted. Period.

**USE @FF CONSTANTLY** for validation and testing. It's your safety net.

**UPDATE THE TODO LIST** as you progress. Communication is key.