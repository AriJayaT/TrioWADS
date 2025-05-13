// Format number with commas for thousands
export const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Format percentage
  export const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };
  
  // Format time from minutes
  export const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };
  
  // Format date
  export const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };