import { sql } from '../../config/database.config.js';

async function checkDropsStats() {
  const projectId = '8e49f043-66fd-452c-8371-e571cafcf1c4';
  
  // Based on the Lawley format, addresses that are just "LAW.ONT.DRxxxxx" are likely spares
  // Real house addresses would have street names, stand numbers, etc.
  
  // Count drops that look like spares (address is just the drop reference)
  const spares = await sql`
    SELECT COUNT(*) as count 
    FROM drops 
    WHERE project_id = ${projectId} 
    AND (
      address IS NULL 
      OR address = ''
      OR address LIKE 'LAW.ONT.DR%'
      OR address = drop_number
    )
  `;
  
  // Count drops with actual addresses (not just the drop reference)
  const houses = await sql`
    SELECT COUNT(*) as count 
    FROM drops 
    WHERE project_id = ${projectId} 
    AND address IS NOT NULL
    AND address != ''
    AND address NOT LIKE 'LAW.ONT.DR%'
    AND address != drop_number
  `;
  
  const total = await sql`
    SELECT COUNT(*) as count 
    FROM drops 
    WHERE project_id = ${projectId}
  `;
  
  console.log('📊 DROP STATISTICS:');
  console.log('  Total drops:', total[0].count);
  console.log('  🏠 Houses (real addresses):', houses[0].count);
  console.log('  📦 Spares (drop refs only):', spares[0].count);
  
  // Calculate percentage
  if (total[0].count > 0) {
    const housesPercent = ((houses[0].count / total[0].count) * 100).toFixed(1);
    const sparesPercent = ((spares[0].count / total[0].count) * 100).toFixed(1);
    
    console.log(`\n  Houses: ${housesPercent}%`);
    console.log(`  Spares: ${sparesPercent}%`);
  }
  
  // Check unique address patterns
  const patterns = await sql`
    SELECT 
      SUBSTRING(address, 1, 10) as pattern,
      COUNT(*) as count
    FROM drops
    WHERE project_id = ${projectId}
    GROUP BY pattern
    ORDER BY count DESC
    LIMIT 5
  `;
  
  console.log('\n📋 Most common address patterns:');
  patterns.forEach(p => {
    console.log(`  ${p.pattern}... : ${p.count} drops`);
  });
  
  // Sample drops with different patterns
  console.log('\n📋 Sample drops:');
  
  // Get some with LAW.ONT pattern
  const lawPattern = await sql`
    SELECT drop_number, address 
    FROM drops 
    WHERE project_id = ${projectId}
    AND address LIKE 'LAW.ONT.%'
    LIMIT 5
  `;
  
  console.log('  Drops with LAW.ONT pattern (likely spares):');
  lawPattern.forEach(d => {
    console.log(`    ${d.drop_number}: ${d.address}`);
  });
  
  // Get some without LAW.ONT pattern
  const otherPattern = await sql`
    SELECT drop_number, address 
    FROM drops 
    WHERE project_id = ${projectId}
    AND address NOT LIKE 'LAW.ONT.%'
    LIMIT 5
  `;
  
  if (otherPattern.length > 0) {
    console.log('\n  Drops with other patterns (likely houses):');
    otherPattern.forEach(d => {
      console.log(`    ${d.drop_number}: ${d.address}`);
    });
  }
}

checkDropsStats();