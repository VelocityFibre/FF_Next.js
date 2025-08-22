import { test, expect } from '@playwright/test';

test.describe('Simple Field Consistency Check', () => {
  test('Compare Create and Edit form fields directly', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('FIELD CONSISTENCY CHECK - CREATE vs EDIT');
    console.log('='.repeat(80));
    
    // ===== CAPTURE CREATE FORM FIELDS =====
    console.log('\n📝 Analyzing CREATE form...');
    
    await page.goto('http://localhost:5173/app/projects/create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Step 1 fields
    const createStep1 = await page.evaluate(() => {
      const fields = [];
      document.querySelectorAll('input[name], textarea[name], select[name]').forEach(el => {
        if (el.offsetParent) {
          fields.push(el.getAttribute('name'));
        }
      });
      return fields;
    });
    
    console.log('CREATE Step 1 fields:', createStep1);
    
    // Go to Step 2
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    
    const createStep2 = await page.evaluate(() => {
      const fields = [];
      document.querySelectorAll('input[name], textarea[name], select[name]').forEach(el => {
        if (el.offsetParent) {
          fields.push(el.getAttribute('name'));
        }
      });
      return fields;
    });
    
    console.log('CREATE Step 2 fields:', createStep2);
    
    const allCreateFields = [...new Set([...createStep1, ...createStep2])];
    console.log(`\nTotal unique CREATE fields: ${allCreateFields.length}`);
    
    // ===== FIND AND OPEN HEIN TEST PROJECT FOR EDIT =====
    console.log('\n📝 Opening "Hein Test" project for editing...');
    
    // Go to projects list
    await page.goto('http://localhost:5173/app/projects');
    await page.waitForLoadState('networkidle');
    
    // Look for Hein Test - try different approaches
    console.log('Looking for "Hein Test" project...');
    
    // First, check if we're in a table view
    const isTableView = await page.locator('table').isVisible();
    const isCardView = await page.locator('[class*="grid"]').isVisible();
    
    console.log(`View type: ${isTableView ? 'Table' : isCardView ? 'Card' : 'Unknown'}`);
    
    let foundEdit = false;
    
    // Try Method 1: Direct navigation to edit URL if we know the pattern
    // This assumes the project exists and we can guess its ID or slug
    
    // Try Method 2: Click on Hein Test text and look for edit
    const heinTest = page.locator('text="Hein Test"').first();
    if (await heinTest.isVisible()) {
      console.log('Found "Hein Test", clicking...');
      await heinTest.click();
      await page.waitForTimeout(1000);
      
      // Check if we're on detail page
      if (page.url().includes('/projects/') && !page.url().includes('/edit')) {
        console.log('On detail page, looking for Edit button...');
        const editBtn = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
        if (await editBtn.isVisible()) {
          await editBtn.click();
          await page.waitForTimeout(1000);
          foundEdit = true;
        }
      }
    }
    
    // Try Method 3: Look for edit button in list view
    if (!foundEdit) {
      console.log('Trying to find Edit button in list view...');
      
      // For table rows
      if (isTableView) {
        const heinRow = page.locator('tr:has-text("Hein Test")').first();
        if (await heinRow.isVisible()) {
          await heinRow.hover();
          const editBtn = heinRow.locator('button:has-text("Edit")').first();
          if (await editBtn.isVisible()) {
            await editBtn.click();
            foundEdit = true;
          }
        }
      }
      
      // For cards
      if (isCardView && !foundEdit) {
        const heinCard = page.locator('div:has-text("Hein Test")').filter({ hasText: 'Edit' }).first();
        if (await heinCard.isVisible()) {
          await heinCard.hover();
          const editBtn = heinCard.locator('button:has-text("Edit")').first();
          if (await editBtn.isVisible()) {
            await editBtn.click();
            foundEdit = true;
          }
        }
      }
    }
    
    // Check if we're on edit page
    await page.waitForTimeout(1000);
    const onEditPage = page.url().includes('/edit');
    
    if (onEditPage) {
      console.log('✅ Successfully opened edit form');
      
      // Capture edit form fields
      const editFields = await page.evaluate(() => {
        const fields = [];
        document.querySelectorAll('input[name], textarea[name], select[name]').forEach(el => {
          if (el.offsetParent) {
            fields.push(el.getAttribute('name'));
          }
        });
        return fields;
      });
      
      console.log(`\nEDIT form fields: ${editFields}`);
      console.log(`Total EDIT fields: ${editFields.length}`);
      
      // ===== COMPARISON =====
      console.log('\n' + '='.repeat(80));
      console.log('📊 COMPARISON RESULTS');
      console.log('='.repeat(80));
      
      const createSet = new Set(allCreateFields);
      const editSet = new Set(editFields);
      
      const inBoth = allCreateFields.filter(f => editSet.has(f));
      const onlyCreate = allCreateFields.filter(f => !editSet.has(f));
      const onlyEdit = editFields.filter(f => !createSet.has(f));
      
      console.log(`\n✅ Fields in BOTH: ${inBoth.length}`);
      inBoth.forEach(f => console.log(`   - ${f}`));
      
      if (onlyCreate.length > 0) {
        console.log(`\n⚠️ Only in CREATE: ${onlyCreate.length}`);
        onlyCreate.forEach(f => console.log(`   - ${f}`));
      }
      
      if (onlyEdit.length > 0) {
        console.log(`\n⚠️ Only in EDIT: ${onlyEdit.length}`);
        onlyEdit.forEach(f => console.log(`   - ${f}`));
      }
      
      const score = (inBoth.length / Math.max(allCreateFields.length, editFields.length)) * 100;
      
      console.log('\n' + '='.repeat(80));
      console.log(`CONSISTENCY SCORE: ${score.toFixed(1)}%`);
      
      if (score === 100) {
        console.log('✅ PERFECT - Forms are identical');
      } else if (score >= 80) {
        console.log('⚠️ GOOD - Minor differences');
      } else {
        console.log('❌ NEEDS WORK - Significant differences');
      }
      
      console.log('\nRECOMMENDATION:');
      console.log('Apply Universal Module Structure to ensure consistency');
      console.log('='.repeat(80));
      
    } else {
      console.log('❌ Could not open edit form');
      console.log('Current URL:', page.url());
      
      // Try manual navigation as last resort
      console.log('\nAttempting manual navigation to an edit URL...');
      // This would require knowing a project ID
      // await page.goto('http://localhost:5173/app/projects/PROJECT_ID/edit');
    }
  });
});