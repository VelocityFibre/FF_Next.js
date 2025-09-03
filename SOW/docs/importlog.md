# SOW Import Audit Log

## Import Record - 2025-09-03

### Import Details
- **Date**: 2025-09-03
- **Time**: ~06:30 UTC  
- **Project**: louisProjectTestWed
- **Project ID**: 7e7a6d88-8da1-4ac3-a16e-4b7a91e83439
- **Source File**: /home/louisdup/Downloads/Lawley Poles.xlsx
- **Records in Excel**: 4471

### Import Results ✅
- **Poles Successfully Imported**: 4471 (100% success rate)
- **Skipped Records**: 0
- **Import Time**: 47.05 seconds
- **Processing Rate**: 95 poles/second
- **Batch Size Used**: 1000 records per batch
- **Total Batches**: 5

### Script Used
- **Script Location**: `/scripts/sow-import/run-import.cjs`
- **Method**: Fast batch import using proven GitHub implementation
- **Library**: pg (PostgreSQL client) - NOT @neondatabase/serverless
- **Approach**: Dynamic placeholder generation with multi-value INSERT statements
- **Implementation Reference**: https://github.com/VelocityFibre/FibreFlow_Firebase/tree/master/scripts/sow-import

### Database Configuration
- **Database**: Neon PostgreSQL (Serverless)
- **Connection String**: Uses DATABASE_URL from environment
- **Host**: ep-dry-night-a9qyh4sj-pooler.gwc.azure.neon.tech
- **SSL**: Required

### Technical Details
```javascript
// Batch processing pattern used:
INSERT INTO sow_poles (columns...) 
VALUES (row1), (row2), ..., (rowN)
ON CONFLICT (project_id, pole_number) DO UPDATE SET ...
```

### Key Improvements from Previous Attempts
1. **Used pg library** instead of @neondatabase/serverless
2. **Dynamic placeholder generation** for parameterized queries
3. **Batch size of 1000** for optimal performance
4. **Cleared existing data** before import to ensure fresh data
5. **Multi-value INSERT** statements instead of UNNEST

### Data Verification
- Initial poles in database: 1571
- After clearing and re-import: 4471
- All pole numbers are unique (no duplicates)
- Sample verified poles:
  - LAW.P.B353: (-26.38207620, 27.79685608)
  - LAW.P.A003: (-26.37840496, 27.80890143)
  - LAW.P.A004: (-26.37834830, 27.80927691)

### Performance Metrics
- Batch 1: 1000 poles @ 118/sec
- Batch 2: 2000 poles @ 106/sec  
- Batch 3: 3000 poles @ 101/sec
- Batch 4: 4000 poles @ 97/sec
- Batch 5: 4471 poles @ 95/sec

### Files Created/Modified
1. `/scripts/sow-import/run-import.cjs` - Working import script
2. `/scripts/sow-import/fast-batch-import.js` - Downloaded from GitHub
3. `/verify-import.cjs` - Database verification script
4. `/api/sow/poles.js` - Updated but reverted to working version

### Lessons Learned
1. The @neondatabase/serverless library has limitations with batch operations
2. The pg library with dynamic placeholders is more reliable for large batch inserts
3. Previous implementation (from GitHub) was superior and should be maintained
4. Always clear existing data when doing full re-imports to avoid confusion

### Next Steps
- Use this same approach for drops and fibre imports
- Consider implementing progress tracking in the UI
- Add error recovery for partial imports
- Document the working approach for future reference