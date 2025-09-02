/**
 * Check Poles Tables Structure
 */

import { sql } from '../config/database.config.js';

async function checkPolesData() {
  console.log('🔍 Checking Poles Data Storage\n');

  try {
    // 1. Check poles table structure
    console.log('1️⃣ Checking "poles" table structure...');
    const polesColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'poles'
      ORDER BY ordinal_position
    `;
    
    if (polesColumns.length > 0) {
      console.log('\nPoles table columns:');
      polesColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : ''}`);
      });
      
      // Check data in poles table
      const polesCount = await sql`SELECT COUNT(*) as count FROM poles`;
      console.log(`\nTotal records in poles table: ${polesCount[0].count}`);
      
      // Get sample data
      if (polesCount[0].count > 0) {
        const samplePoles = await sql`
          SELECT * FROM poles 
          ORDER BY created_at DESC 
          LIMIT 3
        `;
        
        console.log('\nSample poles (latest 3):');
        samplePoles.forEach((pole, idx) => {
          console.log(`\nPole ${idx + 1}:`);
          Object.entries(pole).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              console.log(`  ${key}: ${JSON.stringify(value).substring(0, 100)}`);
            }
          });
        });
      }
    }

    // 2. Check SOW table structure
    console.log('\n\n2️⃣ Checking "sow" table structure...');
    const sowColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'sow'
      ORDER BY ordinal_position
    `;
    
    if (sowColumns.length > 0) {
      console.log('\nSOW table columns:');
      sowColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : ''}`);
      });
      
      // Check data in sow table
      const sowCount = await sql`SELECT COUNT(*) as count FROM sow`;
      console.log(`\nTotal records in SOW table: ${sowCount[0].count}`);
      
      // Get sample data for louisTest project
      const projectId = '8e49f043-66fd-452c-8371-e571cafcf1c4'; // louisTest project ID
      
      const sowData = await sql`
        SELECT * FROM sow 
        WHERE project_id = ${projectId}
        LIMIT 1
      `;
      
      if (sowData.length > 0) {
        console.log('\nSOW data for louisTest project:');
        const sow = sowData[0];
        
        console.log(`  ID: ${sow.id}`);
        console.log(`  Project ID: ${sow.project_id}`);
        console.log(`  Status: ${sow.status}`);
        console.log(`  Created: ${sow.created_at}`);
        
        // Check if poles_data exists and has content
        if (sow.poles_data) {
          console.log('\n  Poles Data:');
          if (typeof sow.poles_data === 'string') {
            try {
              const polesJson = JSON.parse(sow.poles_data);
              console.log(`    Type: JSON string`);
              console.log(`    Number of poles: ${Array.isArray(polesJson) ? polesJson.length : 'N/A'}`);
              
              if (Array.isArray(polesJson) && polesJson.length > 0) {
                console.log('\n    First 3 poles:');
                polesJson.slice(0, 3).forEach((pole: any, idx: number) => {
                  console.log(`\n    Pole ${idx + 1}:`);
                  console.log(`      Pole Number: ${pole.pole_number || pole.label_1}`);
                  console.log(`      Latitude: ${pole.latitude || pole.lat}`);
                  console.log(`      Longitude: ${pole.longitude || pole.lon}`);
                });
              }
            } catch (e) {
              console.log(`    Raw data: ${sow.poles_data.substring(0, 200)}...`);
            }
          } else if (typeof sow.poles_data === 'object') {
            console.log(`    Type: JSONB object`);
            console.log(`    Number of poles: ${Array.isArray(sow.poles_data) ? sow.poles_data.length : 'N/A'}`);
            
            if (Array.isArray(sow.poles_data) && sow.poles_data.length > 0) {
              console.log('\n    First 3 poles:');
              sow.poles_data.slice(0, 3).forEach((pole: any, idx: number) => {
                console.log(`\n    Pole ${idx + 1}:`);
                console.log(`      Pole Number: ${pole.pole_number || pole.label_1}`);
                console.log(`      Latitude: ${pole.latitude || pole.lat}`);
                console.log(`      Longitude: ${pole.longitude || pole.lon}`);
              });
              
              console.log('\n    Last 3 poles:');
              sow.poles_data.slice(-3).forEach((pole: any, idx: number) => {
                console.log(`\n    Pole ${idx + 1}:`);
                console.log(`      Pole Number: ${pole.pole_number || pole.label_1}`);
                console.log(`      Latitude: ${pole.latitude || pole.lat}`);
                console.log(`      Longitude: ${pole.longitude || pole.lon}`);
              });
            }
          }
        } else {
          console.log('  Poles Data: NULL or empty');
        }
        
        // Check other data fields
        if (sow.drops_data) {
          const dropsCount = Array.isArray(sow.drops_data) ? sow.drops_data.length : 
                             typeof sow.drops_data === 'string' ? JSON.parse(sow.drops_data).length : 0;
          console.log(`\n  Drops Data: ${dropsCount} records`);
        }
        
        if (sow.fibre_data) {
          const fibreCount = Array.isArray(sow.fibre_data) ? sow.fibre_data.length : 
                             typeof sow.fibre_data === 'string' ? JSON.parse(sow.fibre_data).length : 0;
          console.log(`  Fibre Data: ${fibreCount} records`);
        }
      } else {
        console.log('\nNo SOW data found for louisTest project');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPolesData();