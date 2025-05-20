import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const RatingStars = ({ 
  initialRating = 0, 
  size = 'md', 
  onChange,
  readOnly = false,
  showValue = false 
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  
  // Get size class based on the size prop
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-lg';
      case 'md': return 'text-2xl';
      case 'lg': return 'text-3xl';
      default: return 'text-2xl';
    }
  };

  // Handle star click
  const handleClick = (newRating) => {
    if (readOnly) return;
    
    setRating(newRating);
    if (onChange) onChange(newRating);
  };

  return (
    <div className="flex items-center">
      {/* Star rating */}
      <div className="flex">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <div
              key={index}
              className={`cursor-${readOnly ? 'default' : 'pointer'} px-0.5`}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => !readOnly && setHover(starValue)}
              onMouseLeave={() => !readOnly && setHover(0)}
            >
              <FaStar
                className={`${getSizeClass()} ${
                  starValue <= (hover || rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </div>
          );
        })}
      </div>
      
      {/* Display numeric value if showValue is true */}
      {showValue && rating > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-600">
          ({rating}/5)
        </span>
      )}
    </div>
  );
};

export default RatingStars; 