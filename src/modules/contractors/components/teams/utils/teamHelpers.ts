// Team management utility functions

export const getTeamTypeColor = (type: string) => {
  const colors = {
    installation: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-green-100 text-green-800',
    survey: 'bg-purple-100 text-purple-800',
    testing: 'bg-orange-100 text-orange-800',
    splicing: 'bg-red-100 text-red-800'
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const getSkillLevelColor = (level: string) => {
  const colors = {
    junior: 'bg-yellow-100 text-yellow-800',
    intermediate: 'bg-blue-100 text-blue-800',
    senior: 'bg-green-100 text-green-800',
    expert: 'bg-purple-100 text-purple-800'
  };
  return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};