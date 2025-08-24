import { test, expect } from '@playwright/test';

test.describe('Project Creation Form Tests', () => {
  test('should display all required form fields', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('PROJECT CREATION FORM FIELD VERIFICATION');
    console.log('='.repeat(80));
    
    // Navigate to project creation page
    await page.goto('http://localhost:5173/app/projects');
    await page.waitForLoadState('networkidle');
    
    // Click Add Project button
    await page.click('text=Add Project');
    await page.waitForURL('**/projects/create');
    await page.waitForTimeout(1000);
    
    // Capture all fields in creation form
    const createFormFields = await page.evaluate(() => {
      const fields = [];
      document.querySelectorAll('input[name], textarea[name], select[name]').forEach(element => {
        if (element.offsetParent !== null) {
          fields.push({
            name: element.getAttribute('name'),
            type: element.tagName.toLowerCase() === 'textarea' ? 'textarea' : 
                  element.tagName.toLowerCase() === 'select' ? 'select' : element.type,
            label: element.closest('div')?.querySelector('label')?.textContent?.trim() || 'No label',
            required: element.hasAttribute('required'),
            visible: true
          });
        }
      });
      return fields;
    });
    
    console.log('\nForm Fields Found:', createFormFields.length);
    createFormFields.forEach(field => {
      console.log(`  ✓ ${field.label} (${field.name}${field.required ? ', required' : ''})`);
    });
    
    // Verify essential fields are present
    const requiredFields = ['name', 'description', 'clientId'];
    const foundFields = createFormFields.map(f => f.name);
    
    requiredFields.forEach(fieldName => {
      expect(foundFields).toContain(fieldName);
    });
    
    console.log('\n✅ All essential form fields are present');
  });
  
  test('should validate required fields', async ({ page }) => {
    console.log('\n📋 Testing form validation...');
    
    await page.goto('http://localhost:5173/app/projects/create');
    await page.waitForLoadState('networkidle');
    
    // Try to submit empty form
    const submitButton = page.locator('button:has-text("Create Project"), button:has-text("Submit")');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);
      
      // Check for validation messages
      const validationMessages = await page.locator('[class*="error"], [class*="invalid"], .text-red-500').count();
      expect(validationMessages).toBeGreaterThan(0);
      
      console.log(`✅ Form validation working - ${validationMessages} validation messages shown`);
    }
  });
  
  test('should handle client selection', async ({ page }) => {
    console.log('\n👤 Testing client selection...');
    
    await page.goto('http://localhost:5173/app/projects/create');
    await page.waitForLoadState('networkidle');
    
    const clientSelect = page.locator('select[name="clientId"]');
    if (await clientSelect.isVisible()) {
      const clientOptions = await clientSelect.locator('option').count();
      console.log(`Found ${clientOptions} client options`);
      
      if (clientOptions > 1) {
        await clientSelect.selectOption({ index: 1 });
        const selectedValue = await clientSelect.inputValue();
        expect(selectedValue).not.toBe('');
        console.log('✅ Client selection working');
      }
    }
  });
});

test.describe('Project Form Data Handling', () => {
  test('should preserve form data during navigation', async ({ page }) => {
    console.log('\n💾 Testing form data persistence...');
    
    await page.goto('http://localhost:5173/app/projects/create');
    await page.waitForLoadState('networkidle');
    
    const testData = {
      name: 'Data Persistence Test ' + Date.now(),
      description: 'Testing if form data is preserved'
    };
    
    // Fill some form fields
    await page.fill('input[name="name"]', testData.name);
    await page.fill('textarea[name="description"]', testData.description);
    
    // Navigate to next step if multi-step form
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Go back to first step
      const backButton = page.locator('button:has-text("Back"), button:has-text("Previous")');
      if (await backButton.isVisible()) {
        await backButton.click();
        await page.waitForTimeout(500);
        
        // Verify data is still there
        const nameValue = await page.inputValue('input[name="name"]');
        const descValue = await page.inputValue('textarea[name="description"]');
        
        expect(nameValue).toBe(testData.name);
        expect(descValue).toBe(testData.description);
        
        console.log('✅ Form data preserved during navigation');
      }
    }
  });
  
  test('should handle location data input', async ({ page }) => {
    console.log('\n🗺️ Testing location data input...');
    
    await page.goto('http://localhost:5173/app/projects/create');
    await page.waitForLoadState('networkidle');
    
    const locationData = {
      latitude: '-33.9249',
      longitude: '18.4241',
      city: 'Cape Town',
      district: 'City of Cape Town'
    };
    
    // Fill location fields
    const latInput = page.locator('input[name*="latitude"], input[name*="lat"]');
    if (await latInput.isVisible()) {
      await latInput.fill(locationData.latitude);
    }
    
    const lngInput = page.locator('input[name*="longitude"], input[name*="lng"]');
    if (await lngInput.isVisible()) {
      await lngInput.fill(locationData.longitude);
    }
    
    const cityInput = page.locator('input[name*="city"]');
    if (await cityInput.isVisible()) {
      await cityInput.fill(locationData.city);
    }
    
    // Verify values were set
    if (await latInput.isVisible()) {
      expect(await latInput.inputValue()).toBe(locationData.latitude);
      console.log('✅ Location data input working');
    }
  });
});