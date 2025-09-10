'use client';

import { Map, Grid3x3, Download, Upload, Layers, Search } from 'lucide-react';
import { useRouter } from 'next/router';

export function OneMapDashboard() {
  const router = useRouter();

  const cards = [
    {
      title: 'Map View',
      description: 'Interactive map visualization',
      icon: Map,
      color: 'bg-blue-500',
      onClick: () => router.push('/onemap/map'),
    },
    {
      title: 'Data Grid',
      description: 'Tabular data view',
      icon: Grid3x3,
      color: 'bg-green-500',
      onClick: () => router.push('/onemap/grid'),
    },
    {
      title: 'Layers',
      description: 'Manage map layers',
      icon: Layers,
      color: 'bg-purple-500',
      onClick: () => router.push('/onemap/layers'),
    },
    {
      title: 'Import Data',
      description: 'Import geographic data',
      icon: Upload,
      color: 'bg-orange-500',
      onClick: () => router.push('/onemap/import'),
    },
    {
      title: 'Export Data',
      description: 'Export to various formats',
      icon: Download,
      color: 'bg-indigo-500',
      onClick: () => router.push('/onemap/export'),
    },
    {
      title: 'Search & Filter',
      description: 'Advanced search capabilities',
      icon: Search,
      color: 'bg-pink-500',
      onClick: () => router.push('/onemap/search'),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">OneMap Data Grid</h1>
        <p className="text-gray-600 mt-1">Geographic data visualization and management</p>
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

      {/* Data Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Points</h3>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Active Layers</h3>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Last Updated</h3>
          <p className="text-2xl font-bold text-gray-900">-</p>
        </div>
      </div>
    </div>
  );
}