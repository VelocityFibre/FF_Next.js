'use client';

import { BarChart3, RefreshCw } from 'lucide-react';
import { DailyProgress } from '../types/analytics.types';

interface DailyProgressChartProps {
  dailyProgress: DailyProgress[];
  isLoading: boolean;
}

export function DailyProgressChart({ dailyProgress, isLoading }: DailyProgressChartProps) {
  return (
    <div className="ff-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Daily Progress</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {dailyProgress.map((day, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{day.date}</span>
                  <span className="text-sm text-gray-600">
                    {day.polesInstalled} poles, {day.dropsCompleted} drops
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(day.polesInstalled / 70) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}