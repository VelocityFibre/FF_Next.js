# 📋 MODULE FIELD CONSISTENCY STANDARD
**MANDATORY FOR ALL MODULES - NO EXCEPTIONS**

## 🎯 THE GOLDEN RULE
**CREATE ONCE, USE EVERYWHERE**: The Create form defines the ENTIRE module structure. Edit, View, and Detail MUST use the EXACT same fields.

## ✅ PROVEN SUCCESS: Projects Module
- **Before**: 52.9% consistency (POOR)
- **After**: 100% consistency (PERFECT)
- **Test**: Verified with Playwright automated testing

## 📊 FIELD CONSISTENCY REQUIREMENTS

### 1. EXACT Field Matching (100% Required)
Every field in CREATE must exist in EDIT and vice versa:
- Same field names (`name`, `location.city`, etc.)
- Same field types (text, number, select, etc.)
- Same validation rules
- Same required/optional status

### 2. Standard Field Set for ALL Modules

#### Required Fields (All modules MUST have):
```typescript
- id: string                    // Unique identifier
- name/title: string           // Primary name field
- description: string          // Description text
- status: enum                 // Current status
- createdAt: Date             // Creation timestamp
- updatedAt: Date             // Last update timestamp
```

#### Common Optional Fields:
```typescript
- priority: enum               // Priority level
- assignedTo: string          // Assigned user/staff
- budget: number              // Financial amount
- startDate: Date             // Start date
- endDate: Date               // End date
- duration: number            // Duration value
- location: {                 // Location object
    city: string
    province: string
    gpsLatitude: number
    gpsLongitude: number
    municipalDistrict: string
  }
```

## 🔧 IMPLEMENTATION CHECKLIST

### For Each Module:
- [ ] Define ALL fields in `types/[module].types.ts`
- [ ] Create form with complete field set
- [ ] Edit form uses EXACT same fields
- [ ] View page displays ALL fields
- [ ] Detail page shows ALL fields
- [ ] Run Playwright test to verify 100% consistency

## 🧪 TESTING STANDARD

### Playwright Test Template:
```typescript
// Run for EVERY module to verify consistency
test('Module field consistency', async ({ page }) => {
  // 1. Capture CREATE form fields
  const createFields = await captureFormFields('/create');
  
  // 2. Capture EDIT form fields  
  const editFields = await captureFormFields('/edit');
  
  // 3. Compare and verify 100% match
  expect(consistencyScore).toBe(100);
});
```

### Acceptance Criteria:
- **PASS**: 100% field consistency
- **FAIL**: Anything less than 100%

## 🚫 COMMON MISTAKES TO AVOID

### ❌ DON'T:
1. Add fields only to Edit form (like we had address, postal code)
2. Skip fields in Edit that exist in Create
3. Use different field names for same data
4. Change field types between forms
5. Make required fields optional in different views

### ✅ DO:
1. Define fields ONCE in types
2. Use exact same field structure everywhere
3. Keep field names consistent
4. Maintain same validation rules
5. Test with Playwright before marking complete

## 📝 MODULE STATUS TRACKING

| Module | Create Fields | Edit Fields | Consistency | Status |
|--------|--------------|-------------|-------------|---------|
| Projects | 15 | 15 | 100% | ✅ COMPLETE |
| Clients | TBD | TBD | TBD | 🔄 PENDING |
| Staff | TBD | TBD | TBD | 🔄 PENDING |
| BOQ | TBD | TBD | TBD | 🔄 PENDING |
| RFQ | TBD | TBD | TBD | 🔄 PENDING |
| SOW | TBD | TBD | TBD | 🔄 PENDING |
| Invoices | TBD | TBD | TBD | 🔄 PENDING |
| Payments | TBD | TBD | TBD | 🔄 PENDING |

## 🎯 ENFORCEMENT

### Pre-commit Hook:
```bash
# Automatically run before every commit
npm run check:field-consistency
```

### CI/CD Pipeline:
- Block deployment if consistency < 100%
- Run Playwright tests for all modules
- Generate consistency report

## 🏆 SUCCESS METRICS

### Per Module:
- Field Consistency: MUST be 100%
- Test Coverage: MUST include field verification
- Documentation: MUST list all fields

### Overall:
- All modules: 100% consistent
- Zero field mismatches
- Complete test coverage

## 📋 QUICK REFERENCE

### When Creating New Module:
1. **Define** all fields in types file
2. **Build** Create form with all fields
3. **Copy** exact structure to Edit form
4. **Display** all fields in View/Detail
5. **Test** with Playwright (must be 100%)
6. **Document** in this file

### When Modifying Existing Module:
1. **Update** types file first
2. **Apply** changes to ALL forms (Create, Edit)
3. **Verify** View/Detail pages
4. **Test** consistency (must remain 100%)
5. **Update** this tracking document

---

## 🔒 AUTHORITY
This standard is **MANDATORY** and supersedes all other patterns. No exceptions.

**Last Updated**: 2024-01-22
**Verified By**: Playwright Test Suite
**Success Rate**: Projects Module - 100% ✅

---

## REMEMBER:
**"I should only edit and fix the create form and the rest should be consistent in structure and data"** - This is the law.