'use client';

import { Users, UserCheck, CheckCircle } from 'lucide-react';
import { TeamPerformance } from '../types/analytics.types';

interface TeamPerformanceTableProps {
  teamPerformance: TeamPerformance[];
}

export function TeamPerformanceTable({ teamPerformance }: TeamPerformanceTableProps) {
  return (
    <div className="ff-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Team Performance</h3>
          <Users className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Team</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Productivity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tasks Completed</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Avg Time (hrs)</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Quality Score</th>
              </tr>
            </thead>
            <tbody>
              {teamPerformance.map((team, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{team.teamName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            team.productivity >= 90 ? 'bg-green-500' :
                            team.productivity >= 80 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${team.productivity}%` }}
                        />
                      </div>
                      <span className="text-sm">{team.productivity}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm">{team.tasksCompleted}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm">{team.avgCompletionTime}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-medium ${
                        team.qualityScore >= 95 ? 'text-green-600' :
                        team.qualityScore >= 90 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {team.qualityScore}%
                      </span>
                      {team.qualityScore >= 95 && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}