import React from 'react';

const Button = ({ 
  type = "submit", 
  children, 
  variant = ['bigSubmit', 'smallSubmit'], 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  // Ensure variant is always an array for consistent handling
  const variantArray = Array.isArray(variant) ? variant : [variant];
  
  // Get styles based on variants in the array
  const getVariantStyles = () => {
    let styles = [];
    
    variantArray.forEach(v => {
      switch (v) {
        case 'simple':
          styles.push('text-pink-400 cursor-pointer');
          break;
        case 'bigSubmit':
          styles.push('w-full bg-pink-500 text-white py-3 rounded-lg text-lg font-semibold transition-all duration-300 mt-4 hover:bg-pink-600 hover:scale-105 hover:cursor-pointer active:scale-95 active:bg-pink-700 shadow-md hover:shadow-xl');
          break;
        case 'smallSubmit':
          styles.push('text-pink-400 cursor-pointer');
          break;
        default:
          styles.push('bg-pink-500 hover:bg-pink-600 text-white');
          break;
      }
    });
    
    return styles.join(' ');
  };

  // Get styles based on size (only applied when bigSubmit is not in variants)
  const getSizeStyles = () => {
    if (variantArray.includes('bigSubmit')) return '';
    
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'md':
        return 'text-sm px-4 py-2';
      case 'lg':
        return 'text-base px-6 py-3';
      default:
        return 'text-sm px-4 py-2';
    }
  };

  return (
    <button
      type={type}
      className={`rounded font-medium ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;