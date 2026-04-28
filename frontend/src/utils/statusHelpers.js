export const getStatusColor = (status) => {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case 'open':
      return 'text-primary';
    case 'resolved':
      return 'text-success'; 
    case 'blocked':
      return 'text-danger'; 
  }
};

export const getPriorityColor = (priority) => {
  const p = priority?.toLowerCase();
  if (p === 'high') return 'bg-danger';
  if (p === 'medium') return 'bg-warning text-dark';
  return 'bg-info text-dark'; // Low or default
};