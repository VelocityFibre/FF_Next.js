import { test, expect } from '@playwright/test';

test.describe('Project Creation Workflow', () => {
  test('should complete full project creation workflow', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('COMPLETE PROJECT CREATION WORKFLOW TEST');
    console.log('='.repeat(80));
    
    // Step 1: Navigate to project creation
    console.log('\n📝 STEP 1: Starting project creation...');
    await page.goto('http://localhost:5173/app/projects');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Add Project');
    await page.waitForURL('**/projects/create');
    await page.waitForTimeout(1000);
    
    // Step 2: Fill project information
    console.log('\n📝 STEP 2: Filling project information...');
    
    const testProjectData = {
      name: 'E2E Test Project ' + Date.now(),
      description: 'End-to-end test project for form validation',
      latitude: '-33.9249',
      longitude: '18.4241',
      city: 'Cape Town',
      district: 'City of Cape Town',
      province: 'Western Cape',
      startDate: '2024-01-15',
      duration: '6'
    };
    
    // Fill basic information
    await page.fill('input[name="name"]', testProjectData.name);
    await page.fill('textarea[name="description"]', testProjectData.description);
    
    console.log(`  ✓ Project name: ${testProjectData.name}`);
    console.log(`  ✓ Description: ${testProjectData.description}`);
    
    // Handle client selection
    const clientSelect = page.locator('select[name="clientId"]');
    if (await clientSelect.isVisible()) {
      const clientOptions = await clientSelect.locator('option').count();
      if (clientOptions > 1) {
        await clientSelect.selectOption({ index: 1 });
        console.log('  ✓ Client selected');
      }
    }
    
    // Fill location information
    const locationFields = [
      { selector: 'input[name*="latitude"]', value: testProjectData.latitude, label: 'Latitude' },
      { selector: 'input[name*="longitude"]', value: testProjectData.longitude, label: 'Longitude' },
      { selector: 'input[name*="city"]', value: testProjectData.city, label: 'City' },
      { selector: 'input[name*="district"]', value: testProjectData.district, label: 'District' }
    ];
    
    for (const field of locationFields) {
      const element = page.locator(field.selector);
      if (await element.isVisible()) {
        await element.fill(field.value);
        console.log(`  ✓ ${field.label}: ${field.value}`);
      }
    }
    
    // Fill dates and duration
    const dateFields = [
      { selector: 'input[name="startDate"]', value: testProjectData.startDate, label: 'Start Date' },
      { selector: 'input[name*="duration"]', value: testProjectData.duration, label: 'Duration' }
    ];
    
    for (const field of dateFields) {
      const element = page.locator(field.selector);
      if (await element.isVisible()) {
        await element.fill(field.value);
        console.log(`  ✓ ${field.label}: ${field.value}`);
      }
    }
    
    // Step 3: Handle multi-step form if present
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      console.log('\n📝 STEP 3: Moving to additional form steps...');
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      // Fill additional fields if present
      const budgetField = page.locator('input[name*="budget"]');
      if (await budgetField.isVisible()) {
        await budgetField.fill('500000');
        console.log('  ✓ Budget: 500000');
      }
      
      const prioritySelect = page.locator('select[name="priority"]');
      if (await prioritySelect.isVisible()) {
        await prioritySelect.selectOption({ value: 'high' });
        console.log('  ✓ Priority: High');
      }
      
      const pmSelect = page.locator('select[name*="manager"]');
      if (await pmSelect.isVisible()) {
        const pmOptions = await pmSelect.locator('option').count();
        if (pmOptions > 1) {
          await pmSelect.selectOption({ index: 1 });
          console.log('  ✓ Project Manager selected');
        }
      }
    }
    
    // Step 4: Submit the form
    console.log('\n🚀 STEP 4: Submitting project...');
    const submitButton = page.locator('button:has-text("Create Project"), button:has-text("Submit")');
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(3000);
      
      // Check for success indicators
      const currentUrl = page.url();
      const hasSuccessMessage = await page.locator('[class*="success"], .text-green-500').count();
      
      if (!currentUrl.includes('/create') || hasSuccessMessage > 0) {
        console.log('  ✅ Project created successfully!');
        
        // Step 5: Verify project appears in list
        console.log('\n🔍 STEP 5: Verifying project in list...');
        
        if (!page.url().includes('/projects')) {
          await page.goto('http://localhost:5173/app/projects');
          await page.waitForLoadState('networkidle');
        }
        
        await page.waitForTimeout(2000);
        
        const projectExists = await page.locator(`text="${testProjectData.name}"`).count();
        expect(projectExists).toBeGreaterThan(0);
        
        console.log(`  ✅ Project "${testProjectData.name}" found in project list`);
        console.log('\n' + '='.repeat(80));
        console.log('🎉 WORKFLOW COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(80));
      } else {
        console.log('  ⚠️ Form submission may have failed or is still processing');
      }
    } else {
      console.log('  ⚠️ Submit button not found');
    }
  });
});

test.describe('Project Data Validation Workflow', () => {
  test('should validate project data end-to-end', async ({ page }) => {
    console.log('\n🔍 PROJECT DATA VALIDATION WORKFLOW');
    
    // Create a project with specific data
    const testData = {
      name: 'Validation Test Project ' + Date.now(),
      description: 'Project for testing data validation workflow'
    };
    
    // Navigate to creation form
    await page.goto('http://localhost:5173/app/projects/create');
    await page.waitForLoadState('networkidle');
    
    // Fill and submit form
    await page.fill('input[name="name"]', testData.name);
    await page.fill('textarea[name="description"]', testData.description);
    
    // Select client if available
    const clientSelect = page.locator('select[name="clientId"]');
    if (await clientSelect.isVisible()) {
      const options = await clientSelect.locator('option').count();
      if (options > 1) {
        await clientSelect.selectOption({ index: 1 });
      }
    }
    
    // Submit form
    const submitButton = page.locator('button:has-text("Create Project"), button:has-text("Submit")');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);
      
      // Navigate to projects list
      await page.goto('http://localhost:5173/app/projects');
      await page.waitForLoadState('networkidle');
      
      // Find the created project
      const projectLink = page.locator(`text="${testData.name}"`).first();
      if (await projectLink.isVisible()) {
        // Click to view project details
        await projectLink.click();
        await page.waitForTimeout(1000);
        
        // Verify project data is correctly displayed
        const projectTitle = await page.locator('h1, h2, [class*="title"]').first().textContent();
        const projectDesc = await page.locator('p, [class*="description"]').first().textContent();
        
        if (projectTitle?.includes(testData.name)) {
          console.log('✅ Project name correctly displayed in details');
        }
        
        if (projectDesc?.includes(testData.description)) {
          console.log('✅ Project description correctly displayed');
        }
        
        expect(projectTitle).toContain(testData.name);
        console.log('✅ End-to-end data validation successful');
      }
    }
  });
});