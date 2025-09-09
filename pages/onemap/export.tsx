import { AppLayout } from '@/components/layout/AppLayout';
import { Download, FileText, FileJson, FileSpreadsheet } from 'lucide-react';

export default function OneMapExportPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
          <p className="text-gray-600 mt-1">Export geographic data to various formats</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <FileJson className="h-8 w-8 text-blue-500 mb-3" />
            <h3 className="font-semibold mb-2">GeoJSON</h3>
            <p className="text-sm text-gray-600 mb-4">Standard geographic data format</p>
            <button className="flex items-center text-blue-600 hover:text-blue-700">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <FileText className="h-8 w-8 text-green-500 mb-3" />
            <h3 className="font-semibold mb-2">KML</h3>
            <p className="text-sm text-gray-600 mb-4">Google Earth compatible format</p>
            <button className="flex items-center text-blue-600 hover:text-blue-700">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <FileSpreadsheet className="h-8 w-8 text-purple-500 mb-3" />
            <h3 className="font-semibold mb-2">CSV/Excel</h3>
            <p className="text-sm text-gray-600 mb-4">Spreadsheet format with coordinates</p>
            <button className="flex items-center text-blue-600 hover:text-blue-700">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}