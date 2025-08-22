export const getMeetingTypeColor = (type: string): string => {
  switch (type) {
    case 'team': return 'bg-blue-100 text-blue-800';
    case 'client': return 'bg-green-100 text-green-800';
    case 'board': return 'bg-purple-100 text-purple-800';
    case 'standup': return 'bg-yellow-100 text-yellow-800';
    case 'review': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};