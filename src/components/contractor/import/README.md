# Contractor Import System

A comprehensive contractor import system for FibreFlow React application that supports CSV and Excel file formats with advanced validation, duplicate detection, and error handling.

## Features

✅ **File Format Support**
- CSV files (.csv)
- Excel files (.xlsx, .xls)
- Maximum file size: 50MB
- UTF-8 encoding support

✅ **Import Capabilities**
- Batch import with validation
- Duplicate detection by email/registration number
- Flexible header mapping
- Progress tracking and detailed error reporting
- Preview before import functionality

✅ **Data Validation**
- Required field validation (Company Name, Contact Person, Email, Registration Number)
- Email format validation
- Phone number format validation (SA and international)
- Business type validation
- Numeric field validation
- Field length validation

✅ **User Experience**
- Drag-and-drop file upload
- Real-time validation feedback
- Detailed error messages with row numbers
- Import progress indication
- Success/failure statistics

## Usage

### Basic Import

```tsx
import { ContractorImport } from '@/components/contractor/ContractorImport';

function MyPage() {
  const handleImportComplete = () => {
    console.log('Import completed successfully!');
    // Refresh contractor list or navigate
  };

  return (
    <ContractorImport onComplete={handleImportComplete} />
  );
}
```

### Using the Import Service Directly

```typescript
import { contractorImportService } from '@/services/contractor/import/contractorImportService';

// Import from file
const file = new File([csvContent], 'contractors.csv', { type: 'text/csv' });
const result = await contractorImportService.importFromFile(file, true);

// Download template
const template = contractorImportService.getImportTemplate();

// Export contractors
const contractors = await contractorService.getAll();
const blob = contractorImportService.exportToExcel(contractors);
```

## File Format Requirements

### Required Fields

| Field Name | Description | Example |
|------------|-------------|---------|
| Company Name | Full legal business name | "ABC Construction Pty Ltd" |
| Contact Person | Primary contact representative | "John Smith" |
| Email | Business email address | "john@abc.co.za" |
| Registration Number | Company registration number | "2021/123456/07" |

### Optional Fields

| Field Name | Description | Example |
|------------|-------------|---------|
| Phone | Primary phone number | "011-123-4567" |
| Alternate Phone | Secondary phone number | "082-555-1234" |
| Business Type | Type of business entity | "pty_ltd", "cc", "sole_proprietor", "partnership" |
| Industry Category | Industry sector | "Construction", "Engineering" |
| Specializations | Areas of expertise | "Fiber Installation, Electrical Work" |
| Website | Company website | "www.abc.co.za" |
| Physical Address | Street address | "123 Main Road, Sandton" |
| City | City name | "Johannesburg" |
| Province | Province/State | "Gauteng" |
| Postal Code | Postal/ZIP code | "2196" |
| Country | Country name | "South Africa" |
| Annual Turnover | Annual revenue | "5000000" |
| Years in Business | Business experience | "15" |
| Employee Count | Number of employees | "25" |
| License Number | Professional license | "ELEC-2021-001" |
| Insurance Details | Insurance information | "Public Liability: R2M" |
| Certifications | Professional certifications | "Safety Certificate, Electrical Certificate" |
| Notes | Additional notes | "Reliable contractor with excellent track record" |
| Tags | Category tags | "fiber,construction,electrical" |

### Sample CSV Format

```csv
Company Name,Contact Person,Email,Phone,Registration Number,Business Type,Industry Category
ABC Construction Pty Ltd,John Smith,john@abc.co.za,011-123-4567,2021/123456/07,pty_ltd,Construction
XYZ Engineering CC,Jane Doe,jane@xyz.co.za,082-555-1234,CC/2020/654321,cc,Engineering
```

## Import Modes

### Update Existing (Default)
- Updates existing contractors if duplicates found
- Creates new entries for unique contractors
- Recommended for data updates

### Skip Duplicates
- Skips duplicate contractors
- Reports duplicates for review
- Creates only new unique entries
- Recommended for initial imports

## Error Handling

The system provides detailed error reporting:

### Validation Errors
- Missing required fields
- Invalid email formats
- Invalid phone numbers
- Invalid business types
- Field length violations

### Import Errors
- File parsing errors
- Database connection issues
- Duplicate detection conflicts
- System-level failures

### Error Format
```typescript
{
  row: 5,
  field: 'email',
  message: 'Invalid email format'
}
```

## API Reference

### ContractorImportService

#### Methods

```typescript
// Import from file
importFromFile(file: File, overwriteExisting: boolean): Promise<ContractorImportResult>

// Import from CSV
importFromCSV(file: File, overwriteExisting: boolean): Promise<ContractorImportResult>

// Import from Excel
importFromExcel(file: File, overwriteExisting: boolean): Promise<ContractorImportResult>

// Export to Excel
exportToExcel(contractors: Contractor[]): Blob

// Get template
getImportTemplate(): string

// Validate file
validateFile(file: File): { valid: boolean; error?: string }
```

#### Import Result

```typescript
interface ContractorImportResult {
  success: boolean;
  total: number;
  imported: number;
  failed: number;
  duplicates?: number;
  errors: ContractorImportError[];
  contractors: ContractorImportRow[];
  duplicateContractors?: ContractorImportRow[];
}
```

## Testing

The system includes comprehensive tests:

- **Unit Tests**: Individual component and service testing
- **Integration Tests**: End-to-end workflow testing
- **Validation Tests**: Data validation and normalization
- **UI Tests**: Component interaction and error handling

Run tests with:
```bash
npm test -- contractors/import
```

## Performance

The system is optimized for large datasets:

- **File Size**: Up to 50MB files supported
- **Records**: Tested with 1000+ contractor records
- **Processing**: Batch operations for efficient import
- **Memory**: Streaming processing for large files

## Security

Security measures implemented:

- **File Type Validation**: Only CSV/Excel files accepted
- **Size Limits**: Maximum 50MB file size
- **Input Sanitization**: All data sanitized before processing
- **Error Handling**: No sensitive data exposed in errors

## Browser Support

Compatible with modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Common Issues

**File Upload Fails**
- Check file format (CSV/Excel only)
- Verify file size (max 50MB)
- Ensure file is not corrupted

**Import Errors**
- Verify required fields are present
- Check email format validity
- Ensure registration numbers are unique

**Performance Issues**
- Break large files into smaller chunks
- Use CSV format for better performance
- Ensure stable internet connection

### Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.