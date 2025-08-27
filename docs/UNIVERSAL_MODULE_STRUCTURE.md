# 🏗️ UNIVERSAL MODULE STRUCTURE - Single Source of Truth

## 🎯 CORE PRINCIPLE
**CREATE ONCE, USE EVERYWHERE**: The creation form defines the ENTIRE module structure. View and Edit modes must use the EXACT same fields, in the SAME order, with the SAME labels.

## 📋 MANDATORY MODULE COMPONENTS

Every module MUST have these 5 components that share the SAME field structure:

### 1. **CREATE Form** (Source of Truth)
- Defines ALL fields for the module
- Sets field order and grouping
- Establishes validation rules
- This is the MASTER template

### 2. **VIEW Page** (Read-only version of Create)
- Shows EXACT same fields as Create
- Same order and grouping
- Read-only display
- Shows related data (e.g., client name instead of ID)

### 3. **EDIT Form** (Create form with data)
- EXACT same fields as Create
- Pre-populated with existing data
- Same validation rules
- Same field order

### 4. **LIST Table** (Summary of key fields)
- Shows subset of Create fields
- Consistent column order
- Links to View/Edit/Delete

### 5. **DETAIL Overview** (Structured view)
- ALL fields from Create form
- Organized in cards/sections
- Shows calculated fields (progress, totals, etc.)

## 🔄 AUTOMATIC FIELD SYNCHRONIZATION

### The Rule of One Source
```typescript
// 1. Define fields ONCE in types
interface ModuleFields {
  // Basic Information
  name: string;
  description?: string;
  
  // Relationships
  clientId: string;
  managerId: string;
  
  // Dates
  startDate: string;
  endDate: string;
  
  // Status
  status: ModuleStatus;
  priority: Priority;
  
  // Financial
  budget: number;
  
  // Location (if applicable)
  location: LocationData;
}

// 2. Use EVERYWHERE
- CreateForm uses ModuleFields
- EditForm uses ModuleFields  
- ViewPage displays ModuleFields
- DetailView shows ModuleFields
```

## 📐 STANDARD MODULE STRUCTURE

### Every Module Must Follow This Pattern:

```
/src/modules/[module-name]/
├── types/
│   └── [module].types.ts        # Single source of field definitions
├── components/
│   ├── [Module]Create.tsx       # Creation form (MASTER)
│   ├── [Module]Edit.tsx         # Edit form (uses Create structure)
│   ├── [Module]View.tsx         # View page (uses Create structure)
│   ├── [Module]List.tsx         # List/table view
│   ├── [Module]Detail.tsx       # Detailed view (all fields)
│   └── [Module]Fields.tsx       # Shared field components
├── hooks/
│   └── use[Module].ts           # Data fetching/mutations
└── [MODULE]_STRUCTURE.md        # Documents all fields
```

## 🎨 FIELD CONSISTENCY RULES

### 1. Field Definition (types/[module].types.ts)
```typescript
export interface ProjectFields {
  // Group 1: Basic Information
  name: string;
  description?: string;
  code?: string;
  
  // Group 2: Relationships
  clientId: string;
  projectManagerId: string;
  teamMemberIds?: string[];
  
  // Group 3: Schedule
  startDate: string;
  endDate: string;
  duration?: number;
  
  // Group 4: Status & Priority
  status: Status;
  priority: Priority;
  
  // Group 5: Financial
  budgetAllocated: number;
  budgetSpent?: number;
  
  // Group 6: Location
  location: {
    gpsLatitude: number;
    gpsLongitude: number;
    city: string;
    province: string;
    municipalDistrict: string;
  };
}
```

### 2. Create Form (THE MASTER)
```tsx
// This defines the structure for ALL other views
export function ProjectCreate() {
  return (
    <form>
      {/* Group 1: Basic Information */}
      <Section title="Basic Information">
        <Field name="name" label="Project Name" required />
        <Field name="description" label="Description" />
      </Section>
      
      {/* Group 2: Relationships */}
      <Section title="Assignments">
        <Field name="clientId" label="Client" required />
        <Field name="projectManagerId" label="Project Manager" required />
      </Section>
      
      {/* ALL OTHER GROUPS... */}
    </form>
  );
}
```

### 3. View/Edit/Detail (MUST MATCH CREATE)
```tsx
// View Mode - Same fields, read-only
export function ProjectView({ project }) {
  return (
    <div>
      {/* EXACT SAME STRUCTURE AS CREATE */}
      <Section title="Basic Information">
        <DisplayField label="Project Name" value={project.name} />
        <DisplayField label="Description" value={project.description} />
      </Section>
      {/* ... */}
    </div>
  );
}

// Edit Mode - Same fields, editable
export function ProjectEdit({ project }) {
  return (
    <form>
      {/* EXACT SAME STRUCTURE AS CREATE, with values */}
      <Section title="Basic Information">
        <Field name="name" label="Project Name" value={project.name} required />
        <Field name="description" label="Description" value={project.description} />
      </Section>
      {/* ... */}
    </form>
  );
}
```

## 🚀 IMPLEMENTATION CHECKLIST

### For Each Module:
- [ ] Define ALL fields in `types/[module].types.ts`
- [ ] Create the master form in `[Module]Create.tsx`
- [ ] Copy structure to `[Module]Edit.tsx` (add data population)
- [ ] Copy structure to `[Module]View.tsx` (make read-only)
- [ ] Copy structure to `[Module]Detail.tsx` (add calculations)
- [ ] Create `[MODULE]_STRUCTURE.md` documenting all fields

## 🔧 SHARED COMPONENTS FOR CONSISTENCY

### Create Reusable Field Components:
```tsx
// Shared field component that works in Create/Edit/View modes
export function ModuleField({ 
  name, 
  label, 
  value, 
  mode = 'create', // 'create' | 'edit' | 'view'
  required = false,
  type = 'text'
}) {
  if (mode === 'view') {
    return <DisplayField label={label} value={value} />;
  }
  
  return (
    <div>
      <label>{label} {required && '*'}</label>
      <input 
        name={name} 
        defaultValue={mode === 'edit' ? value : undefined}
        type={type}
        required={required}
      />
    </div>
  );
}
```

## 📊 CURRENT MODULES TO STANDARDIZE

1. **Projects** ✅
   - Fields defined in creation wizard
   - Need to sync View/Edit/Detail

2. **Clients** 🔄
   - Standardize field structure
   - Ensure View matches Create

3. **Staff** 🔄
   - Align all views with Create form
   - Add missing fields to View/Detail

4. **BOQ** 📝 (To implement)
5. **RFQ** 📝 (To implement)
6. **SOW** 📝 (To implement)

## ⚠️ VALIDATION RULES

### DO NOT:
- ❌ Add fields to View that aren't in Create
- ❌ Change field order between views
- ❌ Use different labels for same field
- ❌ Skip fields in Edit that exist in Create
- ❌ Create custom layouts that break consistency

### ALWAYS:
- ✅ Define fields ONCE in types
- ✅ Use Create form as the template
- ✅ Keep field order consistent
- ✅ Group related fields together
- ✅ Use same validation everywhere

## 🎯 BENEFITS

1. **Predictability**: Users know what to expect
2. **Maintainability**: Change once, update everywhere
3. **Speed**: Copy-paste structure between views
4. **Quality**: Fewer bugs from inconsistency
5. **Training**: Learn one view, know them all

## 🔍 ENFORCEMENT

### Pre-commit Check:
```bash
# Check module structure consistency
npm run check:module-structure

# Validates:
# - All modules have 5 required components
# - Field definitions match across views
# - Same field order maintained
# - Required fields consistent
```

### Module Generator:
```bash
# Generate new module with correct structure
npm run generate:module --name="invoices"

# Creates:
# - All 5 components with same fields
# - Type definitions
# - Hooks and services
# - Structure documentation
```

---

## 📝 EXAMPLE: Projects Module

### 1. Define Fields (types/project.types.ts)
```typescript
export interface ProjectFields {
  name: string;
  description?: string;
  clientId: string;
  projectManagerId: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  endDate: string;
  budgetAllocated: number;
  location: LocationData;
}
```

### 2. Create Form (Master Template)
- 16 fields in specific order
- Grouped into 6 sections
- This is the BIBLE for all other views

### 3. View/Edit/Detail
- Use EXACT same 16 fields
- SAME order
- SAME grouping
- Only difference: mode (create/edit/view)

---

**Remember: The Create Form is the CONTRACT. All other views must honor it.**