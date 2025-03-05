import React from "react";
import LoginForm from "./LoginForm";

// Plush images
import bunny from "../assets/login/bunny.png";
import dragon from "../assets/login/dragon.png";
import egg from "../assets/login/egg.jpg";
import penguin from "../assets/login/penguin.jpg";
import potato from "../assets/login/potato.jpg";
import whiteRabbit from "../assets/login/whiteRabbit.png";

// Custom Star Component
const Star = ({ 
  color = "black", 
  size = "w-8", 
  rotationDeg = 0, 
  position = "absolute",
  animate = false,
  className = "",
  intensity = 1
}) => {
  const starPath = "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";
  
  // Function to adjust color intensity
  const adjustColorIntensity = (baseColor, intensity) => {
    if (baseColor === 'pink') {
      // Create a more muted or intense pink based on intensity
      const pinkShades = ['#FFB6C1', '#FF69B4', '#FF1493'];
      return pinkShades[Math.min(Math.max(Math.floor(intensity * 2), 0), 2)];
    }
    return color;
  };

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
      className={`${position} ${size} ${className}`}
      style={{
        ...(animate && { animation: 'spin 3s linear infinite' }),
        transform: `rotate(${rotationDeg}deg)`,
        zIndex: 40
      }}
    >
      <path 
        d={starPath} 
        fill={adjustColorIntensity(color, intensity)}
      />
    </svg>
  );
};

// Plush Image Component
const ResponsivePlushImage = ({ 
  src, 
  alt, 
  className = "", 
  rotationDeg = 0,
  size = "w-20 h-20",
  position = "absolute",
  noShadow = false,
  zIndex = 30
}) => (
  <img
    src={src}
    alt={alt}
    className={`${position} ${size} rounded-full object-cover 
      ${!noShadow && 'shadow-lg'}
      rotate-${rotationDeg} 
      hidden md:block 
      ${className}`}
    style={{
      zIndex: zIndex,
      transform: `rotate(${rotationDeg}deg)`
    }}
  />
);

const LoginPage = () => {
  return (
    <div className="relative w-full h-screen bg-gradient-to-r from-white to-pink-200 overflow-hidden flex items-center justify-center">
      {/* Decorative Circles */}
      <div className="absolute w-6 h-6 bg-black rounded-full bottom-[23%] left-[17%] hidden md:block" />
      <div className="absolute w-8 h-8 bg-pink-300 rounded-full top-[40%] left-[24%] z-30 hidden md:block" />
      <div className="absolute w-20 h-20 bg-pink-300 rounded-full bottom-[25%] right-[13%] hidden md:block" />
      <div className="absolute w-7 h-7 bg-pink-300 rounded-full bottom-[37%] right-[20%] hidden md:block" />

      {/* Stars */}
      <Star 
        color="black"
        rotationDeg={-15}
        size="h-10"
        position="absolute top-[44%] left-[34.59%]"
        animate
      />
      <Star 
        color="black"
        rotationDeg={15}
        position="absolute bottom-[40%] right-[34.8%]"
        size="h-8"
        animate
        className="hover:scale-110 transition-transform duration-300"
      />
      <Star 
        color="black"
        size="h-6"
        rotationDeg={-15}
        position="absolute top-[40%] right-[4%]"
      />
      <Star 
        color="pink"
        size="h-12"
        position="absolute top-[7%] left-[44%]"
        rotationDeg={25}
      />
      <Star 
        color="pink"
        size="h-7"
        position="absolute top-[10%] right-[44.5%]"
        rotationDeg={-15}
        intensity={0.5}
      />

      {/* Decorative Rectangles */}
      <div 
        className="absolute w-18 h-18 border-2 border-pink-300 bg-transparent top-[25%] right-[16%] hidden md:block"
        style={{ zIndex: 40 }}
      /> 
      <div 
        className="absolute w-9 h-9 border-2 border-pink-300 bg-transparent bottom-[28%] right-[35%] hidden md:block"
      /> 

      {/* Plus Sign */}
      <div className="absolute top-[12%] left-[1.7%] text-black text-7xl font-light z-40 hidden md:block">
        +
      </div>

      {/* Plush Images */}
      <ResponsivePlushImage 
        src={egg} 
        alt="Egg Plush" 
        size="w-30 h-30"
        position="absolute top-[10%] left-[5%]"
        className="border-t border-b border-pink-500 bg-white"
      />
      <ResponsivePlushImage 
        src={potato} 
        alt="Potato Plush" 
        size="w-40 h-40"
        position="absolute top-[20%] right-[5%]"
        className="border-t border-b border-pink-300"
      />
      <ResponsivePlushImage 
        src={penguin} 
        alt="Penguin Plush" 
        size="w-35 h-35"
        position="absolute bottom-[15%] left-[20%]"
      />
      <ResponsivePlushImage 
        src={bunny} 
        alt="Bunny Plush" 
        position="absolute bottom-[10%] right-[37%]"
        rotationDeg={15}
        noShadow
        zIndex={40}
      />
      <ResponsivePlushImage 
        src={whiteRabbit} 
        alt="White Rabbit Plush" 
        position="absolute bottom-[10%] left-[36.5%]"
        rotationDeg={-15}
        noShadow
        zIndex={40}
      />
      <ResponsivePlushImage 
        src={dragon} 
        alt="Sky Dragon Plush" 
        size="w-100"
        position="absolute -bottom-[20%] right-[8%]"
        rotationDeg={-15}
        noShadow
      />

      <LoginForm />
    </div>
  );
};

export default LoginPage;