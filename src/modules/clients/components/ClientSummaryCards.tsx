import { Building2, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface ClientSummary {
  totalClients: number;
  activeClients: number;
  prospectClients?: number;
  totalProjects?: number;
  totalProjectValue: number;
  averageProjectValue?: number;
  clientsWithActiveProjects?: number;
  monthlyGrowthRate?: number;
  highPriorityClients?: number;
}

interface ClientSummaryCardsProps {
  summary: ClientSummary;
}

export function ClientSummaryCards({ summary }: ClientSummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Clients</p>
            <p className="text-2xl font-semibold text-gray-900">{summary.totalClients}</p>
          </div>
          <Building2 className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Active Clients</p>
            <p className="text-2xl font-semibold text-green-600">{summary.activeClients}</p>
          </div>
          <Users className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Projects</p>
            <p className="text-2xl font-semibold text-gray-900">{summary.totalProjects || 0}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-orange-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Value</p>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalProjectValue)}</p>
          </div>
          <DollarSign className="h-8 w-8 text-purple-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">High Priority</p>
            <p className="text-2xl font-semibold text-red-600">{summary.highPriorityClients || 0}</p>
          </div>
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
      </div>
    </div>
  );
}