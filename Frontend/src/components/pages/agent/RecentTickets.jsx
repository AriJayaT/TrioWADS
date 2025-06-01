  <div className="flex items-center space-x-2">
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      ticket.status === 'open' ? 'bg-green-100 text-green-800' :
      ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {ticket.status}
    </span>
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      getColorByPriority(ticket.priority)
    }`}>
      {ticket.priority}
    </span>
  </div>

const getColorByPriority = (priority) => {
  switch (priority) {
    case 'high':
      return 'bg-pink-100 text-pink-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}; 