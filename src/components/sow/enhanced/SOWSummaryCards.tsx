/**
 * SOW Summary Cards Component
 */

import { MapPin, Home, Cable } from 'lucide-react';

interface SOWSummaryCardsProps {
  polesCount: number;
  dropsCount: number;
  fibreCount: number;
}

export function SOWSummaryCards({ polesCount, dropsCount, fibreCount }: SOWSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <MapPin className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Poles</h3>
            <p className="text-2xl font-bold text-blue-600">{polesCount}</p>
            <p className="text-sm text-blue-700">Infrastructure poles</p>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <Home className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-green-900">Drops</h3>
            <p className="text-2xl font-bold text-green-600">{dropsCount}</p>
            <p className="text-sm text-green-700">Home connections</p>
          </div>
        </div>
      </div>
      
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center">
          <Cable className="h-8 w-8 text-purple-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-purple-900">Fibre</h3>
            <p className="text-2xl font-bold text-purple-600">{fibreCount}</p>
            <p className="text-sm text-purple-700">Cable segments</p>
          </div>
        </div>
      </div>
    </div>
  );
}