import { test, expect } from '@playwright/test';

test.describe('Direct Edit Form Field Check', () => {
  test('Navigate directly to edit form and compare fields', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('DIRECT FIELD CONSISTENCY CHECK');
    console.log('='.repeat(80));
    
    // ===== STEP 1: CAPTURE CREATE FORM =====
    console.log('\n📝 STEP 1: Capturing CREATE form fields...');
    
    await page.goto('http://localhost:5173/app/projects/create');
    await page.waitForLoadState('networkidle');
    
    const createFields = [];
    
    // Capture Step 1
    let step1Fields = await page.evaluate(() => {
      const fields = [];
      document.querySelectorAll('input[name], textarea[name], select[name]').forEach(el => {
        if (el.offsetParent) {
          const label = el.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label';
          fields.push({ name: el.getAttribute('name'), label });
        }
      });
      return fields;
    });
    createFields.push(...step1Fields);
    
    console.log('Step 1 - Basic Information:');
    step1Fields.forEach(f => console.log(`  - ${f.label}: ${f.name}`));
    
    // Go to Step 2
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    
    let step2Fields = await page.evaluate(() => {
      const fields = [];
      document.querySelectorAll('input[name], textarea[name], select[name]').forEach(el => {
        if (el.offsetParent) {
          const label = el.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label';
          fields.push({ name: el.getAttribute('name'), label });
        }
      });
      return fields;
    });
    
    // Remove duplicates (description appears in both steps)
    const uniqueStep2 = step2Fields.filter(f => !createFields.some(cf => cf.name === f.name));
    createFields.push(...uniqueStep2);
    
    console.log('\nStep 2 - Project Details:');
    uniqueStep2.forEach(f => console.log(`  - ${f.label}: ${f.name}`));
    
    console.log(`\n📊 Total CREATE fields: ${createFields.length}`);
    
    // ===== STEP 2: NAVIGATE DIRECTLY TO EDIT FORM =====
    console.log('\n📝 STEP 2: Opening EDIT form directly...');
    
    // We know from previous test that Hein Test has ID: c113dd20-4687-4852-bc97-0b238c3dbd2a
    const projectId = 'c113dd20-4687-4852-bc97-0b238c3dbd2a';
    await page.goto(`http://localhost:5173/app/projects/${projectId}/edit`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check if we're on edit page
    const isEditPage = page.url().includes('/edit');
    console.log(`On edit page: ${isEditPage}`);
    console.log(`Current URL: ${page.url()}`);
    
    if (isEditPage) {
      // Capture edit form fields
      const editFields = await page.evaluate(() => {
        const fields = [];
        document.querySelectorAll('input[name], textarea[name], select[name]').forEach(el => {
          if (el.offsetParent) {
            const label = el.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label';
            const value = el.value;
            fields.push({ 
              name: el.getAttribute('name'), 
              label,
              hasValue: value && value.trim() !== ''
            });
          }
        });
        return fields;
      });
      
      console.log('\nEdit Form Fields:');
      editFields.forEach(f => console.log(`  - ${f.label}: ${f.name} ${f.hasValue ? '(populated)' : '(empty)'}`));
      
      console.log(`\n📊 Total EDIT fields: ${editFields.length}`);
      
      // ===== STEP 3: DETAILED COMPARISON =====
      console.log('\n' + '='.repeat(80));
      console.log('📊 FIELD COMPARISON ANALYSIS');
      console.log('='.repeat(80));
      
      const createNames = createFields.map(f => f.name);
      const editNames = editFields.map(f => f.name);
      
      const createSet = new Set(createNames);
      const editSet = new Set(editNames);
      
      const matching = createNames.filter(name => editSet.has(name));
      const missingInEdit = createNames.filter(name => !editSet.has(name));
      const extraInEdit = editNames.filter(name => !createSet.has(name));
      
      console.log(`\n✅ MATCHING FIELDS: ${matching.length}/${createNames.length}`);
      matching.forEach(name => {
        const createField = createFields.find(f => f.name === name);
        console.log(`   ✓ ${createField.label} (${name})`);
      });
      
      if (missingInEdit.length > 0) {
        console.log(`\n❌ MISSING IN EDIT: ${missingInEdit.length}`);
        missingInEdit.forEach(name => {
          const createField = createFields.find(f => f.name === name);
          console.log(`   ✗ ${createField.label} (${name})`);
        });
      }
      
      if (extraInEdit.length > 0) {
        console.log(`\n⚠️ EXTRA IN EDIT: ${extraInEdit.length}`);
        extraInEdit.forEach(name => {
          const editField = editFields.find(f => f.name === name);
          console.log(`   + ${editField.label} (${name})`);
        });
      }
      
      // Calculate consistency score
      const totalUniqueFields = new Set([...createNames, ...editNames]).size;
      const score = (matching.length / totalUniqueFields) * 100;
      
      console.log('\n' + '='.repeat(80));
      console.log('🎯 CONSISTENCY VERDICT');
      console.log('='.repeat(80));
      console.log(`Score: ${score.toFixed(1)}%`);
      console.log(`Create: ${createNames.length} fields`);
      console.log(`Edit: ${editNames.length} fields`);
      console.log(`Matching: ${matching.length} fields`);
      
      if (score === 100) {
        console.log('\n✅ PERFECT: Forms are identical');
      } else if (score >= 90) {
        console.log('\n✅ EXCELLENT: Minor differences only');
      } else if (score >= 80) {
        console.log('\n⚠️ GOOD: Some improvements needed');
      } else if (score >= 70) {
        console.log('\n⚠️ FAIR: Significant improvements needed');
      } else {
        console.log('\n❌ POOR: Major restructuring required');
      }
      
      // Specific recommendations
      console.log('\n📝 RECOMMENDATIONS:');
      if (missingInEdit.length > 0) {
        console.log('1. Add these fields to EDIT form:');
        missingInEdit.forEach(name => {
          const field = createFields.find(f => f.name === name);
          console.log(`   - ${field.label} (${name})`);
        });
      }
      
      if (extraInEdit.length > 0) {
        console.log('2. Review if these EDIT-only fields should be in CREATE:');
        extraInEdit.forEach(name => {
          const field = editFields.find(f => f.name === name);
          console.log(`   - ${field.label} (${name})`);
        });
      }
      
      console.log('\n3. Apply Universal Module Structure:');
      console.log('   - Use UniversalField component for all fields');
      console.log('   - Define fields once in types/project.types.ts');
      console.log('   - Reuse same field definitions in Create/Edit/View');
      
    } else {
      console.log('❌ Not on edit page. The route might not be configured.');
      console.log('Please check that the edit route is properly set up in the router.');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('TEST COMPLETE');
    console.log('='.repeat(80));
  });
});