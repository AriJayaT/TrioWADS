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
  ...props 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          type={type}
          name={name}
          placeholder={label}
          value={value}
          onChange={onChange}
          className={`w-full p-3 ${icon ? 'pl-10' : 'pl-3'} border rounded-lg bg-gray-100 focus:outline-pink-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          required
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default InputField;