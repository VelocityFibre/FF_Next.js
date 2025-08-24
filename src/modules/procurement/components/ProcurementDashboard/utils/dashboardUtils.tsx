/**
 * Procurement Dashboard Utilities
 * Helper functions for dashboard display logic
 */

import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-blue-500" />;
  }
};

export const getColorClasses = (color: string) => {
  const colorMap = {
    blue: 'bg-blue-500 border-blue-500 text-blue-600',
    purple: 'bg-purple-500 border-purple-500 text-purple-600',
    orange: 'bg-orange-500 border-orange-500 text-orange-600',
    red: 'bg-red-500 border-red-500 text-red-600',
    green: 'bg-green-500 border-green-500 text-green-600',
    indigo: 'bg-indigo-500 border-indigo-500 text-indigo-600'
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.blue;
};