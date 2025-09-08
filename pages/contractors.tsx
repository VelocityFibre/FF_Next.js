import { AppLayout } from '../src/components/layout/AppLayout';

export default function Contractors() {
  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Contractors</h1>
          <p className="text-gray-600 mt-2">Manage contractor relationships and performance</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏗️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Contractors Management</h2>
            <p className="text-gray-600 mb-6">
              Updated contractors module now uses Neon SQL instead of Drizzle ORM
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Contractor Directory</h3>
                <p className="text-sm text-gray-600 mt-1">Manage contractor profiles with direct SQL queries</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Performance Analytics</h3>
                <p className="text-sm text-gray-600 mt-1">Real-time analytics using Neon serverless client</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Document Management</h3>
                <p className="text-sm text-gray-600 mt-1">Efficient document handling with SQL operations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}