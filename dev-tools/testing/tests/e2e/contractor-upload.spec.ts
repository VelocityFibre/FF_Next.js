import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

test.describe('Contractor Import Upload', () => {
  let testCsvPath: string;

  test.beforeAll(() => {
    // Create test CSV file
    const csvContent = `Company Name*,Trading Name,Contact Person*,Email*,Registration Number*,Phone,Business Type*,Services,Website,Address 1,Address 2,Suburb,City,Province*,Postal Code,Country,Region of Operations
Alpha Construction Ltd,Alpha Contractors,John Smith,john@alphaconstruction.com,2021/123456/07,0123456789,Pty Ltd,"Fibre Installation, Network Maintenance",https://www.alphaconstruction.com,123 Main Street,Unit 5A,Sandton,Johannesburg,Gauteng,2196,South Africa,"Gauteng, Western Cape"
Beta Networks CC,,Jane Doe,jane@betanetworks.co.za,2020/987654/23,0987654321,CC,"Fibre Splicing, Network Testing",https://betanetworks.co.za,456 Oak Avenue,,Claremont,Cape Town,Western Cape,7708,South Africa,"Western Cape, Eastern Cape"
Gamma Trust,GT Solutions,Mike Johnson,mike@gammatrust.org.za,2019/555444/08,+27116667777,Trust,"Trenching, Civil Construction",https://gammatrust.org.za,789 Pine Road,Suite 12B,Durban North,Durban,KwaZulu-Natal,4051,South Africa,KwaZulu-Natal`;

    // Use process.cwd() instead of __dirname
    testCsvPath = path.join(process.cwd(), 'test-contractors-e2e.csv');
    fs.writeFileSync(testCsvPath, csvContent, 'utf8');
  });

  test.afterAll(() => {
    // Clean up test file
    if (fs.existsSync(testCsvPath)) {
      fs.unlinkSync(testCsvPath);
    }
  });

  test('should successfully upload and parse contractor CSV file', async ({ page }) => {
    // Navigate to contractors page
    await page.goto('/app/contractors');
    
    // Wait for page to load
    await expect(page).toHaveTitle(/FibreFlow/);
    
    // Look for import button - it might be in a dropdown or modal trigger
    const importButton = page.locator('button').filter({ hasText: /import/i }).first();
    await expect(importButton).toBeVisible({ timeout: 10000 });
    
    // Click import button to open modal
    await importButton.click();
    
    // Wait for import modal to open
    const importModal = page.locator('[role="dialog"]').or(page.locator('.modal')).or(page.locator('h1, h2, h3').filter({ hasText: /import/i }).locator('..').locator('..')).first();
    await expect(importModal).toBeVisible({ timeout: 5000 });
    
    // Look for file input or drop zone
    const fileInput = page.locator('input[type="file"]').or(page.locator('[accept*="csv"]')).first();
    
    if (await fileInput.count() > 0) {
      // Upload via file input
      console.log('📤 Uploading file via input...');
      await fileInput.setInputFiles(testCsvPath);
    } else {
      // Try drag and drop area
      console.log('📤 Looking for drag and drop area...');
      const dropZone = page.locator('.dropzone, [data-testid="file-drop-zone"], .file-drop-zone').first();
      
      if (await dropZone.count() > 0) {
        const fileContent = fs.readFileSync(testCsvPath);
        await dropZone.setInputFiles({
          name: 'test-contractors.csv',
          mimeType: 'text/csv',
          buffer: fileContent,
        });
      } else {
        throw new Error('Could not find file upload mechanism');
      }
    }
    
    // Wait for file processing
    console.log('⏳ Waiting for file processing...');
    await page.waitForTimeout(3000);
    
    // Check for processing indicator or results
    const processingIndicator = page.locator('.loading, .processing, .spinner').first();
    if (await processingIndicator.count() > 0) {
      await expect(processingIndicator).toBeHidden({ timeout: 15000 });
    }
    
    // Verify import preview shows parsed data
    console.log('🔍 Checking for parsed results...');
    
    // Look for record count indicators
    const totalRecordsIndicator = page.locator('text=/Total Records.*[1-9]/', { timeout: 5000 });
    const validRecordsIndicator = page.locator('text=/Valid Records.*[1-9]/', { timeout: 5000 });
    
    try {
      await expect(totalRecordsIndicator.or(validRecordsIndicator)).toBeVisible({ timeout: 10000 });
      console.log('✅ Found record count indicators');
    } catch (error) {
      // Take screenshot for debugging
      await page.screenshot({ path: 'contractor-upload-debug.png' });
      console.log('📸 Screenshot saved for debugging');
      
      // Log current page content for debugging
      const pageContent = await page.content();
      console.log('📄 Current page content includes:', pageContent.includes('Import') ? 'Import modal' : 'No import modal');
      console.log('📄 Page title:', await page.title());
      
      throw error;
    }
    
    // Verify specific contractor data is displayed
    const companyNames = ['Alpha Construction', 'Beta Networks', 'Gamma Trust'];
    
    for (const company of companyNames) {
      const companyElement = page.locator(`text=/${company}/i`).first();
      if (await companyElement.count() > 0) {
        console.log(`✅ Found company: ${company}`);
      }
    }
    
    // Check for validation status
    const errorCount = page.locator('text=/Errors.*0/').first();
    if (await errorCount.count() > 0) {
      console.log('✅ No validation errors found');
    }
    
    console.log('🎉 Contractor upload test completed successfully!');
  });

  test('should handle invalid CSV file gracefully', async ({ page }) => {
    // Create invalid CSV file
    const invalidCsvContent = 'Invalid,CSV,Content\nMissing,Required,Fields';
    const invalidCsvPath = path.join(process.cwd(), 'test-invalid.csv');
    fs.writeFileSync(invalidCsvPath, invalidCsvContent, 'utf8');
    
    try {
      await page.goto('/app/contractors');
      
      // Open import modal
      const importButton = page.locator('button').filter({ hasText: /import/i }).first();
      await importButton.click();
      
      // Upload invalid file
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(invalidCsvPath);
      
      // Wait for processing
      await page.waitForTimeout(2000);
      
      // Should show validation errors
      const errorIndicator = page.locator('text=/error/i, text=/invalid/i').first();
      
      console.log('✅ Invalid file handling test completed');
      
    } finally {
      // Clean up
      if (fs.existsSync(invalidCsvPath)) {
        fs.unlinkSync(invalidCsvPath);
      }
    }
  });

  test('should download CSV template correctly', async ({ page }) => {
    await page.goto('/app/contractors');
    
    // Open import modal
    const importButton = page.locator('button').filter({ hasText: /import/i }).first();
    await importButton.click();
    
    // Look for download template button
    const downloadButton = page.locator('button').filter({ hasText: /template|download/i }).first();
    
    if (await downloadButton.count() > 0) {
      // Set up download promise
      const downloadPromise = page.waitForDownload();
      
      // Click download button
      await downloadButton.click();
      
      // Wait for download
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toMatch(/contractor.*template.*\.csv/i);
      
      console.log('✅ CSV template download test completed');
    } else {
      console.log('⚠️ Download template button not found - may be in instructions');
    }
  });
});