import React from 'react';

const TicketDistribution = () => {
  const categories = [
    {
      name: 'Product Issues',
      count: 245,
      change: '+5%',
      changeType: 'positive'
    },
    {
      name: 'Billing Support',
      count: 187,
      change: '-2%',
      changeType: 'negative'
    },
    {
      name: 'Technical Help',
      count: 156,
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'General Inquiry',
      count: 259,
      change: '+3%',
      changeType: 'positive'
    }
  ];

  const getChangeColor = (type) => {
    return type === 'positive' ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="mt-8">
      <div className="bg-white shadow-lg overflow-hidden rounded-4xl p-6 hover:shadow-pink-200 text-black">
      <h2 className="text-lg font-bold mb-10">Ticket Distribution</h2>
        {categories.map((category, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between p-4 border border-pink-200 rounded-2xl mb-4 ${
              index !== categories.length - 1 ? 'border-b' : ''
            }`}
          >
            <div>{category.name}</div>
            <div className="flex items-center gap-3">
              <span className="font-medium">{category.count}</span>
              <span className={`text-xs font-medium ${getChangeColor(category.changeType)}`}>
                {category.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketDistribution;