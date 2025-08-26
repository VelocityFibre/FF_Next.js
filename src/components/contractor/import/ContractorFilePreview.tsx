/**
 * ContractorFilePreview - Preview and validation of import data
 */

import type { ContractorImportData, ContractorImportOptions } from '@/types/contractor/import.types';

interface ContractorFilePreviewProps {
  data: ContractorImportData;
  options: ContractorImportOptions;
  onOptionsChange: (options: ContractorImportOptions) => void;
  onImport: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function ContractorFilePreview({
  data,
  options,
  onOptionsChange,
  onImport,
  onCancel,
  isProcessing = false
}: ContractorFilePreviewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 border rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Import Preview</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Records:</span>
            <span className="ml-2 font-medium">{data.contractors.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Valid Records:</span>
            <span className="ml-2 font-medium text-green-600">
              {data.contractors.filter(c => c.isValid).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Errors:</span>
            <span className="ml-2 font-medium text-red-600">
              {data.contractors.filter(c => !c.isValid).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Duplicates:</span>
            <span className="ml-2 font-medium text-yellow-600">
              {data.contractors.filter(c => c.isDuplicate).length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="importMode"
            checked={options.mode === 'skipDuplicates'}
            onChange={() => onOptionsChange({ ...options, mode: 'skipDuplicates' })}
            className="mr-2"
          />
          Skip duplicates
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="importMode"
            checked={options.mode === 'updateExisting'}
            onChange={() => onOptionsChange({ ...options, mode: 'updateExisting' })}
            className="mr-2"
          />
          Update existing
        </label>
      </div>

      <div className="max-h-64 overflow-y-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.contractors.slice(0, 10).map((contractor, index) => (
              <tr key={index}>
                <td className="px-3 py-2 text-xs">
                  {!contractor.isValid ? (
                    <span className="text-red-600">Error</span>
                  ) : contractor.isDuplicate ? (
                    <span className="text-yellow-600">Duplicate</span>
                  ) : (
                    <span className="text-green-600">Valid</span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs">{contractor.companyName}</td>
                <td className="px-3 py-2 text-xs">{contractor.contactPerson}</td>
                <td className="px-3 py-2 text-xs">{contractor.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          onClick={onImport}
          disabled={isProcessing || data.contractors.filter(c => c.isValid).length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Importing...' : `Import ${data.contractors.filter(c => c.isValid).length} contractors`}
        </button>
      </div>
    </div>
  );
}