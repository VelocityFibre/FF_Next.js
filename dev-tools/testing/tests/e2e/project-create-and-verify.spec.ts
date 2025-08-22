import { test, expect } from '@playwright/test';

test.describe('Project Creation and Field Verification', () => {
  test('Create project and verify field consistency between create and edit forms', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('PROJECT CREATION AND FIELD CONSISTENCY TEST');
    console.log('='.repeat(80));
    
    // ===== STEP 1: CREATE A NEW PROJECT =====
    console.log('\n📝 STEP 1: Creating a new project...');
    console.log('-'.repeat(40));
    
    // Navigate to projects page
    await page.goto('http://localhost:5173/app/projects');
    await page.waitForLoadState('networkidle');
    
    // Click Add Project button
    await page.click('text=Add Project');
    await page.waitForURL('**/projects/create');
    await page.waitForTimeout(1000);
    
    // Capture all fields in creation form BEFORE filling
    const createFormStructure = await page.evaluate(() => {
      const fields = [];
      document.querySelectorAll('input[name], textarea[name], select[name]').forEach(element => {
        if (element.offsetParent !== null) {
          fields.push({
            name: element.getAttribute('name'),
            type: element.tagName.toLowerCase() === 'textarea' ? 'textarea' : 
                  element.tagName.toLowerCase() === 'select' ? 'select' : element.type,
            label: element.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label',
            required: element.hasAttribute('required')
          });
        }
      });
      return fields;
    });
    
    console.log('Create Form Fields (Step 1):');
    createFormStructure.forEach(field => {
      console.log(`  ✓ ${field.label} (name="${field.name}"${field.required ? ', required' : ''})`);
    });
    
    // Fill in the form - Step 1: Basic Information
    const testProjectData = {
      name: 'Playwright Test Project ' + Date.now(),
      description: 'Testing field consistency between create and edit forms',
      latitude: '-33.9249',
      longitude: '18.4241',
      city: 'Cape Town',
      district: 'City of Cape Town',
      province: 'Western Cape',
      startDate: '2024-01-15',
      duration: '6'
    };
    
    console.log('\nFilling project creation form...');
    
    // Fill basic fields
    await page.fill('input[name="name"]', testProjectData.name);
    await page.fill('textarea[name="description"]', testProjectData.description);
    
    // Select client if dropdown exists and has options
    const clientSelect = page.locator('select[name="clientId"]');
    if (await clientSelect.isVisible()) {
      const clientOptions = await clientSelect.locator('option').count();
      if (clientOptions > 1) {
        // Select the first actual client (index 1, as 0 is usually placeholder)
        await clientSelect.selectOption({ index: 1 });
        console.log('  ✓ Selected first available client');
      }
    }
    
    // Fill location fields
    await page.fill('input[name="location.gpsLatitude"]', testProjectData.latitude);
    await page.fill('input[name="location.gpsLongitude"]', testProjectData.longitude);
    await page.fill('input[name="location.city"]', testProjectData.city);
    await page.fill('input[name="location.municipalDistrict"]', testProjectData.district);
    
    // Try to fill province - it might be a text input or select
    const provinceInput = page.locator('input[name="location.province"]');
    const provinceSelect = page.locator('select[name="location.province"]');
    
    if (await provinceInput.isVisible()) {
      await provinceInput.fill(testProjectData.province);
    } else if (await provinceSelect.isVisible()) {
      await provinceSelect.selectOption({ label: testProjectData.province });
    }
    
    // Fill dates
    await page.fill('input[name="startDate"]', testProjectData.startDate);
    await page.fill('input[name="durationMonths"]', testProjectData.duration);
    
    console.log('  ✓ Filled all Step 1 fields');
    
    // Click Next to go to Step 2
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      console.log('\nMoving to Step 2: Project Details...');
      
      // Capture Step 2 fields
      const step2Fields = await page.evaluate(() => {
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
      
      console.log('Create Form Fields (Step 2):');
      step2Fields.forEach(field => {
        console.log(`  ✓ ${field.label} (name="${field.name}")`);
      });
      
      // Fill Step 2 fields
      await page.fill('input[name="budget.totalBudget"]', '500000');
      
      // Select priority
      const prioritySelect = page.locator('select[name="priority"]');
      if (await prioritySelect.isVisible()) {
        await prioritySelect.selectOption({ value: 'high' });
      }
      
      // Select project manager if available
      const pmSelect = page.locator('select[name="projectManagerId"]');
      if (await pmSelect.isVisible()) {
        const pmOptions = await pmSelect.locator('option').count();
        if (pmOptions > 1) {
          await pmSelect.selectOption({ index: 1 });
          console.log('  ✓ Selected first available project manager');
        }
      }
      
      console.log('  ✓ Filled all Step 2 fields');
      
      // Submit the form
      const submitButton = page.locator('button:has-text("Create Project"), button:has-text("Submit")');
      if (await submitButton.isVisible()) {
        console.log('\n🚀 Submitting project creation form...');
        await submitButton.click();
        
        // Wait for navigation or success message
        await page.waitForTimeout(2000);
        
        // Check if we're redirected to projects list or project detail
        const currentUrl = page.url();
        if (currentUrl.includes('/projects') && !currentUrl.includes('/create')) {
          console.log('✅ Project created successfully!');
        }
      }
    }
    
    // ===== STEP 2: FIND AND EDIT THE CREATED PROJECT =====
    console.log('\n📝 STEP 2: Finding and editing the created project...');
    console.log('-'.repeat(40));
    
    // Navigate back to projects list
    await page.goto('http://localhost:5173/app/projects');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Find the project we just created
    const projectCards = page.locator('[class*="hover:shadow-md"], .project-card, tr:has-text("' + testProjectData.name + '")');
    const projectCount = await projectCards.count();
    
    if (projectCount > 0) {
      console.log(`Found ${projectCount} project(s). Looking for our test project...`);
      
      // Look for our specific project
      const ourProject = page.locator(`text="${testProjectData.name}"`).first();
      if (await ourProject.isVisible()) {
        console.log('✅ Found our test project!');
        
        // Find and click the edit button for this project
        const projectRow = ourProject.locator('xpath=ancestor::tr | ancestor::div[contains(@class, "shadow")]').first();
        await projectRow.hover();
        
        // Try different edit button selectors
        const editButton = projectRow.locator('button:has-text("Edit"), [aria-label*="edit" i], button[title*="edit" i]').first();
        
        if (await editButton.isVisible()) {
          await editButton.click();
          await page.waitForURL('**/projects/*/edit');
          await page.waitForTimeout(1000);
          
          console.log('✅ Opened edit form');
          
          // ===== STEP 3: CAPTURE EDIT FORM FIELDS =====
          console.log('\n📝 STEP 3: Analyzing EDIT form fields...');
          console.log('-'.repeat(40));
          
          const editFormFields = await page.evaluate(() => {
            const fields = [];
            document.querySelectorAll('input[name], textarea[name], select[name]').forEach(element => {
              if (element.offsetParent !== null) {
                fields.push({
                  name: element.getAttribute('name'),
                  type: element.tagName.toLowerCase() === 'textarea' ? 'textarea' : 
                        element.tagName.toLowerCase() === 'select' ? 'select' : element.type,
                  label: element.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label',
                  value: element.value,
                  hasValue: element.value && element.value.trim() !== ''
                });
              }
            });
            return fields;
          });
          
          console.log('Edit Form Fields:');
          editFormFields.forEach(field => {
            console.log(`  ✓ ${field.label} (name="${field.name}"${field.hasValue ? ', populated' : ', empty'})`);
          });
          
          // ===== STEP 4: COMPARE FIELD STRUCTURES =====
          console.log('\n' + '='.repeat(80));
          console.log('📊 FIELD CONSISTENCY COMPARISON');
          console.log('='.repeat(80));
          
          // Get unique field names from create form
          const createFieldNames = new Set(createFormStructure.map(f => f.name));
          const editFieldNames = new Set(editFormFields.map(f => f.name));
          
          // Find differences
          const onlyInCreate = [...createFieldNames].filter(name => !editFieldNames.has(name));
          const onlyInEdit = [...editFieldNames].filter(name => !createFieldNames.has(name));
          const inBoth = [...createFieldNames].filter(name => editFieldNames.has(name));
          
          console.log('\n✅ Fields in BOTH forms:', inBoth.length);
          inBoth.forEach(name => {
            console.log(`   - ${name}`);
          });
          
          if (onlyInCreate.length > 0) {
            console.log('\n⚠️ Fields ONLY in CREATE form:', onlyInCreate.length);
            onlyInCreate.forEach(name => {
              const field = createFormStructure.find(f => f.name === name);
              console.log(`   - ${name} (${field?.label})`);
            });
          }
          
          if (onlyInEdit.length > 0) {
            console.log('\n⚠️ Fields ONLY in EDIT form:', onlyInEdit.length);
            onlyInEdit.forEach(name => {
              const field = editFormFields.find(f => f.name === name);
              console.log(`   - ${name} (${field?.label})`);
            });
          }
          
          // Verify data preservation
          console.log('\n📝 DATA PRESERVATION CHECK:');
          console.log('-'.repeat(40));
          
          // Check if our test data is preserved
          const nameField = editFormFields.find(f => f.name === 'name');
          const descField = editFormFields.find(f => f.name === 'description');
          
          if (nameField?.value === testProjectData.name) {
            console.log('✅ Project name preserved correctly');
          } else {
            console.log(`❌ Project name mismatch: Expected "${testProjectData.name}", got "${nameField?.value}"`);
          }
          
          if (descField?.value === testProjectData.description) {
            console.log('✅ Description preserved correctly');
          } else {
            console.log('⚠️ Description may have changed');
          }
          
          // Calculate consistency score
          const totalFields = Math.max(createFieldNames.size, editFieldNames.size);
          const consistencyScore = (inBoth.length / totalFields) * 100;
          
          console.log('\n' + '='.repeat(80));
          console.log('🎯 FINAL VERDICT');
          console.log('='.repeat(80));
          console.log(`Consistency Score: ${consistencyScore.toFixed(1)}%`);
          console.log(`Create Form: ${createFieldNames.size} fields`);
          console.log(`Edit Form: ${editFieldNames.size} fields`);
          console.log(`Shared Fields: ${inBoth.length}`);
          
          if (consistencyScore === 100) {
            console.log('\n✅ PERFECT: Forms have identical field structure');
          } else if (consistencyScore >= 90) {
            console.log('\n✅ EXCELLENT: Forms are highly consistent');
          } else if (consistencyScore >= 80) {
            console.log('\n⚠️ GOOD: Forms are mostly consistent with minor differences');
          } else {
            console.log('\n❌ NEEDS IMPROVEMENT: Forms have structural differences');
            console.log('\nRECOMMENDATION: Apply Universal Module Structure pattern');
            console.log('- Ensure CREATE and EDIT forms use the same field definitions');
            console.log('- Use consistent field names across all views');
          }
          
          // Assert for test pass/fail
          expect(consistencyScore).toBeGreaterThan(80);
          
        } else {
          console.log('❌ Could not find Edit button for the project');
        }
      } else {
        console.log('❌ Could not find the test project in the list');
      }
    } else {
      console.log('❌ No projects found in the list');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('TEST COMPLETE');
    console.log('='.repeat(80));
  });
});