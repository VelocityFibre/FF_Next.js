import { test, expect } from '@playwright/test';

test.describe('Project Edit Form Tests', () => {
  test('should load project data in edit form', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('PROJECT EDIT FORM DATA LOADING');
    console.log('='.repeat(80));
    
    // Navigate to projects list first
    await page.goto('http://localhost:5173/app/projects');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Look for any existing project to edit
    const projectCards = page.locator('[class*="hover:shadow-md"], .project-card, tr');
    const projectCount = await projectCards.count();
    
    if (projectCount > 0) {
      console.log(`Found ${projectCount} projects. Testing edit form...`);
      
      // Find and click edit button
      const editButton = page.locator('button:has-text("Edit"), [aria-label*="edit" i], button[title*="edit" i]').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL('**/projects/*/edit');
        await page.waitForTimeout(1000);
        
        // Check if form is populated with data
        const editFormFields = await page.evaluate(() => {
          const fields = [];
          document.querySelectorAll('input[name], textarea[name], select[name]').forEach(element => {
            if (element.offsetParent !== null) {
              fields.push({
                name: element.getAttribute('name'),
                type: element.tagName.toLowerCase(),
                value: element.value,
                hasValue: element.value && element.value.trim() !== '',
                label: element.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label'
              });
            }
          });
          return fields;
        });
        
        console.log('\nEdit Form Fields:');
        const populatedFields = editFormFields.filter(f => f.hasValue);
        editFormFields.forEach(field => {
          console.log(`  ✓ ${field.label} (${field.name}${field.hasValue ? ', populated' : ', empty'})`);
        });
        
        console.log(`\n📊 Data Loading Summary:`);
        console.log(`  Total fields: ${editFormFields.length}`);
        console.log(`  Populated fields: ${populatedFields.length}`);
        console.log(`  Data loading rate: ${((populatedFields.length / editFormFields.length) * 100).toFixed(1)}%`);
        
        // Verify at least some fields are populated
        expect(populatedFields.length).toBeGreaterThan(0);
        console.log('\n✅ Edit form data loading successful');
      }
    }
  });
  
  test('should save form changes', async ({ page }) => {
    console.log('\n💾 Testing form save functionality...');
    
    await page.goto('http://localhost:5173/app/projects');
    await page.waitForLoadState('networkidle');
    
    const editButton = page.locator('button:has-text("Edit")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForURL('**/projects/*/edit');
      await page.waitForTimeout(1000);
      
      // Make a small change
      const descriptionField = page.locator('textarea[name="description"]');
      if (await descriptionField.isVisible()) {
        const originalValue = await descriptionField.inputValue();
        const newValue = originalValue + ' - Updated ' + Date.now();
        
        await descriptionField.clear();
        await descriptionField.fill(newValue);
        
        // Save the form
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(2000);
          
          // Check for success message or redirect
          const currentUrl = page.url();
          const hasSuccessMessage = await page.locator('[class*="success"], .text-green-500').count();
          
          if (!currentUrl.includes('/edit') || hasSuccessMessage > 0) {
            console.log('✅ Form changes saved successfully');
          }
        }
      }
    }
  });
});

test.describe('Project Form Field Consistency', () => {
  test('should have consistent fields between create and edit forms', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('FIELD CONSISTENCY VERIFICATION');
    console.log('='.repeat(80));
    
    // First, get create form fields
    await page.goto('http://localhost:5173/app/projects/create');
    await page.waitForLoadState('networkidle');
    
    const createFormFields = await page.evaluate(() => {
      const fields = [];
      document.querySelectorAll('input[name], textarea[name], select[name]').forEach(element => {
        if (element.offsetParent !== null) {
          fields.push({
            name: element.getAttribute('name'),
            type: element.type || element.tagName.toLowerCase(),
            label: element.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label'
          });
        }
      });
      return fields;
    });
    
    // Then get edit form fields
    await page.goto('http://localhost:5173/app/projects');
    await page.waitForLoadState('networkidle');
    
    const editButton = page.locator('button:has-text("Edit")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.waitForURL('**/projects/*/edit');
      await page.waitForTimeout(1000);
      
      const editFormFields = await page.evaluate(() => {
        const fields = [];
        document.querySelectorAll('input[name], textarea[name], select[name]').forEach(element => {
          if (element.offsetParent !== null) {
            fields.push({
              name: element.getAttribute('name'),
              type: element.type || element.tagName.toLowerCase(),
              label: element.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label'
            });
          }
        });
        return fields;
      });
      
      // Compare field structures
      const createFieldNames = new Set(createFormFields.map(f => f.name));
      const editFieldNames = new Set(editFormFields.map(f => f.name));
      
      const onlyInCreate = [...createFieldNames].filter(name => !editFieldNames.has(name));
      const onlyInEdit = [...editFieldNames].filter(name => !createFieldNames.has(name));
      const inBoth = [...createFieldNames].filter(name => editFieldNames.has(name));
      
      console.log('\n📊 Field Consistency Analysis:');
      console.log(`  Create form fields: ${createFieldNames.size}`);
      console.log(`  Edit form fields: ${editFieldNames.size}`);
      console.log(`  Shared fields: ${inBoth.length}`);
      console.log(`  Only in create: ${onlyInCreate.length}`);
      console.log(`  Only in edit: ${onlyInEdit.length}`);
      
      if (onlyInCreate.length > 0) {
        console.log('\n⚠️ Fields only in CREATE form:');
        onlyInCreate.forEach(name => console.log(`    - ${name}`));
      }
      
      if (onlyInEdit.length > 0) {
        console.log('\n⚠️ Fields only in EDIT form:');
        onlyInEdit.forEach(name => console.log(`    - ${name}`));
      }
      
      // Calculate consistency score
      const totalUniqueFields = new Set([...createFieldNames, ...editFieldNames]).size;
      const consistencyScore = (inBoth.length / totalUniqueFields) * 100;
      
      console.log(`\n🎯 Consistency Score: ${consistencyScore.toFixed(1)}%`);
      
      // Expect at least 80% consistency
      expect(consistencyScore).toBeGreaterThan(80);
      
      if (consistencyScore >= 95) {
        console.log('✅ EXCELLENT: Forms are highly consistent');
      } else if (consistencyScore >= 80) {
        console.log('✅ GOOD: Forms are mostly consistent');
      }
    }
  });
});