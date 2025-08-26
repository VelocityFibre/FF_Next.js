/**
 * ComparativeAnalysisChart Component - Comparative performance analysis visualization
 * Features: Peer comparison, industry benchmarks, performance segments
 * Following FibreFlow patterns with interactive bar charts
 */

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from '@/components/ui/DynamicChart';
import { 
  TrendingUp, 
  Users, 
  Target,
  BarChart3
} from 'lucide-react';
import { ComparativeAnalysis } from '../types';

interface ComparativeAnalysisChartProps {
  comparativeData: ComparativeAnalysis;
  className?: string;
}

// 🟢 WORKING: Custom tooltip for comparative analysis
const ComparativeTooltip = ({ active, payload, label }: any) => {
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

export function ComparativeAnalysisChart({ 
  comparativeData, 
  className = '' 
}: ComparativeAnalysisChartProps) {
  
  // 🟢 WORKING: Prepare chart data for performance segments
  const segmentChartData = comparativeData.performanceSegments.map(segment => ({
    name: segment.segmentName,
    'Average Score': segment.averageScore,
    'Contractors': segment.contractorCount,
    'Improvement': segment.improvement
  }));

  // 🟢 WORKING: Calculate totals for peer comparison
  const totalPeerComparison = 
    comparativeData.peerComparison.abovePeers + 
    comparativeData.peerComparison.atPeerLevel + 
    comparativeData.peerComparison.belowPeers;

  const peerComparisonData = [
    {
      name: 'Above Peers',
      value: comparativeData.peerComparison.abovePeers,
      percentage: totalPeerComparison > 0 
        ? (comparativeData.peerComparison.abovePeers / totalPeerComparison * 100).toFixed(1)
        : '0.0'
    },
    {
      name: 'At Peer Level',
      value: comparativeData.peerComparison.atPeerLevel,
      percentage: totalPeerComparison > 0 
        ? (comparativeData.peerComparison.atPeerLevel / totalPeerComparison * 100).toFixed(1)
        : '0.0'
    },
    {
      name: 'Below Peers',
      value: comparativeData.peerComparison.belowPeers,
      percentage: totalPeerComparison > 0 
        ? (comparativeData.peerComparison.belowPeers / totalPeerComparison * 100).toFixed(1)
        : '0.0'
    }
  ];

  // 🟢 WORKING: Empty state
  if (!comparativeData.performanceSegments.length && totalPeerComparison === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparative Analysis</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">No comparative data available</p>
            <p className="text-xs text-gray-400">Analysis will appear once benchmark data is collected</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Comparative Analysis</h3>
      </div>

      {/* Industry Benchmark (if available) */}
      {comparativeData.industryBenchmark && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-blue-900">Industry Benchmark</h4>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {comparativeData.industryBenchmark.category}
            </span>
            <span className="text-xl font-bold text-blue-900">
              {comparativeData.industryBenchmark.averageScore}
            </span>
          </div>
        </div>
      )}

      {/* Peer Comparison */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-gray-900">Peer Comparison</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {peerComparisonData.map((item, index) => {
            const colorClasses = [
              'bg-green-100 text-green-800 border-green-200',
              'bg-blue-100 text-blue-800 border-blue-200',
              'bg-red-100 text-red-800 border-red-200'
            ];
            
            return (
              <div key={item.name} className="text-center">
                <div className={`
                  p-4 rounded-lg border-2
                  ${colorClasses[index]}
                `}>
                  <div className="text-2xl font-bold mb-1">{item.value}</div>
                  <div className="text-xs font-medium mb-2">{item.name}</div>
                  <div className="text-xs opacity-75">{item.percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Segments Chart */}
      {segmentChartData.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h4 className="font-medium text-gray-900">Performance by Segment</h4>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip content={<ComparativeTooltip />} />
                <Legend />
                <Bar 
                  dataKey="Average Score" 
                  fill="#3b82f6" 
                  name="Avg Score"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="Contractors" 
                  fill="#10b981" 
                  name="Contractors"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary Insights */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>
              {comparativeData.peerComparison.abovePeers} contractors performing above peer level
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>
              {comparativeData.peerComparison.belowPeers} contractors need improvement to reach peer level
            </span>
          </div>
          {comparativeData.performanceSegments.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>
                Best performing segment: {
                  comparativeData.performanceSegments.reduce((best, current) => 
                    current.averageScore > best.averageScore ? current : best
                  ).segmentName
                }
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}