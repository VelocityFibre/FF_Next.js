import { test, expect } from '@playwright/test';

test.describe('Test Existing Project Field Consistency', () => {
  test('Check field consistency using existing project', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('EXISTING PROJECT FIELD CONSISTENCY TEST');
    console.log('='.repeat(80));
    
    // ===== STEP 1: ANALYZE CREATE FORM =====
    console.log('\n📝 STEP 1: Analyzing CREATE form structure...');
    console.log('-'.repeat(40));
    
    // Navigate to projects page
    await page.goto('http://localhost:5173/app/projects');
    await page.waitForLoadState('networkidle');
    
    // Open create form to capture its structure
    await page.click('text=Add Project');
    await page.waitForURL('**/projects/create');
    await page.waitForTimeout(1000);
    
    // Capture all fields in Step 1
    const createStep1Fields = await page.evaluate(() => {
      const fields = [];
      document.querySelectorAll('input[name], textarea[name], select[name]').forEach(element => {
        if (element.offsetParent !== null) {
          fields.push({
            name: element.getAttribute('name'),
            type: element.tagName.toLowerCase() === 'textarea' ? 'textarea' : 
                  element.tagName.toLowerCase() === 'select' ? 'select' : element.type,
            label: element.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label'
          });
        }
      });
      return fields;
    });
    
    console.log('Create Form - Step 1 (Basic Info):');
    createStep1Fields.forEach(field => {
      console.log(`  ✓ ${field.label} (${field.name})`);
    });
    
    // Click Next to see Step 2
    const nextButton = page.locator('button:has-text("Next")');
    let createStep2Fields = [];
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      createStep2Fields = await page.evaluate(() => {
        const fields = [];
        document.querySelectorAll('input[name], textarea[name], select[name]').forEach(element => {
          if (element.offsetParent !== null) {
            fields.push({
              name: element.getAttribute('name'),
              type: element.tagName.toLowerCase() === 'textarea' ? 'textarea' : 
                    element.tagName.toLowerCase() === 'select' ? 'select' : element.type,
              label: element.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label'
            });
          }
        });
        return fields;
      });
      
      console.log('\nCreate Form - Step 2 (Project Details):');
      createStep2Fields.forEach(field => {
        console.log(`  ✓ ${field.label} (${field.name})`);
      });
    }
    
    const allCreateFields = [...createStep1Fields, ...createStep2Fields];
    console.log(`\n📊 Total CREATE form fields: ${allCreateFields.length}`);
    
    // ===== STEP 2: FIND AND ANALYZE EXISTING PROJECT =====
    console.log('\n📝 STEP 2: Finding existing project "Hein Test"...');
    console.log('-'.repeat(40));
    
    // Go back to projects list
    await page.goto('http://localhost:5173/app/projects');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Look for "Hein Test" project or any project
    console.log('Searching for projects...');
    
    // Try to find any project card or row
    const projectElements = await page.locator('text=/Hein Test|Test|Project/i').all();
    console.log(`Found ${projectElements.length} potential project elements`);
    
    // Also check for table rows or cards
    const tableRows = await page.locator('tbody tr').count();
    const cards = await page.locator('[class*="card"], [class*="shadow"]').count();
    console.log(`Found ${tableRows} table rows, ${cards} cards`);
    
    // Try to click on the first available project
    let editFormFields = [];
    
    // Method 1: Try clicking on a project name link
    const projectLink = page.locator('a[href*="/projects/"]').first();
    const heinTestLink = page.locator('text="Hein Test"').first();
    
    if (await heinTestLink.isVisible()) {
      console.log('Found "Hein Test" project, clicking...');
      await heinTestLink.click();
      await page.waitForLoadState('networkidle');
      
      // Now try to find edit button
      const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
      if (await editButton.isVisible()) {
        console.log('Found Edit button, clicking...');
        await editButton.click();
        await page.waitForURL('**/edit');
      }
    } else if (await projectLink.isVisible()) {
      console.log('Found project link, clicking to view details...');
      await projectLink.click();
      await page.waitForLoadState('networkidle');
      
      // Now try to find edit button
      const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
      if (await editButton.isVisible()) {
        console.log('Found Edit button, clicking...');
        await editButton.click();
        await page.waitForURL('**/edit');
      }
    }
    
    // Method 2: Try hovering over cards/rows and clicking edit
    if (page.url().includes('/projects') && !page.url().includes('/edit')) {
      console.log('Trying to find edit button by hovering...');
      
      // Try with table rows
      if (tableRows > 0) {
        const firstRow = page.locator('tbody tr').first();
        await firstRow.hover();
        const editBtn = firstRow.locator('button:has-text("Edit"), [aria-label*="edit"]').first();
        if (await editBtn.isVisible()) {
          await editBtn.click();
          await page.waitForURL('**/edit');
        }
      }
      
      // Try with cards
      if (cards > 0 && !page.url().includes('/edit')) {
        const firstCard = page.locator('[class*="card"], [class*="shadow"]').first();
        await firstCard.hover();
        const editBtn = firstCard.locator('button:has-text("Edit"), [aria-label*="edit"]').first();
        if (await editBtn.isVisible()) {
          await editBtn.click();
          await page.waitForURL('**/edit');
        }
      }
    }
    
    // Check if we're on an edit page
    if (page.url().includes('/edit')) {
      console.log('✅ Successfully opened edit form');
      
      // Capture edit form fields
      editFormFields = await page.evaluate(() => {
        const fields = [];
        document.querySelectorAll('input[name], textarea[name], select[name]').forEach(element => {
          if (element.offsetParent !== null) {
            fields.push({
              name: element.getAttribute('name'),
              type: element.tagName.toLowerCase() === 'textarea' ? 'textarea' : 
                    element.tagName.toLowerCase() === 'select' ? 'select' : element.type,
              label: element.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label',
              value: element.value
            });
          }
        });
        return fields;
      });
      
      console.log('\nEdit Form Fields:');
      editFormFields.forEach(field => {
        const valuePreview = field.value ? 
          (field.value.length > 30 ? field.value.substring(0, 30) + '...' : field.value) : 
          'empty';
        console.log(`  ✓ ${field.label} (${field.name}) = "${valuePreview}"`);
      });
      
      console.log(`\n📊 Total EDIT form fields: ${editFormFields.length}`);
      
      // ===== STEP 3: COMPARISON =====
      console.log('\n' + '='.repeat(80));
      console.log('📊 FIELD CONSISTENCY ANALYSIS');
      console.log('='.repeat(80));
      
      const createFieldNames = new Set(allCreateFields.map(f => f.name));
      const editFieldNames = new Set(editFormFields.map(f => f.name));
      
      const inBoth = [...createFieldNames].filter(name => editFieldNames.has(name));
      const onlyInCreate = [...createFieldNames].filter(name => !editFieldNames.has(name));
      const onlyInEdit = [...editFieldNames].filter(name => !createFieldNames.has(name));
      
      console.log('\n✅ MATCHING FIELDS:', inBoth.length);
      console.log('-'.repeat(40));
      inBoth.forEach(name => {
        console.log(`  ✓ ${name}`);
      });
      
      if (onlyInCreate.length > 0) {
        console.log('\n⚠️ MISSING IN EDIT (exists in Create only):', onlyInCreate.length);
        console.log('-'.repeat(40));
        onlyInCreate.forEach(name => {
          const field = allCreateFields.find(f => f.name === name);
          console.log(`  ✗ ${name} (${field?.label})`);
        });
      }
      
      if (onlyInEdit.length > 0) {
        console.log('\n⚠️ EXTRA IN EDIT (not in Create):', onlyInEdit.length);
        console.log('-'.repeat(40));
        onlyInEdit.forEach(name => {
          const field = editFormFields.find(f => f.name === name);
          console.log(`  + ${name} (${field?.label})`);
        });
      }
      
      // Calculate score
      const totalUniqueFields = new Set([...createFieldNames, ...editFieldNames]).size;
      const consistencyScore = (inBoth.length / totalUniqueFields) * 100;
      
      console.log('\n' + '='.repeat(80));
      console.log('🎯 CONSISTENCY VERDICT');
      console.log('='.repeat(80));
      console.log(`Score: ${consistencyScore.toFixed(1)}%`);
      console.log(`Create Form: ${createFieldNames.size} fields`);
      console.log(`Edit Form: ${editFieldNames.size} fields`);
      console.log(`Matching: ${inBoth.length} fields`);
      
      if (consistencyScore === 100) {
        console.log('\n✅ PERFECT CONSISTENCY');
      } else if (consistencyScore >= 90) {
        console.log('\n✅ EXCELLENT CONSISTENCY');
      } else if (consistencyScore >= 80) {
        console.log('\n⚠️ GOOD CONSISTENCY (minor improvements needed)');
      } else if (consistencyScore >= 70) {
        console.log('\n⚠️ FAIR CONSISTENCY (significant improvements needed)');
      } else {
        console.log('\n❌ POOR CONSISTENCY (major restructuring required)');
      }
      
      if (onlyInCreate.length > 0 || onlyInEdit.length > 0) {
        console.log('\n📝 RECOMMENDATIONS:');
        console.log('-'.repeat(40));
        console.log('1. Apply Universal Module Structure principle');
        console.log('2. Ensure CREATE form defines all fields');
        console.log('3. Make EDIT form mirror CREATE exactly');
        console.log('4. Use consistent field names (e.g., location.* prefix)');
        console.log('5. Remove any edit-only fields or add them to create');
      }
      
    } else {
      console.log('❌ Could not open edit form');
      console.log('Current URL:', page.url());
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'dev-tools/testing/debug-project-list.png' });
      console.log('Screenshot saved to: dev-tools/testing/debug-project-list.png');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('TEST COMPLETE');
    console.log('='.repeat(80));
  });
});