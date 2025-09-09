import { AppLayout } from '@/components/layout/AppLayout';
import { Layers } from 'lucide-react';

export default function OneMapLayersPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Map Layers</h1>
          <p className="text-gray-600 mt-1">Manage and configure map layers</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <Layers className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">Base Map</p>
                  <p className="text-sm text-gray-500">Default map layer</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <Layers className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">Fiber Routes</p>
                  <p className="text-sm text-gray-500">Fiber cable paths</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <Layers className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">Poles</p>
                  <p className="text-sm text-gray-500">Pole locations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}