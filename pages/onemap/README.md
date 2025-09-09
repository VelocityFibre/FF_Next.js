# OneMap Module - Geographic Data Import System

## Goal
Import Excel files received from the 1Map application into our Neon database and display the geographic data in our FibreFlow system.

## Workflow
1. **Receive Excel File**: Get geographic data export from 1Map application
2. **Upload File**: User browses and selects the Excel file from their computer
3. **Parse Data**: Extract geographic data from Excel (poles, cables, splices, drops)
4. **Store in Database**: Save parsed data to Neon PostgreSQL database
5. **Display Data**: Show imported data in grid view, map view, and other visualizations

## Data Types from 1Map
- Pole locations with coordinates
- Fiber cable routes
- Splice points
- Drop locations
- Geographic metadata

## Technical Implementation
- File upload with `<input type="file">` for Excel files (.xlsx, .xls, .csv)
- Parse Excel using xlsx library or similar
- API endpoint to process and store data in Neon DB
- Display imported data in various views (map, grid, etc.)

## Database Schema Required
- `onemap_poles` - Store pole locations
- `onemap_cables` - Store cable routes
- `onemap_splices` - Store splice points
- `onemap_drops` - Store drop locations
- `onemap_imports` - Track import history

## Files
- `/pages/onemap/import.tsx` - File upload interface
- `/pages/api/onemap/upload.ts` - API endpoint for file processing
- `/lib/onemap/parser.ts` - Excel parsing logic
- `/lib/onemap/database.ts` - Database operations