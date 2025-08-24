import { TrendingUp, AlertCircle, Activity } from 'lucide-react';

export function KeyInsights() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
      <div className="ff-card bg-green-50 border-green-200">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Top Performance</span>
          </div>
          <p className="text-sm text-green-700">
            Wellington Connect project is 92% complete and ahead of schedule by 5 days.
          </p>
        </div>
      </div>

      <div className="ff-card bg-yellow-50 border-yellow-200">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Attention Needed</span>
          </div>
          <p className="text-sm text-yellow-700">
            Paarl Expansion is delayed by 3 days due to equipment shortages.
          </p>
        </div>
      </div>

      <div className="ff-card bg-blue-50 border-blue-200">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">Weekly Average</span>
          </div>
          <p className="text-sm text-blue-700">
            Teams are averaging 46 poles and 119 drops per day this week.
          </p>
        </div>
      </div>
    </div>
  );
}