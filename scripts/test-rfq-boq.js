#!/usr/bin/env node

/**
 * Test Script for RFQ/BOQ Functionality
 * Tests the migrated Neon-based services
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function testRFQBOQ() {
  console.log('🧪 Testing RFQ/BOQ Functionality with Neon\n');
  
  try {
    // Test 1: Use a test project ID
    console.log('1️⃣ Setting up test project ID...');
    const projectId = `test-${Date.now()}`;
    console.log('   ✅ Using project ID:', projectId);
    
    // Test 2: Create a BOQ
    console.log('\n2️⃣ Creating BOQ...');
    const boqResult = await sql`
      INSERT INTO boqs (
        project_id, title, description, status, version, 
        uploaded_by, currency, total_estimated_value
      )
      VALUES (
        ${projectId},
        ${'Test BOQ'},
        ${'Bill of Quantities for testing'},
        ${'draft'},
        ${1},
        ${'test-user'},
        ${'ZAR'},
        ${100000}
      )
      RETURNING id`;
    const boqId = boqResult[0].id;
    console.log('   ✅ BOQ created:', boqId);
    
    // Test 3: Add BOQ items
    console.log('\n3️⃣ Adding BOQ items...');
    const boqItems = [
      { item: 'Cable CAT6', quantity: 1000, unit: 'm', rate: 15, amount: 15000 },
      { item: 'Fiber Optic Cable', quantity: 500, unit: 'm', rate: 45, amount: 22500 },
      { item: 'Network Switch', quantity: 10, unit: 'pcs', rate: 2500, amount: 25000 }
    ];
    
    for (let i = 0; i < boqItems.length; i++) {
      const item = boqItems[i];
      await sql`
        INSERT INTO boq_items (
          boq_id, project_id, item_number, description, 
          unit, quantity, rate, amount, sequence_number
        )
        VALUES (
          ${boqId},
          ${projectId},
          ${(i + 1).toString()},
          ${item.item},
          ${item.unit},
          ${item.quantity},
          ${item.rate},
          ${item.amount},
          ${i + 1}
        )`;
    }
    console.log('   ✅ Added', boqItems.length, 'BOQ items');
    
    // Test 4: Create RFQ
    console.log('\n4️⃣ Creating RFQ...');
    const rfqNumber = `RFQ-TEST-${Date.now()}`;
    const rfqResult = await sql`
      INSERT INTO rfqs (
        project_id, rfq_number, title, description, status,
        issue_date, response_deadline, currency,
        payment_terms, delivery_terms, invited_suppliers
      )
      VALUES (
        ${projectId},
        ${rfqNumber},
        ${'Test RFQ for Network Equipment'},
        ${'Request for quotation for network equipment and cables'},
        ${'draft'},
        ${new Date().toISOString()},
        ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()},
        ${'ZAR'},
        ${'Net 30 days'},
        ${'FOB Destination'},
        ${JSON.stringify(['supplier-1', 'supplier-2'])}
      )
      RETURNING id`;
    const rfqId = rfqResult[0].id;
    console.log('   ✅ RFQ created:', rfqId, '(', rfqNumber, ')');
    
    // Test 5: Add RFQ items
    console.log('\n5️⃣ Adding RFQ items...');
    const rfqItems = [
      { desc: 'CAT6 Network Cable', qty: 1000, unit: 'm' },
      { desc: 'Fiber Optic Cable Single Mode', qty: 500, unit: 'm' },
      { desc: '24-Port Gigabit Network Switch', qty: 10, unit: 'pcs' }
    ];
    
    for (let i = 0; i < rfqItems.length; i++) {
      const item = rfqItems[i];
      await sql`
        INSERT INTO rfq_items (
          rfq_id, line_number, description, quantity, uom
        )
        VALUES (
          ${rfqId},
          ${i + 1},
          ${item.desc},
          ${item.qty},
          ${item.unit}
        )`;
    }
    console.log('   ✅ Added', rfqItems.length, 'RFQ items');
    
    // Test 6: Link BOQ to RFQ
    console.log('\n6️⃣ Linking BOQ to RFQ...');
    await sql`
      INSERT INTO boq_rfq_links (boq_id, rfq_id, link_type, created_by)
      VALUES (${boqId}, ${rfqId}, ${'full'}, ${'test-user'})
      ON CONFLICT (boq_id, rfq_id) DO NOTHING`;
    console.log('   ✅ BOQ linked to RFQ');
    
    // Test 7: Submit a supplier response
    console.log('\n7️⃣ Submitting supplier response...');
    const responseNumber = `RSP-TEST-${Date.now()}`;
    const responseResult = await sql`
      INSERT INTO rfq_responses (
        rfq_id, supplier_id, supplier_name, response_number,
        total_amount, currency, validity_period, payment_terms, status
      )
      VALUES (
        ${rfqId},
        ${'supplier-1'},
        ${'Test Supplier Co.'},
        ${responseNumber},
        ${85000},
        ${'ZAR'},
        ${30},
        ${'Net 45 days'},
        ${'submitted'}
      )
      RETURNING id`;
    const responseId = responseResult[0].id;
    console.log('   ✅ Response submitted:', responseId);
    
    // Test 8: Create notification
    console.log('\n8️⃣ Creating notification...');
    await sql`
      INSERT INTO rfq_notifications (
        rfq_id, notification_type, recipient_type,
        recipient_email, subject, message, status
      )
      VALUES (
        ${rfqId},
        ${'rfq_invitation'},
        ${'supplier'},
        ${'supplier@example.com'},
        ${'RFQ Invitation: ' + rfqNumber},
        ${'You are invited to submit a quote for ' + rfqNumber},
        ${'pending'}
      )`;
    console.log('   ✅ Notification created');
    
    // Test 9: Query data
    console.log('\n9️⃣ Verifying data...');
    
    // Check RFQ with responses
    const rfqCheck = await sql`
      SELECT 
        r.*,
        COUNT(DISTINCT ri.id) as item_count,
        COUNT(DISTINCT rr.id) as response_count
      FROM rfqs r
      LEFT JOIN rfq_items ri ON r.id = ri.rfq_id
      LEFT JOIN rfq_responses rr ON r.id = rr.rfq_id
      WHERE r.id = ${rfqId}
      GROUP BY r.id`;
    
    console.log('   RFQ Details:');
    console.log('   - Number:', rfqCheck[0].rfq_number);
    console.log('   - Items:', rfqCheck[0].item_count);
    console.log('   - Responses:', rfqCheck[0].response_count);
    
    // Check BOQ with items
    const boqCheck = await sql`
      SELECT 
        b.*,
        COUNT(DISTINCT bi.id) as item_count,
        SUM(bi.amount) as total_value
      FROM boqs b
      LEFT JOIN boq_items bi ON b.id = bi.boq_id
      WHERE b.id = ${boqId}
      GROUP BY b.id`;
    
    console.log('\n   BOQ Details:');
    console.log('   - Title:', boqCheck[0].title);
    console.log('   - Items:', boqCheck[0].item_count);
    console.log('   - Total Value: ZAR', boqCheck[0].total_value);
    
    // Test 10: Test views
    console.log('\n🔟 Testing database views...');
    const rfqSummary = await sql`
      SELECT * FROM rfq_summary WHERE id = ${rfqId}`;
    
    if (rfqSummary.length > 0) {
      console.log('   ✅ RFQ Summary view working');
    }
    
    const boqSummary = await sql`
      SELECT * FROM boq_summary WHERE id = ${boqId}`;
    
    if (boqSummary.length > 0) {
      console.log('   ✅ BOQ Summary view working');
    }
    
    console.log('\n✨ All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Project ID:', projectId);
    console.log('   - BOQ ID:', boqId);
    console.log('   - RFQ ID:', rfqId);
    console.log('   - Response ID:', responseId);
    
    // Cleanup (optional)
    const cleanup = process.argv.includes('--cleanup');
    if (cleanup) {
      console.log('\n🧹 Cleaning up test data...');
      await sql`DELETE FROM rfqs WHERE id = ${rfqId}`;
      await sql`DELETE FROM boqs WHERE id = ${boqId}`;
      console.log('   ✅ Test data cleaned up');
    } else {
      console.log('\n💡 Tip: Run with --cleanup to remove test data');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
testRFQBOQ();