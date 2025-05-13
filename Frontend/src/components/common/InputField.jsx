// src/components/common/InputField.jsx
import React from "react";

const InputField = ({ 
  label, 
  type, 
  name, 
  value, 
  onChange, 
  error, 
  icon, 
  className = "", 
  disabled = false,
  ...props 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          placeholder={label}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full p-3 ${
            icon ? 'pl-10' : 'pl-3'
          } border rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all duration-200 text-black ${
            error ? "border-red-500 focus:ring-red-300" : "border-gray-300"
          } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          required
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default InputField;