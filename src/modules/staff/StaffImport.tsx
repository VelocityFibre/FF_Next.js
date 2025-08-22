import { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useCreateStaff } from '@/hooks/useStaff';
import { StaffFormData, StaffStatus, ContractType } from '@/types/staff.types';
import { StaffPosition, StaffDepartment } from '@/types/staff-hierarchy.types';

interface ImportedStaffData {
  'Employee ID': string;
  'Name': string;
  'Email': string;
  'Phone': string;
  'Position': string;
  'Department': string;
  'Reports to': string;
}

export function StaffImport() {
  const [importData, setImportData] = useState<ImportedStaffData[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<any[]>([]);
  const createStaff = useCreateStaff();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data: ImportedStaffData[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          data.push(row);
        }
      }
      
      setImportData(data);
      console.log('Imported data:', data);
    };
    reader.readAsText(file);
  };

  const mapPositionString = (position: string): string => {
    // Map CSV positions to our enum values
    const positionMap: Record<string, string> = {
      'Admin': StaffPosition.ADMIN,
      'ProjectManager': StaffPosition.PROJECT_MANAGER,
      'Senior Technician': StaffPosition.SENIOR_TECHNICIAN,
      'Technician': StaffPosition.TECHNICIAN,
      'CLO': StaffPosition.CLO,
      'SHEQ Manager': StaffPosition.SHEQ_MANAGER,
      'Head of Procurement': StaffPosition.HEAD_OF_PROCUREMENT,
      'Site Manager': StaffPosition.SITE_MANAGER,
      'Planner': StaffPosition.PLANNER,
      'Head of Planning': StaffPosition.HEAD_OF_PLANNING,
      'Head of Acquisitions': StaffPosition.HEAD_OF_ACQUISITIONS,
      'Head of Operations': StaffPosition.HEAD_OF_OPERATIONS,
      'Wayelave Officer': StaffPosition.WAYLEAVE_OFFICER,
      'Data Manager': StaffPosition.DATA_MANAGER,
      'Optical Project Manager': StaffPosition.OPTICAL_PROJECT_MANAGER,
      'Regional ProjectManager': StaffPosition.REGIONAL_PROJECT_MANAGER,
      'CCSO': StaffPosition.CCSO,
      'BDO': StaffPosition.BDO,
      'MD': StaffPosition.MD,
      'Head of Optical': StaffPosition.HEAD_OF_OPTICAL,
    };
    
    return positionMap[position] || StaffPosition.OTHER;
  };

  const mapDepartmentString = (department: string): string => {
    // Map CSV departments to our enum values
    const deptMap: Record<string, string> = {
      'Service Delivery': StaffDepartment.SERVICE_DELIVERY,
      'Operations': StaffDepartment.OPERATIONS,
      'Business Development': StaffDepartment.BUSINESS_DEVELOPMENT,
      'SHEQ': StaffDepartment.SHEQ,
      'Procurement': StaffDepartment.PROCUREMENT,
      'Planning': StaffDepartment.PLANNING,
      'Admin': StaffDepartment.ADMIN,
      'IT & Data': StaffDepartment.IT_DATA,
      'Commercial & Strategy': StaffDepartment.COMMERCIAL_STRATEGY,
    };
    
    return deptMap[department] || StaffDepartment.OPERATIONS;
  };

  const handleImport = async () => {
    setImporting(true);
    const results = [];

    for (const row of importData) {
      try {
        const staffData: StaffFormData = {
          employeeId: row['Employee ID'],
          name: row['Name'],
          email: row['Email'],
          phone: row['Phone'],
          position: mapPositionString(row['Position']),
          department: mapDepartmentString(row['Department']),
          status: StaffStatus.ACTIVE,
          // Find manager ID based on name - this would need to be resolved
          reportsTo: '', // Will be updated in a second pass
          
          // Default values
          skills: [],
          experienceYears: 0,
          address: '',
          city: 'Johannesburg',
          province: 'Gauteng',
          postalCode: '',
          startDate: new Date(),
          contractType: ContractType.PERMANENT,
          hourlyRate: 0,
          workingHours: '08:00 - 17:00',
          availableWeekends: false,
          availableNights: false,
          timeZone: 'Africa/Johannesburg',
          maxProjectCount: 5,
          notes: `Imported from CSV on ${new Date().toLocaleDateString()}`,
        };

        await createStaff.mutateAsync(staffData);
        results.push({ 
          employeeId: row['Employee ID'], 
          name: row['Name'], 
          status: 'success' 
        });
      } catch (error) {
        results.push({ 
          employeeId: row['Employee ID'], 
          name: row['Name'], 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    setImportResults(results);
    setImporting(false);
  };

  const downloadTemplate = () => {
    const template = 'Employee ID,Name,Email,Phone,Position,Department,Reports to\n' +
      'VF001,John Doe,john@example.com,+27 00 000 0000,Technician,Operations,\n';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff-import-template.csv';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Import Staff Members</h2>
        
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Import Instructions</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li>Download the CSV template</li>
            <li>Fill in staff member details</li>
            <li>Upload the completed CSV file</li>
            <li>Review the imported data</li>
            <li>Click "Import All" to add staff to the system</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={downloadTemplate}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </button>
          
          <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {importData.length > 0 && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import ${importData.length} Staff Members`}
            </button>
          )}
        </div>

        {/* Preview Table */}
        {importData.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Preview Import Data</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reports To</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {importData.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{row['Employee ID']}</td>
                      <td className="px-4 py-2 text-sm">{row['Name']}</td>
                      <td className="px-4 py-2 text-sm">{row['Email']}</td>
                      <td className="px-4 py-2 text-sm">{row['Position']}</td>
                      <td className="px-4 py-2 text-sm">{row['Department']}</td>
                      <td className="px-4 py-2 text-sm">{row['Reports to'] || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {importData.length > 10 && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing 10 of {importData.length} records
                </p>
              )}
            </div>
          </div>
        )}

        {/* Import Results */}
        {importResults.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Import Results</h3>
            <div className="space-y-2">
              {importResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center p-2 rounded ${
                    result.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  {result.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className="text-sm">
                    {result.employeeId} - {result.name}
                    {result.error && <span className="ml-2 text-red-600">({result.error})</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}