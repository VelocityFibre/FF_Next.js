import { AppLayout } from '@/components/layout/AppLayout';
import { Map } from 'lucide-react';

export default function OneMapMapPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Map View</h1>
          <p className="text-gray-600 mt-1">Interactive geographic visualization</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-[600px]">
          <div className="flex items-center justify-center h-full bg-gray-50 rounded">
            <div className="text-center">
              <Map className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Map visualization will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}