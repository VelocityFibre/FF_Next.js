import { test, expect } from '@playwright/test';

/**
 * UNIVERSAL MODULE FIELD CONSISTENCY TEST TEMPLATE
 * 
 * This template MUST be used for ALL modules to verify 100% field consistency
 * between Create and Edit forms.
 * 
 * USAGE:
 * 1. Copy this file and rename to: [module]-field-consistency.spec.ts
 * 2. Update MODULE_NAME and URLs
 * 3. Run test - MUST achieve 100% consistency
 */

const MODULE_NAME = 'MODULE_NAME_HERE'; // e.g., 'clients', 'staff', 'invoices'
const CREATE_URL = `http://localhost:5173/app/${MODULE_NAME}/create`;
const EDIT_URL_PATTERN = `http://localhost:5173/app/${MODULE_NAME}/*/edit`;
const LIST_URL = `http://localhost:5173/app/${MODULE_NAME}`;

test.describe(`${MODULE_NAME.toUpperCase()} Module Field Consistency`, () => {
  test('MUST have 100% field consistency between Create and Edit forms', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log(`${MODULE_NAME.toUpperCase()} MODULE FIELD CONSISTENCY TEST`);
    console.log('REQUIREMENT: 100% consistency (NO EXCEPTIONS)');
    console.log('='.repeat(80));
    
    // ===== CAPTURE CREATE FORM FIELDS =====
    console.log(`\n📝 Analyzing ${MODULE_NAME} CREATE form...`);
    
    await page.goto(CREATE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Capture all form fields (including multi-step forms)
    const createFields = [];
    let stepNumber = 1;
    
    // Capture current step fields
    let currentStepFields = await page.evaluate(() => {
      const fields = [];
      document.querySelectorAll('input[name], textarea[name], select[name]').forEach(el => {
        if (el.offsetParent) {
          const label = el.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label';
          fields.push({ 
            name: el.getAttribute('name'), 
            label,
            type: el.tagName.toLowerCase() === 'textarea' ? 'textarea' : 
                  el.tagName.toLowerCase() === 'select' ? 'select' : el.type
          });
        }
      });
      return fields;
    });
    
    console.log(`Step ${stepNumber} fields:`, currentStepFields.length);
    createFields.push(...currentStepFields);
    
    // Check for multi-step form (Next button)
    while (await page.locator('button:has-text("Next")').isVisible()) {
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(500);
      stepNumber++;
      
      currentStepFields = await page.evaluate(() => {
        const fields = [];
        document.querySelectorAll('input[name], textarea[name], select[name]').forEach(el => {
          if (el.offsetParent) {
            const label = el.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label';
            fields.push({ 
              name: el.getAttribute('name'), 
              label,
              type: el.tagName.toLowerCase() === 'textarea' ? 'textarea' : 
                    el.tagName.toLowerCase() === 'select' ? 'select' : el.type
            });
          }
        });
        return fields;
      });
      
      // Only add new fields (not duplicates)
      const newFields = currentStepFields.filter(f => 
        !createFields.some(cf => cf.name === f.name)
      );
      
      console.log(`Step ${stepNumber} new fields:`, newFields.length);
      createFields.push(...newFields);
    }
    
    console.log(`\nTotal CREATE form fields: ${createFields.length}`);
    createFields.forEach(f => console.log(`  - ${f.label} (${f.name})`));
    
    // ===== FIND AND OPEN EDIT FORM =====
    console.log(`\n📝 Analyzing ${MODULE_NAME} EDIT form...`);
    
    // Navigate to list page to find an existing item
    await page.goto(LIST_URL);
    await page.waitForLoadState('networkidle');
    
    // Try to find and click edit on first item
    const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
    
    let editFields = [];
    
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForURL(EDIT_URL_PATTERN);
      await page.waitForTimeout(1000);
      
      // Capture edit form fields
      editFields = await page.evaluate(() => {
        const fields = [];
        document.querySelectorAll('input[name], textarea[name], select[name]').forEach(el => {
          if (el.offsetParent) {
            const label = el.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label';
            fields.push({ 
              name: el.getAttribute('name'), 
              label,
              type: el.tagName.toLowerCase() === 'textarea' ? 'textarea' : 
                    el.tagName.toLowerCase() === 'select' ? 'select' : el.type,
              hasValue: el.value && el.value.trim() !== ''
            });
          }
        });
        return fields;
      });
      
      console.log(`\nTotal EDIT form fields: ${editFields.length}`);
      editFields.forEach(f => console.log(`  - ${f.label} (${f.name})${f.hasValue ? ' ✓' : ''}`));
      
    } else {
      console.log(`⚠️ No existing ${MODULE_NAME} found. Please create one first.`);
      console.log('Cannot complete consistency check without an edit form.');
      return;
    }
    
    // ===== COMPARISON ANALYSIS =====
    console.log('\n' + '='.repeat(80));
    console.log('📊 FIELD CONSISTENCY ANALYSIS');
    console.log('='.repeat(80));
    
    const createFieldNames = createFields.map(f => f.name);
    const editFieldNames = editFields.map(f => f.name);
    
    const createSet = new Set(createFieldNames);
    const editSet = new Set(editFieldNames);
    
    const matching = createFieldNames.filter(name => editSet.has(name));
    const onlyInCreate = createFieldNames.filter(name => !editSet.has(name));
    const onlyInEdit = editFieldNames.filter(name => !createSet.has(name));
    
    console.log(`\n✅ MATCHING FIELDS: ${matching.length}`);
    matching.forEach(name => {
      const field = createFields.find(f => f.name === name);
      console.log(`   ✓ ${field.label} (${name})`);
    });
    
    if (onlyInCreate.length > 0) {
      console.log(`\n❌ MISSING IN EDIT: ${onlyInCreate.length}`);
      onlyInCreate.forEach(name => {
        const field = createFields.find(f => f.name === name);
        console.log(`   ✗ ${field.label} (${name})`);
      });
    }
    
    if (onlyInEdit.length > 0) {
      console.log(`\n❌ EXTRA IN EDIT: ${onlyInEdit.length}`);
      onlyInEdit.forEach(name => {
        const field = editFields.find(f => f.name === name);
        console.log(`   + ${field.label} (${name})`);
      });
    }
    
    // Calculate consistency score
    const totalUniqueFields = new Set([...createFieldNames, ...editFieldNames]).size;
    const consistencyScore = totalUniqueFields > 0 
      ? (matching.length / totalUniqueFields) * 100 
      : 0;
    
    // ===== FINAL VERDICT =====
    console.log('\n' + '='.repeat(80));
    console.log('🎯 CONSISTENCY VERDICT');
    console.log('='.repeat(80));
    console.log(`Module: ${MODULE_NAME.toUpperCase()}`);
    console.log(`Create Form: ${createFieldNames.length} fields`);
    console.log(`Edit Form: ${editFieldNames.length} fields`);
    console.log(`Matching: ${matching.length} fields`);
    console.log(`Score: ${consistencyScore.toFixed(1)}%`);
    
    if (consistencyScore === 100) {
      console.log('\n✅ PASS: Perfect field consistency achieved!');
    } else {
      console.log('\n❌ FAIL: Module does not meet 100% consistency requirement');
      console.log('\nREQUIRED ACTIONS:');
      
      if (onlyInCreate.length > 0) {
        console.log('1. Add these fields to EDIT form:');
        onlyInCreate.forEach(name => {
          const field = createFields.find(f => f.name === name);
          console.log(`   - ${field.label} (${name})`);
        });
      }
      
      if (onlyInEdit.length > 0) {
        console.log('2. Remove these fields from EDIT form OR add to CREATE:');
        onlyInEdit.forEach(name => {
          const field = editFields.find(f => f.name === name);
          console.log(`   - ${field.label} (${name})`);
        });
      }
      
      console.log('\n📋 Reference: MODULE_FIELD_CONSISTENCY_STANDARD.md');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('TEST COMPLETE');
    console.log('='.repeat(80));
    
    // MANDATORY: Test MUST fail if consistency is not 100%
    expect(consistencyScore).toBe(100);
  });
});