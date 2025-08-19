import { useState } from 'react';
import { Wrench, CheckCircle, AlertCircle } from 'lucide-react';
import { fixStaffData } from '@/scripts/fixStaffData';

export function StaffDataFix() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleFix = async () => {
    setLoading(true);
    setLogs([]);
    setResult(null);

    // Capture console logs
    const originalLog = console.log;
    const logMessages: string[] = [];
    console.log = (message: string, ...args: any[]) => {
      originalLog(message, ...args);
      logMessages.push(message);
      setLogs([...logMessages]);
    };

    try {
      const fixResult = await fixStaffData();
      setResult(fixResult);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      console.log = originalLog;
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Fix Staff Data</h1>
          <p className="text-sm text-gray-600 mt-1">
            Add missing fields to imported staff members
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-medium text-blue-900 mb-2">What this will do:</h2>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              <li>Add missing <code className="bg-blue-100 px-1 rounded">level</code> field to all staff (required for project managers)</li>
              <li>Add missing <code className="bg-blue-100 px-1 rounded">status</code> field (defaults to "active")</li>
              <li>Add missing <code className="bg-blue-100 px-1 rounded">department</code> field (defaults to "operations")</li>
              <li>Add default values for project counts and ratings</li>
              <li>Ensure at least 5 staff members are eligible to be project managers</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Project Manager Requirements:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Status must be "active"</li>
                  <li>Level must be one of: "senior", "lead", "manager", or "executive"</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleFix}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Wrench className="w-4 h-4 mr-2" />
            {loading ? 'Fixing Staff Data...' : 'Fix Staff Data'}
          </button>

          {logs.length > 0 && (
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs">
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className={`rounded-lg p-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="text-sm">
                  {result.success ? (
                    <div className="text-green-800">
                      <p className="font-medium mb-1">Success!</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>Updated {result.updatedCount} staff members</li>
                        <li>Found {result.managerCount} eligible project managers</li>
                      </ul>
                      <p className="mt-2">You can now go back to creating a project and the project manager dropdown should be populated.</p>
                    </div>
                  ) : (
                    <div className="text-red-800">
                      <p className="font-medium">Error fixing staff data:</p>
                      <p>{result.error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}