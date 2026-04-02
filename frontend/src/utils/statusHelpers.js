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