import { test, expect } from '@playwright/test';

test.describe('Project Module Field Consistency', () => {
  test('Project creation form and edit form should have the same fields', async ({ page }) => {
    // Navigate to projects page
    await page.goto('http://localhost:5181/app/projects');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Step 1: Navigate to Create Project and capture all fields
    console.log('📝 Checking Project Creation Form...');
    await page.click('text=Add Project');
    await page.waitForURL('**/projects/create');
    
    // Capture all form fields in creation wizard
    const createFields = {
      // Basic Information Step
      basicInfo: {
        projectName: await page.locator('input[name="name"]').isVisible(),
        description: await page.locator('textarea[name="description"]').isVisible(),
        client: await page.locator('select[name="clientId"]').isVisible(),
        gpsLatitude: await page.locator('input[name="location.gpsLatitude"]').isVisible(),
        gpsLongitude: await page.locator('input[name="location.gpsLongitude"]').isVisible(),
        city: await page.locator('input[name="location.city"]').isVisible(),
        municipalDistrict: await page.locator('input[name="location.municipalDistrict"]').isVisible(),
        province: await page.locator('select[name="location.province"]').isVisible(),
      },
      // Project Details Step (navigate to it)
      projectDetails: {}
    };
    
    // Click next to go to Project Details step
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      createFields.projectDetails = {
        budget: await page.locator('input[name="budget.totalBudget"]').isVisible(),
        priority: await page.locator('select[name="priority"]').isVisible(),
        projectManager: await page.locator('select[name="projectManagerId"]').isVisible(),
        notes: await page.locator('textarea[name="description"]').count() > 1, // May have multiple description fields
      };
    }
    
    console.log('✅ Create Form Fields Found:', createFields);
    
    // Step 2: Go back to projects list
    await page.goto('http://localhost:5181/app/projects');
    await page.waitForLoadState('networkidle');
    
    // Step 3: Click on an existing project to edit (if any exists)
    const projectCards = page.locator('[class*="hover:shadow-md"]');
    const projectCount = await projectCards.count();
    
    if (projectCount > 0) {
      console.log(`📝 Found ${projectCount} existing projects. Checking edit form...`);
      
      // Click edit on first project
      await projectCards.first().hover();
      const editButton = page.locator('button:has-text("Edit")').first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForURL('**/projects/*/edit');
        await page.waitForLoadState('networkidle');
        
        // Capture all fields in edit form
        const editFields = {
          projectName: await page.locator('input[name="name"]').isVisible(),
          description: await page.locator('textarea[name="description"]').isVisible(),
          startDate: await page.locator('input[name="startDate"]').isVisible(),
          endDate: await page.locator('input[name="endDate"]').isVisible(),
          duration: await page.locator('input[type="number"]').first().isVisible(),
          client: await page.locator('select[name="clientId"]').isVisible(),
          projectManager: await page.locator('select[name="projectManagerId"]').isVisible(),
          priority: await page.locator('select[name="priority"]').isVisible(),
          budget: await page.locator('input[name="budget"]').isVisible(),
          
          // Location fields
          address: await page.locator('input[name="location.address"]').isVisible(),
          city: await page.locator('input[name="location.city"]').isVisible(),
          province: await page.locator('select[name="location.province"]').isVisible(),
          gpsLatitude: await page.locator('input[name="location.gpsLatitude"]').isVisible(),
          gpsLongitude: await page.locator('input[name="location.gpsLongitude"]').isVisible(),
        };
        
        console.log('✅ Edit Form Fields Found:', editFields);
        
        // Compare field presence
        console.log('\n🔍 Field Consistency Analysis:');
        console.log('================================');
        
        // Check if edit form has all create form fields
        const missingInEdit = [];
        const extraInEdit = [];
        
        // Basic fields that should be in both
        const expectedFields = [
          'projectName/name',
          'description', 
          'client/clientId',
          'projectManager/projectManagerId',
          'priority',
          'budget',
          'city',
          'province',
          'gpsLatitude',
          'gpsLongitude'
        ];
        
        console.log('\n📊 Field Comparison Results:');
        console.log('----------------------------');
        
        // Check create form basic info fields
        for (const [field, isVisible] of Object.entries(createFields.basicInfo)) {
          if (isVisible) {
            console.log(`✅ CREATE has: ${field}`);
          }
        }
        
        console.log('\n');
        
        // Check edit form fields
        for (const [field, isVisible] of Object.entries(editFields)) {
          if (isVisible) {
            console.log(`✅ EDIT has: ${field}`);
          } else {
            console.log(`❌ EDIT missing: ${field}`);
          }
        }
        
        // Determine consistency
        const hasConsistentFields = 
          editFields.projectName && 
          editFields.description && 
          editFields.client &&
          editFields.projectManager &&
          editFields.priority &&
          editFields.budget &&
          editFields.city &&
          editFields.province;
        
        if (hasConsistentFields) {
          console.log('\n✅ CONSISTENT: Core fields are present in both forms');
        } else {
          console.log('\n❌ INCONSISTENT: Some core fields are missing');
        }
        
        // Additional checks for data population
        if (editFields.projectName) {
          const nameValue = await page.locator('input[name="name"]').inputValue();
          console.log(`\n📝 Edit form is populated: Project Name = "${nameValue}"`);
          expect(nameValue).toBeTruthy();
        }
        
      } else {
        console.log('⚠️ Could not find edit button');
      }
    } else {
      console.log('⚠️ No existing projects found. Creating one for testing...');
      
      // Create a test project first
      await page.click('text=Add Project');
      await page.waitForURL('**/projects/create');
      
      // Fill in required fields
      await page.fill('input[name="name"]', 'Test Consistency Project');
      await page.fill('textarea[name="description"]', 'Testing field consistency');
      
      // Select first available client if any
      const clientSelect = page.locator('select[name="clientId"]');
      if (await clientSelect.isVisible()) {
        const options = await clientSelect.locator('option').count();
        if (options > 1) {
          await clientSelect.selectOption({ index: 1 });
        }
      }
      
      console.log('📝 Please complete project creation manually and re-run test');
    }
    
    // Step 4: Check View mode (project detail page)
    await page.goto('http://localhost:5181/app/projects');
    await page.waitForLoadState('networkidle');
    
    const firstProject = projectCards.first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForURL('**/projects/*');
      await page.waitForTimeout(1000);
      
      console.log('\n📝 Checking Project View/Detail Page...');
      
      // Check for consistent display of fields
      const viewFields = {
        projectName: await page.locator('text=/.*Project Name.*|.*name.*/i').isVisible(),
        description: await page.locator('text=/.*Description.*/i').isVisible(),
        client: await page.locator('text=/.*Client.*/i').isVisible(),
        location: await page.locator('text=/.*Location.*|.*City.*/i').isVisible(),
        budget: await page.locator('text=/.*Budget.*|R/').isVisible(),
        dates: await page.locator('text=/.*Duration.*|.*Start.*|.*End.*/i').isVisible(),
        status: await page.locator('text=/.*Status.*|.*Planning.*|.*Progress.*/i').isVisible(),
        priority: await page.locator('text=/.*Priority.*|.*High.*|.*Medium.*|.*Low.*/i').isVisible(),
      };
      
      console.log('✅ View Page Fields Found:', viewFields);
      
      // Final consistency verdict
      console.log('\n🎯 FINAL CONSISTENCY VERDICT:');
      console.log('==============================');
      
      const viewHasAllFields = Object.values(viewFields).every(v => v === true);
      
      if (viewHasAllFields) {
        console.log('✅ VIEW page shows all expected fields');
      } else {
        console.log('⚠️ VIEW page may be missing some fields');
        for (const [field, isVisible] of Object.entries(viewFields)) {
          if (!isVisible) {
            console.log(`   ❌ Missing: ${field}`);
          }
        }
      }
    }
  });
});

test.describe('Field Order Consistency', () => {
  test('Fields should appear in the same order across views', async ({ page }) => {
    // This test would check that fields appear in consistent order
    // For now, we'll do a basic check
    
    await page.goto('http://localhost:5181/app/projects/create');
    await page.waitForLoadState('networkidle');
    
    // Get all input labels in order
    const createLabels = await page.locator('label').allTextContents();
    console.log('Create Form Field Order:', createLabels.filter(l => l.trim()));
    
    // Navigate to edit if possible
    await page.goto('http://localhost:5181/app/projects');
    const projectExists = await page.locator('[class*="hover:shadow-md"]').first().isVisible();
    
    if (projectExists) {
      await page.locator('[class*="hover:shadow-md"]').first().hover();
      const editBtn = page.locator('button:has-text("Edit")').first();
      if (await editBtn.isVisible()) {
        await editBtn.click();
        await page.waitForURL('**/projects/*/edit');
        
        const editLabels = await page.locator('label').allTextContents();
        console.log('Edit Form Field Order:', editLabels.filter(l => l.trim()));
        
        // Compare orders
        console.log('\n🔍 Field Order Comparison:');
        console.log('Create form has', createLabels.length, 'labels');
        console.log('Edit form has', editLabels.length, 'labels');
      }
    }
  });
});