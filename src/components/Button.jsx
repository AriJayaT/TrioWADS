import React from "react";

const Button = ({ type = "submit", className = "", children, ...props }) => {
  return (
    <button
      type={type}
      className={`w-full bg-pink-500 text-white py-3 rounded-lg text-lg font-semibold transition-all duration-300 mt-4
                   hover:bg-pink-600 hover:scale-105 hover:cursor-pointer
                   active:scale-95 active:bg-pink-700 shadow-md hover:shadow-xl ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;