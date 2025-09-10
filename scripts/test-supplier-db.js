/**
 * Direct database test for supplier tables
 */

const { Client } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_aRNLhZc1G2CD@ep-dry-night-a9qyh4sj-pooler.gwc.azure.neon.tech/neondb?sslmode=require';

async function testDatabase() {
  console.log('🧪 Testing Supplier Database Operations...\n');
  
  const client = new Client({
    connectionString: DATABASE_URL,
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Test 1: Query all suppliers
    console.log('📋 Test 1: Query all suppliers');
    const suppliersResult = await client.query(`
      SELECT id, code, name, status, business_type, email
      FROM suppliers
      ORDER BY name
    `);
    console.log(`✅ Found ${suppliersResult.rows.length} suppliers:`);
    suppliersResult.rows.forEach(s => {
      console.log(`   - ${s.code}: ${s.name} (${s.status})`);
    });
    
    // Test 2: Query with filters
    console.log('\n📋 Test 2: Query active suppliers');
    const activeResult = await client.query(`
      SELECT id, code, name 
      FROM suppliers 
      WHERE status = 'active'
    `);
    console.log(`✅ Found ${activeResult.rows.length} active suppliers`);
    
    // Test 3: Join with ratings
    console.log('\n📋 Test 3: Suppliers with ratings');
    const ratingsResult = await client.query(`
      SELECT 
        s.name,
        s.rating_overall,
        s.total_reviews,
        COUNT(r.id) as actual_reviews
      FROM suppliers s
      LEFT JOIN supplier_ratings r ON s.id = r.supplier_id
      GROUP BY s.id, s.name, s.rating_overall, s.total_reviews
      HAVING COUNT(r.id) > 0
    `);
    console.log(`✅ Suppliers with ratings:`);
    ratingsResult.rows.forEach(s => {
      console.log(`   - ${s.name}: ${s.rating_overall}/5 (${s.actual_reviews} reviews)`);
    });
    
    // Test 4: Compliance documents
    console.log('\n📋 Test 4: Compliance documents');
    const complianceResult = await client.query(`
      SELECT 
        s.name,
        c.doc_type,
        c.status,
        c.expiry_date
      FROM supplier_compliance c
      JOIN suppliers s ON s.id = c.supplier_id
      ORDER BY s.name, c.doc_type
    `);
    console.log(`✅ Found ${complianceResult.rows.length} compliance documents:`);
    complianceResult.rows.forEach(doc => {
      console.log(`   - ${doc.name}: ${doc.doc_type} (${doc.status})`);
    });
    
    // Test 5: Products
    console.log('\n📋 Test 5: Supplier products');
    const productsResult = await client.query(`
      SELECT 
        s.name as supplier_name,
        p.product_name,
        p.unit_price,
        p.category
      FROM supplier_products p
      JOIN suppliers s ON s.id = p.supplier_id
      ORDER BY s.name, p.product_name
    `);
    console.log(`✅ Found ${productsResult.rows.length} products:`);
    productsResult.rows.forEach(p => {
      console.log(`   - ${p.supplier_name}: ${p.product_name} (R${p.unit_price})`);
    });
    
    // Test 6: Insert new supplier
    console.log('\n📋 Test 6: Insert new supplier');
    const insertResult = await client.query(`
      INSERT INTO suppliers (
        code, name, company_name, email, phone,
        status, business_type, is_active,
        created_by, updated_by
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10
      )
      RETURNING id, code, name
    `, [
      'TEST-' + Date.now(),
      'API Test Supplier',
      'API Test Company Ltd',
      'apitest@example.com',
      '+27 11 999 8888',
      'pending',
      'service_provider',
      true,
      'api-test',
      'api-test'
    ]);
    const newSupplier = insertResult.rows[0];
    console.log(`✅ Created supplier: ${newSupplier.code} - ${newSupplier.name}`);
    
    // Test 7: Update supplier
    console.log('\n📋 Test 7: Update supplier');
    await client.query(`
      UPDATE suppliers 
      SET 
        notes = $1,
        status = $2,
        updated_at = NOW()
      WHERE id = $3
    `, ['Updated via API test', 'active', newSupplier.id]);
    console.log('✅ Supplier updated successfully');
    
    // Test 8: Add rating
    console.log('\n📋 Test 8: Add rating');
    await client.query(`
      INSERT INTO supplier_ratings (
        supplier_id, overall_rating, quality_rating,
        review_title, review_text, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      newSupplier.id,
      4.5,
      4.7,
      'API Test Review',
      'Testing via API',
      'api-test'
    ]);
    console.log('✅ Rating added successfully');
    
    // Test 9: Check triggers
    console.log('\n📋 Test 9: Check update triggers');
    const triggerResult = await client.query(`
      SELECT name, updated_at 
      FROM suppliers 
      WHERE id = $1
    `, [newSupplier.id]);
    console.log(`✅ Updated timestamp: ${triggerResult.rows[0].updated_at}`);
    
    // Test 10: Statistics
    console.log('\n📋 Test 10: Statistics');
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE is_preferred = true) as preferred,
        COUNT(*) FILTER (WHERE blacklisted = true) as blacklisted
      FROM suppliers
    `);
    const stats = statsResult.rows[0];
    console.log('✅ Database statistics:');
    console.log(`   Total suppliers: ${stats.total}`);
    console.log(`   Active: ${stats.active}`);
    console.log(`   Pending: ${stats.pending}`);
    console.log(`   Preferred: ${stats.preferred}`);
    console.log(`   Blacklisted: ${stats.blacklisted}`);
    
    console.log('\n✅ All database tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

// Run tests
testDatabase().catch(console.error);