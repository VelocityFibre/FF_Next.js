/**
 * TrendIndicators Component - Performance trend visualization and indicators
 * Features: Trend lines, improvement indicators, historical performance
 * Following FibreFlow patterns with interactive charts
 */

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from '@/components/ui/DynamicChart';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar,
  ArrowUp,
  ArrowDown 
} from 'lucide-react';
import { TrendIndicatorsProps } from '../types';

// 🟢 WORKING: Custom tooltip for trend chart
const TrendTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.dataKey}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 🟢 WORKING: Trend direction indicator
const TrendDirectionIcon = ({ direction }: { direction: string; change: number }) => {
  const iconProps = { className: "w-4 h-4" };
  
  switch (direction) {
    case 'up':
      return <TrendingUp {...iconProps} className="w-4 h-4 text-green-600" />;
    case 'down':
      return <TrendingDown {...iconProps} className="w-4 h-4 text-red-600" />;
    default:
      return <Minus {...iconProps} className="w-4 h-4 text-gray-600" />;
  }
};

// 🟢 WORKING: Change indicator component
const ChangeIndicator = ({ value, showIcon = true }: { value: number; showIcon?: boolean }) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  const colorClass = isNeutral 
    ? 'text-gray-600' 
    : isPositive 
      ? 'text-green-600' 
      : 'text-red-600';
  
  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      {showIcon && !isNeutral && (
        isPositive ? (
          <ArrowUp className="w-3 h-3" />
        ) : (
          <ArrowDown className="w-3 h-3" />
        )
      )}
      <span className="text-sm font-medium">
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </span>
    </div>
  );
};

export function TrendIndicators({ 
  trends, 
  showDetails = true, 
  className = '' 
}: TrendIndicatorsProps) {
  // 🟢 WORKING: Calculate trend metrics
  const latestData = trends.data[trends.data.length - 1];
  const earliestData = trends.data[0];
  
  const scoreChange = latestData && earliestData 
    ? latestData.averageScore - earliestData.averageScore
    : 0;
  
  const contractorGrowth = latestData && earliestData
    ? ((latestData.contractorCount - earliestData.contractorCount) / earliestData.contractorCount) * 100
    : 0;

  // 🟢 WORKING: Empty state
  if (!trends.data.length) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">No trend data available</p>
            <p className="text-xs text-gray-400">Trends will appear once historical data is collected</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
          <p className="text-sm text-gray-600">{trends.timeRange}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <TrendDirectionIcon direction={trends.trendsDirection} change={trends.averageImprovement} />
              <ChangeIndicator value={trends.averageImprovement} />
            </div>
            <p className="text-xs text-gray-500">Overall Trend</p>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trends.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value: any) => {
                // Format date for display (e.g., "Jan 15")
                return new Date(value).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                });
              }}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<TrendTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="averageScore" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name="Average RAG Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Details */}
      {showDetails && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {latestData?.averageScore.toFixed(1) || '0.0'}
              </p>
              <p className="text-xs text-gray-600">Current Score</p>
              <ChangeIndicator value={scoreChange} />
            </div>
            
            <div className="text-center border-l border-r border-gray-300">
              <p className="text-2xl font-bold text-green-600">
                {latestData?.improvements || 0}
              </p>
              <p className="text-xs text-gray-600">Improvements</p>
              <div className="text-xs text-gray-500 mt-1">This period</div>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {latestData?.deteriorations || 0}
              </p>
              <p className="text-xs text-gray-600">Deteriorations</p>
              <div className="text-xs text-gray-500 mt-1">This period</div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Contractor Count</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{latestData?.contractorCount || 0}</span>
                  <ChangeIndicator value={contractorGrowth} showIcon={false} />
                </div>
              </div>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Improvement</span>
                <span className="font-medium">{trends.averageImprovement.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Recent Performance Indicators */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">
                  {trends.data.slice(-7).reduce((sum, point) => sum + (point.improvements || 0), 0)} improvements (7 days)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">
                  {trends.data.slice(-7).reduce((sum, point) => sum + (point.deteriorations || 0), 0)} deteriorations (7 days)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}