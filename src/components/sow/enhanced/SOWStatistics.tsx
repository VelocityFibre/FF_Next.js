/**
 * SOW Statistics Component
 */

interface SOWStatisticsProps {
  poles: any[];
  drops: any[];
}

export function SOWStatistics({ poles, drops }: SOWStatisticsProps) {
  if (poles.length === 0) {
    return null;
  }

  const totalCapacity = poles.reduce((sum, p) => sum + (p.max_drops || 12), 0);
  const avgDropsPerPole = drops.length / poles.length;
  const coverage = (drops.length / (poles.length * 12)) * 100;

  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-3">Pole Statistics</h4>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-blue-600">Total Capacity:</span>
          <span className="ml-2 font-medium text-blue-900">
            {totalCapacity} drops
          </span>
        </div>
        <div>
          <span className="text-blue-600">Avg Drops/Pole:</span>
          <span className="ml-2 font-medium text-blue-900">
            {avgDropsPerPole.toFixed(1)}
          </span>
        </div>
        <div>
          <span className="text-blue-600">Coverage:</span>
          <span className="ml-2 font-medium text-blue-900">
            {coverage.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}