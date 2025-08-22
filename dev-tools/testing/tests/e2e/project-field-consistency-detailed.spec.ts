import { test, expect } from '@playwright/test';

test.describe('Project Module Field Consistency Analysis', () => {
  test('Detailed comparison of Create vs Edit form fields', async ({ page }) => {
    // Navigate to projects page
    await page.goto('http://localhost:5173/app/projects');
    await page.waitForLoadState('networkidle');
    
    console.log('\n' + '='.repeat(80));
    console.log('PROJECT MODULE FIELD CONSISTENCY ANALYSIS');
    console.log('='.repeat(80));
    
    // ===== STEP 1: ANALYZE CREATE FORM =====
    console.log('\n📝 STEP 1: Analyzing CREATE form fields...');
    console.log('-'.repeat(40));
    
    await page.click('text=Add Project');
    await page.waitForURL('**/projects/create');
    await page.waitForTimeout(1000); // Allow form to fully render
    
    // Capture CREATE form structure
    const createFormFields = {
      step1_basicInfo: [],
      step2_projectDetails: []
    };
    
    // Get all visible form fields in Step 1
    const step1Fields = await page.evaluate(() => {
      const fields = [];
      
      // Input fields
      document.querySelectorAll('input[name]').forEach(input => {
        if (input.offsetParent !== null) { // Check if visible
          fields.push({
            name: input.getAttribute('name'),
            type: input.type,
            label: input.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label',
            required: input.hasAttribute('required'),
            value: input.value
          });
        }
      });
      
      // Textarea fields
      document.querySelectorAll('textarea[name]').forEach(textarea => {
        if (textarea.offsetParent !== null) {
          fields.push({
            name: textarea.getAttribute('name'),
            type: 'textarea',
            label: textarea.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label',
            required: textarea.hasAttribute('required'),
            value: textarea.value
          });
        }
      });
      
      // Select fields
      document.querySelectorAll('select[name]').forEach(select => {
        if (select.offsetParent !== null) {
          fields.push({
            name: select.getAttribute('name'),
            type: 'select',
            label: select.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label',
            required: select.hasAttribute('required'),
            value: select.value
          });
        }
      });
      
      return fields;
    });
    
    createFormFields.step1_basicInfo = step1Fields;
    
    console.log('Step 1 - Basic Information Fields:');
    step1Fields.forEach(field => {
      console.log(`  ✓ ${field.label} (name="${field.name}", type="${field.type}"${field.required ? ', required' : ''})`);
    });
    
    // Navigate to Step 2 if Next button exists
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      const step2Fields = await page.evaluate(() => {
        const fields = [];
        
        document.querySelectorAll('input[name], textarea[name], select[name]').forEach(element => {
          if (element.offsetParent !== null) {
            fields.push({
              name: element.getAttribute('name'),
              type: element.tagName.toLowerCase() === 'textarea' ? 'textarea' : 
                    element.tagName.toLowerCase() === 'select' ? 'select' : element.type,
              label: element.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label',
              required: element.hasAttribute('required'),
              value: element.value
            });
          }
        });
        
        return fields;
      });
      
      createFormFields.step2_projectDetails = step2Fields;
      
      console.log('\nStep 2 - Project Details Fields:');
      step2Fields.forEach(field => {
        console.log(`  ✓ ${field.label} (name="${field.name}", type="${field.type}"${field.required ? ', required' : ''})`);
      });
    }
    
    const totalCreateFields = createFormFields.step1_basicInfo.length + createFormFields.step2_projectDetails.length;
    console.log(`\n📊 Total CREATE form fields: ${totalCreateFields}`);
    
    // ===== STEP 2: ANALYZE EDIT FORM =====
    console.log('\n📝 STEP 2: Analyzing EDIT form fields...');
    console.log('-'.repeat(40));
    
    // Go back to projects list
    await page.goto('http://localhost:5173/app/projects');
    await page.waitForLoadState('networkidle');
    
    // Check if there are any projects to edit
    const projectCards = page.locator('[class*="hover:shadow-md"], .project-card, [data-testid="project-card"]');
    const projectCount = await projectCards.count();
    
    let editFormFields = [];
    
    if (projectCount > 0) {
      console.log(`Found ${projectCount} project(s). Opening edit form...`);
      
      // Try to find and click edit button
      const firstCard = projectCards.first();
      await firstCard.hover();
      
      // Look for edit button with various possible selectors
      const editButton = await page.locator('button:has-text("Edit"), [aria-label*="edit" i], button[title*="edit" i]').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL('**/projects/*/edit');
        await page.waitForTimeout(1000);
        
        // Capture EDIT form fields
        editFormFields = await page.evaluate(() => {
          const fields = [];
          
          document.querySelectorAll('input[name], textarea[name], select[name]').forEach(element => {
            if (element.offsetParent !== null) {
              fields.push({
                name: element.getAttribute('name'),
                type: element.tagName.toLowerCase() === 'textarea' ? 'textarea' : 
                      element.tagName.toLowerCase() === 'select' ? 'select' : element.type,
                label: element.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label',
                required: element.hasAttribute('required'),
                value: element.value,
                hasValue: element.value && element.value.trim() !== ''
              });
            }
          });
          
          return fields;
        });
        
        console.log('Edit Form Fields:');
        editFormFields.forEach(field => {
          console.log(`  ✓ ${field.label} (name="${field.name}", type="${field.type}"${field.required ? ', required' : ''}${field.hasValue ? ', populated' : ', empty'})`);
        });
        
        console.log(`\n📊 Total EDIT form fields: ${editFormFields.length}`);
      } else {
        console.log('❌ Could not find Edit button');
      }
    } else {
      console.log('⚠️ No projects found to edit. Please create a project first.');
    }
    
    // ===== STEP 3: COMPARISON ANALYSIS =====
    console.log('\n' + '='.repeat(80));
    console.log('📊 FIELD CONSISTENCY COMPARISON');
    console.log('='.repeat(80));
    
    if (editFormFields.length > 0) {
      // Combine all create fields for comparison
      const allCreateFields = [...createFormFields.step1_basicInfo, ...createFormFields.step2_projectDetails];
      
      // Create field name maps for easier comparison
      const createFieldMap = new Map(allCreateFields.map(f => [f.name, f]));
      const editFieldMap = new Map(editFormFields.map(f => [f.name, f]));
      
      // Find differences
      const onlyInCreate = [];
      const onlyInEdit = [];
      const inBoth = [];
      
      // Check fields in CREATE
      allCreateFields.forEach(field => {
        if (editFieldMap.has(field.name)) {
          inBoth.push(field.name);
        } else {
          onlyInCreate.push(field);
        }
      });
      
      // Check fields in EDIT
      editFormFields.forEach(field => {
        if (!createFieldMap.has(field.name)) {
          onlyInEdit.push(field);
        }
      });
      
      // Report findings
      console.log('\n✅ Fields in BOTH forms:', inBoth.length);
      inBoth.forEach(name => {
        console.log(`   - ${name}`);
      });
      
      if (onlyInCreate.length > 0) {
        console.log('\n⚠️ Fields ONLY in CREATE form:', onlyInCreate.length);
        onlyInCreate.forEach(field => {
          console.log(`   - ${field.name} (${field.label})`);
        });
      }
      
      if (onlyInEdit.length > 0) {
        console.log('\n⚠️ Fields ONLY in EDIT form:', onlyInEdit.length);
        onlyInEdit.forEach(field => {
          console.log(`   - ${field.name} (${field.label})`);
        });
      }
      
      // Calculate consistency score
      const consistencyScore = (inBoth.length / Math.max(allCreateFields.length, editFormFields.length)) * 100;
      
      console.log('\n' + '='.repeat(80));
      console.log('🎯 CONSISTENCY VERDICT');
      console.log('='.repeat(80));
      console.log(`Consistency Score: ${consistencyScore.toFixed(1)}%`);
      
      if (consistencyScore === 100) {
        console.log('✅ PERFECT: Forms have identical field structure');
      } else if (consistencyScore >= 90) {
        console.log('✅ EXCELLENT: Forms are highly consistent');
      } else if (consistencyScore >= 80) {
        console.log('⚠️ GOOD: Forms are mostly consistent with minor differences');
      } else if (consistencyScore >= 70) {
        console.log('⚠️ FAIR: Forms have noticeable inconsistencies');
      } else {
        console.log('❌ POOR: Forms have significant structural differences');
      }
      
      // Recommendations
      if (onlyInCreate.length > 0 || onlyInEdit.length > 0) {
        console.log('\n📝 RECOMMENDATIONS:');
        if (onlyInCreate.length > 0) {
          console.log('1. Add missing fields to EDIT form from CREATE form');
        }
        if (onlyInEdit.length > 0) {
          console.log('2. Review if EDIT-only fields should be in CREATE form');
        }
        console.log('3. Ensure field names and types match exactly');
        console.log('4. Apply Universal Module Structure pattern');
      }
      
    } else {
      console.log('⚠️ Cannot perform comparison without EDIT form data');
      console.log('Please create a project and re-run this test');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('TEST COMPLETE');
    console.log('='.repeat(80));
  });
});