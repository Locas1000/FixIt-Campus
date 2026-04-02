export const getStatusColor = (status) => {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case 'open':
      return 'text-primary'; // Blue
    case 'resolved':
      return 'text-success'; // Green
    case 'blocked':
      return 'text-danger';  // Red
  }
};