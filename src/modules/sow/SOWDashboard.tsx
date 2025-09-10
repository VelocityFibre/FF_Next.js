'use client';

import { FileSpreadsheet, Upload, Download, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/router';

export function SOWDashboard() {
  const router = useRouter();

  const cards = [
    {
      title: 'Import SOW',
      description: 'Import SOW data from Excel',
      icon: Upload,
      color: 'bg-blue-500',
      onClick: () => router.push('/sow/import'),
    },
    {
      title: 'View All SOWs',
      description: 'Browse all SOW documents',
      icon: FileSpreadsheet,
      color: 'bg-green-500',
      onClick: () => router.push('/sow/list'),
    },
    {
      title: 'Export Data',
      description: 'Export SOW data to Excel',
      icon: Download,
      color: 'bg-purple-500',
      onClick: () => router.push('/sow/export'),
    },
    {
      title: 'Search & Filter',
      description: 'Find specific SOW items',
      icon: Search,
      color: 'bg-orange-500',
      onClick: () => router.push('/sow/search'),
    },
    {
      title: 'Approvals',
      description: 'SOWs pending approval',
      icon: CheckCircle,
      color: 'bg-indigo-500',
      onClick: () => router.push('/sow/approvals'),
    },
    {
      title: 'Validation',
      description: 'Check SOW data integrity',
      icon: AlertCircle,
      color: 'bg-red-500',
      onClick: () => router.push('/sow/validation'),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SOW Data Management</h1>
        <p className="text-gray-600 mt-1">Manage Scope of Work documents and data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={card.onClick}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start space-x-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent SOWs */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent SOW Documents</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <p className="text-gray-500 text-center">No recent SOW documents</p>
          </div>
        </div>
      </div>
    </div>
  );
}