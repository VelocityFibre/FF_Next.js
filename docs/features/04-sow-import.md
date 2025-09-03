# Section 3.4: SOW Import Module

## Overview

The Statement of Work (SOW) Import module enables **bulk data import from Excel/CSV files** into the FibreFlow system. This module is crucial for migrating existing project data and handling large-scale data imports for poles, drops, and fiber infrastructure.

### Module Scope
- **Excel/CSV Processing**: Parse and validate spreadsheet data
- **Data Mapping**: Map columns to database fields
- **Validation Engine**: Comprehensive data validation
- **Import Workflows**: Multi-step import process with preview
- **Error Handling**: Detailed error reporting and recovery

### Key Features
- Drag-and-drop file upload
- Automatic column detection
- Data preview before import
- Batch processing with progress tracking
- Error log with row-level details
- Rollback capability for failed imports

## Database Schema

### SOW Tables (`src/lib/neon/schema/core.schema.ts`)

```typescript
// Statement of Work main table
export const sow = pgTable('sow', {
  id: uuid('id').primaryKey().defaultRandom(),
  sowNumber: varchar('sow_number', { length: 100 }).unique(),
  projectId: uuid('project_id').references(() => projects.id),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  status: varchar('status', { length: 50 }), // draft, active, completed
  
  // Import metadata
  importedFrom: varchar('imported_from', { length: 255 }), // filename
  importedAt: timestamp('imported_at'),
  importedBy: uuid('imported_by'),
  
  // Data summary
  totalPoles: integer('total_poles'),
  totalDrops: integer('total_drops'),
  totalFiberLength: decimal('total_fiber_length'),
  
  // JSON fields for complex data
  scope: json('scope'),
  deliverables: json('deliverables'),
  timeline: json('timeline'),
  milestones: json('milestones'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Import job tracking
export const sowImportJobs = pgTable('sow_import_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: varchar('job_id', { length: 100 }).unique(),
  fileName: varchar('file_name', { length: 255 }),
  fileSize: integer('file_size'),
  status: varchar('status', { length: 50 }), // pending, processing, completed, failed
  
  // Progress tracking
  totalRows: integer('total_rows'),
  processedRows: integer('processed_rows'),
  successRows: integer('success_rows'),
  errorRows: integer('error_rows'),
  
  // Error details
  errors: json('errors'), // Array of error objects
  
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdBy: uuid('created_by'),
});
```

### Infrastructure Tables

```typescript
// Poles data from SOW import
export const poles = pgTable('poles', {
  id: uuid('id').primaryKey().defaultRandom(),
  sowId: uuid('sow_id').references(() => sow.id),
  poleNumber: varchar('pole_number', { length: 50 }).unique(),
  
  // Location data
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  address: text('address'),
  
  // Technical specifications
  type: varchar('type', { length: 50 }), // wooden, metal, concrete
  height: decimal('height'), // meters
  material: varchar('material', { length: 50 }),
  installationDate: timestamp('installation_date'),
  
  // Status tracking
  status: varchar('status', { length: 50 }), // planned, installed, active
  
  // Import tracking
  importJobId: uuid('import_job_id'),
  importRowNumber: integer('import_row_number'),
});

// Drops data from SOW import
export const drops = pgTable('drops', {
  id: uuid('id').primaryKey().defaultRandom(),
  sowId: uuid('sow_id').references(() => sow.id),
  poleId: uuid('pole_id').references(() => poles.id),
  
  dropNumber: varchar('drop_number', { length: 50 }).unique(),
  customerName: varchar('customer_name', { length: 255 }),
  customerAddress: text('customer_address'),
  
  // Technical details
  cableType: varchar('cable_type', { length: 50 }),
  cableLength: decimal('cable_length'), // meters
  connectorType: varchar('connector_type', { length: 50 }),
  
  // Status
  status: varchar('status', { length: 50 }), // planned, installed, active
  installationDate: timestamp('installation_date'),
  
  // Import tracking
  importJobId: uuid('import_job_id'),
  importRowNumber: integer('import_row_number'),
});
```

## API Endpoints

### SOW Import APIs (`api/sow/`)

```javascript
// POST /api/sow/import-status - Check import job status
export async function getImportStatus(jobId) {
  const job = await sql`
    SELECT * FROM sow_import_jobs 
    WHERE job_id = ${jobId}
  `;
  
  if (job.status === 'processing') {
    // Return progress
    return {
      status: 'processing',
      progress: (job.processedRows / job.totalRows) * 100,
      processedRows: job.processedRows,
      totalRows: job.totalRows,
    };
  }
  
  return job;
}

// POST /api/sow/initialize - Initialize import job
export async function initializeImport(data) {
  const [job] = await sql`
    INSERT INTO sow_import_jobs (
      job_id, file_name, file_size, 
      status, total_rows, created_by
    ) VALUES (
      ${data.jobId}, ${data.fileName}, ${data.fileSize},
      'pending', ${data.totalRows}, ${data.userId}
    )
    RETURNING *
  `;
  
  return job;
}

// POST /api/sow/poles - Import poles data
export async function importPoles(data) {
  const { jobId, poles } = data;
  let successCount = 0;
  let errors = [];
  
  await sql.transaction(async (tx) => {
    for (const [index, pole] of poles.entries()) {
      try {
        // Validate pole data
        validatePoleData(pole);
        
        // Insert pole
        await tx`
          INSERT INTO poles (
            sow_id, pole_number, latitude, longitude,
            type, height, status, import_job_id, import_row_number
          ) VALUES (
            ${pole.sowId}, ${pole.poleNumber}, 
            ${pole.latitude}, ${pole.longitude},
            ${pole.type}, ${pole.height}, 
            'planned', ${jobId}, ${index}
          )
        `;
        successCount++;
        
      } catch (error) {
        errors.push({
          row: index + 2, // Excel row number (1-indexed + header)
          field: error.field,
          message: error.message,
          value: pole[error.field],
        });
      }
    }
    
    // Update job status
    await tx`
      UPDATE sow_import_jobs 
      SET 
        processed_rows = ${poles.length},
        success_rows = ${successCount},
        error_rows = ${errors.length},
        errors = ${JSON.stringify(errors)},
        status = ${errors.length > 0 ? 'completed_with_errors' : 'completed'},
        completed_at = NOW()
      WHERE job_id = ${jobId}
    `;
  });
  
  return { successCount, errors };
}

// POST /api/sow/drops - Import drops data
export async function importDrops(data) {
  // Similar to importPoles but for drops
  const { jobId, drops } = data;
  
  // Match drops to poles by pole number
  for (const drop of drops) {
    const pole = await sql`
      SELECT id FROM poles 
      WHERE pole_number = ${drop.poleNumber}
      LIMIT 1
    `;
    
    if (pole) {
      drop.poleId = pole.id;
    }
  }
  
  // Bulk insert with validation
  return await bulkInsertDrops(drops, jobId);
}
```

## React Components

### SOW Import Page (`src/pages/sow/`)

#### Main Import Interface
```typescript
function SOWImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importStep, setImportStep] = useState<'upload' | 'map' | 'preview' | 'import'>('upload');
  const [importJob, setImportJob] = useState(null);
  
  return (
    <div className="sow-import">
      <ImportSteps currentStep={importStep} />
      
      {importStep === 'upload' && (
        <FileUploadStep 
          onFileSelect={setFile}
          onNext={() => setImportStep('map')}
        />
      )}
      
      {importStep === 'map' && (
        <ColumnMappingStep
          file={file}
          onMappingComplete={(mapping) => {
            setImportStep('preview');
          }}
        />
      )}
      
      {importStep === 'preview' && (
        <DataPreviewStep
          file={file}
          onConfirm={() => setImportStep('import')}
        />
      )}
      
      {importStep === 'import' && (
        <ImportProgressStep
          jobId={importJob?.id}
          onComplete={() => {
            toast.success('Import completed');
            navigate('/app/sow');
          }}
        />
      )}
    </div>
  );
}
```

#### File Upload Component
```typescript
function FileUploadStep({ onFileSelect, onNext }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      
      // Validate file
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      
      onFileSelect(file);
      onNext();
    },
  });
  
  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the file here...</p>
      ) : (
        <p>Drag and drop a CSV/Excel file, or click to select</p>
      )}
    </div>
  );
}
```

#### Column Mapping Component
```typescript
function ColumnMappingStep({ file, onMappingComplete }) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Parse file headers
    parseFileHeaders(file).then(setHeaders);
  }, [file]);
  
  const requiredFields = [
    { key: 'poleNumber', label: 'Pole Number', required: true },
    { key: 'latitude', label: 'Latitude', required: true },
    { key: 'longitude', label: 'Longitude', required: true },
    { key: 'type', label: 'Pole Type', required: false },
    { key: 'height', label: 'Height (m)', required: false },
  ];
  
  return (
    <div className="column-mapping">
      <h3>Map Excel Columns to Database Fields</h3>
      
      {requiredFields.map(field => (
        <div key={field.key} className="mapping-row">
          <label>
            {field.label} {field.required && '*'}
          </label>
          <select 
            value={mapping[field.key] || ''}
            onChange={(e) => setMapping({
              ...mapping,
              [field.key]: e.target.value,
            })}
          >
            <option value="">-- Select Column --</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>
      ))}
      
      <button 
        onClick={() => onMappingComplete(mapping)}
        disabled={!validateMapping(mapping)}
      >
        Continue to Preview
      </button>
    </div>
  );
}
```

## Import Processing

### Excel/CSV Parser

```typescript
// src/services/sow/excelParser.ts
export async function parseExcelFile(file: File) {
  const workbook = await readExcelFile(file);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  return {
    headers: Object.keys(data[0] || {}),
    rows: data,
    totalRows: data.length,
  };
}

export async function parseCSVFile(file: File) {
  const text = await file.text();
  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });
  
  return {
    headers: parsed.meta.fields,
    rows: parsed.data,
    totalRows: parsed.data.length,
  };
}
```

### Data Validation

```typescript
// src/services/sow/validation.ts
export function validatePoleData(pole: any) {
  const errors = [];
  
  // Required fields
  if (!pole.poleNumber) {
    errors.push({ field: 'poleNumber', message: 'Pole number is required' });
  }
  
  // Validate coordinates
  if (pole.latitude) {
    const lat = parseFloat(pole.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push({ field: 'latitude', message: 'Invalid latitude' });
    }
  }
  
  if (pole.longitude) {
    const lng = parseFloat(pole.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push({ field: 'longitude', message: 'Invalid longitude' });
    }
  }
  
  // Validate numeric fields
  if (pole.height && isNaN(parseFloat(pole.height))) {
    errors.push({ field: 'height', message: 'Height must be numeric' });
  }
  
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
  
  return true;
}
```

### Batch Processing

```typescript
// Process large files in batches
export async function processBatchImport(
  rows: any[], 
  batchSize: number = 100,
  processor: (batch: any[]) => Promise<void>
) {
  const totalBatches = Math.ceil(rows.length / batchSize);
  
  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min((i + 1) * batchSize, rows.length);
    const batch = rows.slice(start, end);
    
    await processor(batch);
    
    // Update progress
    const progress = ((i + 1) / totalBatches) * 100;
    await updateImportProgress(jobId, progress);
  }
}
```

## Error Handling

### Import Error Recovery

```typescript
export async function handleImportErrors(jobId: string, errors: ImportError[]) {
  // Group errors by type
  const errorSummary = errors.reduce((acc, error) => {
    const key = error.field || 'general';
    if (!acc[key]) acc[key] = [];
    acc[key].push(error);
    return acc;
  }, {});
  
  // Generate error report
  const report = {
    jobId,
    totalErrors: errors.length,
    errorsByField: errorSummary,
    recommendations: generateRecommendations(errorSummary),
  };
  
  // Save error report
  await saveErrorReport(jobId, report);
  
  // Allow partial import or rollback
  if (errors.length / totalRows > 0.5) {
    // More than 50% errors - recommend rollback
    return { action: 'rollback', reason: 'Too many errors' };
  }
  
  return { action: 'partial', successRows: totalRows - errors.length };
}
```

## Import Status Tracking

### Real-time Progress Updates

```typescript
// useImportProgress hook
export function useImportProgress(jobId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['import-progress', jobId],
    queryFn: () => getImportStatus(jobId),
    refetchInterval: (data) => {
      // Poll while processing
      return data?.status === 'processing' ? 1000 : false;
    },
  });
  
  return {
    progress: data?.progress || 0,
    status: data?.status,
    errors: data?.errors || [],
    isComplete: data?.status === 'completed',
  };
}
```

## Next.js Migration Impact

### Server-side Processing
```typescript
// app/api/sow/import/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Process file on server
  const data = await parseFile(file);
  
  // Validate and import directly
  const result = await db.transaction(async (tx) => {
    // Server-side processing - no client overhead
    return await processImport(tx, data);
  });
  
  return NextResponse.json(result);
}
```

## Best Practices

### Do's
- ✅ Validate data before import
- ✅ Provide clear error messages
- ✅ Allow preview before import
- ✅ Support rollback for failed imports
- ✅ Track import history

### Don'ts
- ❌ Don't import without validation
- ❌ Don't block UI during import
- ❌ Don't lose original data
- ❌ Don't allow duplicate imports

## Technical Debt

### Current Issues
1. Large file handling needs optimization
2. Real-time progress updates need WebSocket
3. Error recovery could be more sophisticated
4. Missing data transformation templates

### Future Enhancements
1. Template-based import mappings
2. AI-assisted column mapping
3. Incremental import support
4. Export functionality
5. Data quality scoring

## Summary

The SOW Import module provides robust Excel/CSV data import capabilities with comprehensive validation, error handling, and progress tracking. It ensures data integrity while importing real infrastructure data into the Neon database, forming the foundation for project tracking and management.