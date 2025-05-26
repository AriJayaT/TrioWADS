import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TicketDistribution = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('No authentication token found.');
        }

        const response = await axios.get('http://localhost:5000/api/tickets/distribution', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Ticket Distribution Response:', response.data);

        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          throw new Error('Expected array but got: ' + JSON.stringify(response.data));
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.error || 'Unable to load ticket distribution.');
      }
    };

    fetchDistribution();
  }, []);

  return (
    <div className="mt-8">
      <div className="bg-white shadow-lg overflow-hidden rounded-4xl p-6 hover:shadow-pink-200">
        <h2 className="text-lg font-bold mb-10">Ticket Distribution</h2>
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : categories.length === 0 ? (
          <p>Loading ticket distribution...</p>
        ) : (
          categories.map((category, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-pink-200 rounded-2xl mb-4"
            >
              <div>{category.name}</div>
              <div className="flex items-center gap-3">
                <span className="font-medium">{category.count}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TicketDistribution;
