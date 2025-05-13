// src/components/common/Button.jsx
import React from 'react';

const Button = ({ 
  type = "button", 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '', 
  onClick,
  disabled = false,
  ...props 
}) => {
  // Ensure variant is always a string for consistent handling
  const variantStr = Array.isArray(variant) ? variant[0] : variant;
  
  // Get styles based on variant
  const getVariantStyles = () => {
    switch (variantStr) {
      case 'simple':
        return 'text-pink-500 hover:text-pink-600 focus:ring-pink-300';
      case 'bigSubmit':
        return 'w-full bg-pink-500 text-white transition-all duration-300 hover:bg-pink-600 focus:ring-pink-300 shadow-md hover:shadow-lg';
      case 'smallSubmit':
        return 'bg-pink-500 text-white hover:bg-pink-600 focus:ring-pink-300';
      default:
        return 'bg-pink-500 hover:bg-pink-600 text-white focus:ring-pink-300';
    }
  };

  // Get styles based on size
  const getSizeStyles = () => {
    if (variantStr === 'bigSubmit') {
      return 'py-3 text-lg font-semibold rounded-lg';
    }
    
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1 rounded';
      case 'md':
        return 'text-sm px-4 py-2 rounded-md';
      case 'lg':
        return 'text-base px-6 py-3 rounded-lg';
      default:
        return 'text-sm px-4 py-2 rounded-md';
    }
  };

  // Disabled styles
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]';

  return (
    <button
      type={type}
      className={`font-medium transition-all duration-200 focus:outline-none focus:ring-2 ${getVariantStyles()} ${getSizeStyles()} ${disabledStyles} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;