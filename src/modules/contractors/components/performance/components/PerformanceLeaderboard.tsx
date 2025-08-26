/**
 * PerformanceLeaderboard Component - Top and bottom contractor performers
 * Features: Ranked lists, performance indicators, trend arrows, clickable rows
 * Following FibreFlow patterns with interactive leaderboards
 */

import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Award, 
  AlertTriangle,
  ArrowRight,
  Crown,
  Target
} from 'lucide-react';
import { PerformanceLeaderboardProps, ContractorPerformanceMetrics } from '../types';

// 🟢 WORKING: Performance category styling
const getPerformanceBadge = (category: string) => {
  const styles = {
    excellent: 'bg-green-100 text-green-800 border-green-200',
    good: 'bg-blue-100 text-blue-800 border-blue-200', 
    fair: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    poor: 'bg-red-100 text-red-800 border-red-200'
  };
  
  return styles[category as keyof typeof styles] || styles.fair;
};

// 🟢 WORKING: Risk level styling
const getRiskBadge = (risk: string) => {
  const styles = {
    low: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    high: 'bg-red-50 text-red-700 border-red-200'
  };
  
  return styles[risk as keyof typeof styles] || styles.medium;
};

// 🟢 WORKING: Trend direction icon
const TrendIcon = ({ direction }: { direction: string; change?: number }) => {
  const iconProps = { className: "w-4 h-4" };
  
  switch (direction) {
    case 'up':
      return <TrendingUp {...iconProps} className="w-4 h-4 text-green-600" />;
    case 'down':
      return <TrendingDown {...iconProps} className="w-4 h-4 text-red-600" />;
    default:
      return <Minus {...iconProps} className="w-4 h-4 text-gray-600" />;
  }
};

// 🟢 WORKING: Ranking position icon
const RankingIcon = ({ position }: { position: number }) => {
  if (position === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (position === 2) return <Trophy className="w-5 h-5 text-gray-500" />;
  if (position === 3) return <Award className="w-5 h-5 text-orange-500" />;
  return <Target className="w-5 h-5 text-blue-500" />;
};

// 🟢 WORKING: Individual leaderboard row
const LeaderboardRow = ({ 
  contractor, 
  position, 
  onClick, 
  showTrends = true,
  isBottomPerformer = false 
}: {
  contractor: ContractorPerformanceMetrics;
  position: number;
  onClick?: (contractorId: string) => void;
  showTrends?: boolean;
  isBottomPerformer?: boolean;
}) => {
  const handleClick = () => {
    onClick?.(contractor.contractorId);
  };

  return (
    <div 
      className={`
        flex items-center justify-between p-4 border border-gray-200 rounded-lg
        transition-all duration-200 cursor-pointer
        hover:shadow-md hover:border-blue-300 hover:bg-blue-50/50
        ${position <= 3 && !isBottomPerformer ? 'border-yellow-300 bg-yellow-50/30' : ''}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Ranking Position */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
            {position <= 3 && !isBottomPerformer ? (
              <RankingIcon position={position} />
            ) : (
              <span className="text-sm font-bold text-gray-700">#{position}</span>
            )}
          </div>
        </div>

        {/* Contractor Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate">
              {contractor.companyName}
            </h4>
            <div className={`
              px-2 py-1 text-xs font-medium rounded-full border
              ${getPerformanceBadge(contractor.performanceCategory)}
            `}>
              {contractor.performanceCategory.toUpperCase()}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{contractor.activeProjects} active projects</span>
            <span>{contractor.completedProjects} completed</span>
            <div className={`
              px-2 py-1 text-xs rounded-full border
              ${getRiskBadge(contractor.riskLevel)}
            `}>
              {contractor.riskLevel} risk
            </div>
          </div>
        </div>
      </div>

      {/* Performance Score */}
      <div className="flex items-center gap-4">
        {/* Trend Indicator */}
        {showTrends && (
          <div className="flex items-center gap-1">
            <TrendIcon 
              direction={contractor.scoreTrend.direction}
            />
            <span className={`
              text-sm font-medium
              ${contractor.scoreTrend.direction === 'up' ? 'text-green-600' : 
                contractor.scoreTrend.direction === 'down' ? 'text-red-600' : 
                'text-gray-600'}
            `}>
              {contractor.scoreTrend.change > 0 ? '+' : ''}
              {contractor.scoreTrend.change.toFixed(1)}
            </span>
          </div>
        )}

        {/* RAG Score */}
        <div className="text-right">
          <div className={`
            text-2xl font-bold
            ${contractor.currentRAGScore.overall >= 90 ? 'text-green-600' :
              contractor.currentRAGScore.overall >= 70 ? 'text-blue-600' :
              contractor.currentRAGScore.overall >= 50 ? 'text-yellow-600' :
              'text-red-600'}
          `}>
            {contractor.currentRAGScore.overall}
          </div>
          <div className="text-xs text-gray-500">RAG Score</div>
        </div>

        {/* Click Indicator */}
        <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export function PerformanceLeaderboard({
  topPerformers,
  bottomPerformers,
  limit = 10,
  onContractorClick,
  showTrends = true
}: PerformanceLeaderboardProps) {
  // 🟢 WORKING: Limit the displayed items
  const displayTopPerformers = topPerformers.slice(0, limit);
  const displayBottomPerformers = bottomPerformers.slice(0, Math.min(5, limit));

  // 🟢 WORKING: Empty state
  if (!topPerformers.length && !bottomPerformers.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
        <p className="text-gray-600">
          Performance leaderboards will appear once contractor data is available.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-900">Performance Leaderboard</h3>
      </div>

      {/* Top Performers */}
      {displayTopPerformers.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-gray-900">Top Performers</h4>
            <span className="text-sm text-gray-500">({displayTopPerformers.length})</span>
          </div>
          
          <div className="space-y-3">
            {displayTopPerformers.map((contractor, index) => (
              <LeaderboardRow
                key={contractor.contractorId}
                contractor={contractor}
                position={index + 1}
                onClick={onContractorClick || undefined}
                showTrends={showTrends}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom Performers */}
      {displayBottomPerformers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 pt-6 border-t border-gray-200">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h4 className="font-medium text-gray-900">Needs Attention</h4>
            <span className="text-sm text-gray-500">({displayBottomPerformers.length})</span>
          </div>
          
          <div className="space-y-3">
            {displayBottomPerformers.map((contractor, index) => (
              <LeaderboardRow
                key={contractor.contractorId}
                contractor={contractor}
                position={index + 1}
                onClick={onContractorClick || undefined}
                showTrends={showTrends}
                isBottomPerformer
              />
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-green-600">
            {topPerformers.filter(c => c.performanceCategory === 'excellent').length}
          </p>
          <p className="text-xs text-gray-600">Excellent</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">
            {topPerformers.filter(c => c.performanceCategory === 'good').length}
          </p>
          <p className="text-xs text-gray-600">Good</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-yellow-600">
            {topPerformers.filter(c => c.scoreTrend.direction === 'up').length}
          </p>
          <p className="text-xs text-gray-600">Improving</p>
        </div>
      </div>

      {/* View All Link */}
      {(topPerformers.length > limit || bottomPerformers.length > 5) && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Contractors →
          </button>
        </div>
      )}
    </div>
  );
}