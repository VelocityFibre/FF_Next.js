/**
 * RAGScoreChart Component - Visual RAG score distribution using Recharts
 * Features: Interactive pie chart, risk distribution, performance breakdown
 * Following FibreFlow patterns with dynamic chart integration
 */

import { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from '@/components/ui/DynamicChart';
import { RAGChartData, RAGScoreChartProps } from '../types';

// 🟢 WORKING: Custom tooltip for RAG chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          Contractors: <span className="font-medium">{data.value}</span>
        </p>
        <p className="text-sm text-gray-600">
          Percentage: <span className="font-medium">{data.percentage.toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

// 🟢 WORKING: Custom legend with enhanced styling
const CustomLegend = (props: any) => {
  const { payload } = props;
  if (!payload) return null;

  return (
    <ul className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <li key={index} className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-700">{entry.value}</span>
          <span className="text-xs text-gray-500">
            ({entry.payload.value})
          </span>
        </li>
      ))}
    </ul>
  );
};

export function RAGScoreChart({ 
  data, 
  title, 
  showLegend = true, 
  height = 400,
  onSegmentClick 
}: RAGScoreChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // 🟢 WORKING: Calculate percentages for chart data
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const chartData: RAGChartData[] = data.map(item => ({
    ...item,
    percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0
  }));

  // 🟢 WORKING: Handle segment click
  const handleSegmentClick = (data: any, index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
    onSegmentClick?.(data);
  };

  // 🟢 WORKING: Handle mouse interactions
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // 🟢 WORKING: Empty state
  if (!chartData.length || totalValue === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm">No RAG score data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-500">
          Total: {totalValue} contractors
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }: { name: string; percentage: number }) => 
                percentage > 5 ? `${name} ${percentage.toFixed(0)}%` : ''
              }
              outerRadius={height * 0.25}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              onClick={handleSegmentClick}
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={activeIndex === index ? '#374151' : 'none'}
                  strokeWidth={activeIndex === index ? 2 : 0}
                  style={{
                    filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend content={<CustomLegend />} />}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {chartData.find(d => d.name.includes('Low'))?.value || 0}
          </p>
          <p className="text-xs text-gray-600">Low Risk</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">
            {chartData.find(d => d.name.includes('High'))?.value || 0}
          </p>
          <p className="text-xs text-gray-600">High Risk</p>
        </div>
      </div>
    </div>
  );
}