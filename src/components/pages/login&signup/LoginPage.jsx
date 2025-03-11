import React from "react";
import LoginForm from "/src/components/common/LoginForm";

// Plush images
import bunny from "/src/assets/login/bunny.png";
import dragon from "/src/assets/login/dragon.png";
import egg from "/src/assets/login/egg.jpg";
import penguin from "/src/assets/login/penguin.jpg";
import potato from "/src/assets/login/potato.jpg";
import whiteRabbit from "/src/assets/login/whiteRabbit.png";

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

// Plush Image Component with responsive visibility
const ResponsivePlushImage = ({ 
  src, 
  alt, 
  className = "", 
  rotationDeg = 0,
  size = "w-20 h-20",
  position = "absolute",
  noShadow = false,
  zIndex = 30,
  visibleFrom = "md", // Default to only show on medium screens and up
  visibleUpTo = "" // Optional parameter to hide on larger screens
}) => (
  <img
    src={src}
    alt={alt}
    className={`${position} ${size} rounded-full object-cover 
      ${!noShadow && 'shadow-lg'}
      rotate-${rotationDeg} 
      hidden ${visibleFrom}:block ${visibleUpTo ? `${visibleUpTo}:hidden` : ''} 
      ${className}`}
    style={{
      zIndex: zIndex,
      transform: `rotate(${rotationDeg}deg)`
    }}
  />
);

const LoginPage = () => {
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-r from-white to-pink-200 overflow-hidden flex items-center justify-center p-4">
      {/* Decorative Circles - Only visible on medium screens and up */}
      <div className="absolute w-7 h-7 bg-black rounded-full bottom-[23%] left-[17%] hidden md:block" />
      <div className="absolute w-9 h-9 bg-pink-300 rounded-full top-[40%] left-[24%] z-30 hidden md:block" />
      <div className="absolute w-20 h-20 bg-pink-300 rounded-full bottom-[25%] right-[13%] hidden md:block" />
      <div className="absolute w-7 h-7 bg-pink-300 rounded-full bottom-[37%] right-[19%] hidden md:block" />

      {/* Stars - Adjust visibility based on screen size */}
      <Star 
        color="black"
        rotationDeg={-15}
        size="h-6 sm:h-8 md:h-10"
        position="absolute top-[44%] left-[36%]"
        animate
        className="hidden sm:block"
      />
      <Star 
        color="black"
        rotationDeg={15}
        position="absolute bottom-[40%] right-[36%]"
        size="h-4 sm:h-6 md:h-8"
        animate
        className="hidden sm:block"
      />
      <Star 
        color="black"
        size="h-8"
        rotationDeg={-15}
        position="absolute top-[40%] right-[5%]"
        className="hidden md:block"
      />
      <Star 
        color="pink"
        size="h-6 sm:h-8 md:h-12"
        position="absolute top-[10%] left-[44.5%]"
        rotationDeg={25}
      />
      <Star 
        color="pink"
        size="h-4 sm:h-6 md:h-7"
        position="absolute top-[14%] right-[45.5%]"
        rotationDeg={-15}
        intensity={0.5}
        className="hidden sm:block"
      />

      {/* Decorative Rectangles - Only visible on medium screens and up */}
      <div 
        className="absolute w-18 h-18 border-2 border-pink-300 bg-transparent top-[23%] right-[12.5%] hidden md:block"
        style={{ zIndex: 40 }}
      /> 
      <div 
        className="absolute w-9 h-9 border-2 border-pink-300 bg-transparent bottom-[28%] right-[36.5%] hidden md:block"
      /> 

      {/* Plus Sign - Only visible on medium screens and up */}
      <div className="absolute top-[12%] left-[1.7%] text-black text-7xl font-light z-40 hidden md:block">
        +
      </div>

      {/* Desktop plush images (show all) */}
      <ResponsivePlushImage 
        src={egg} 
        alt="Egg Plush" 
        size="w-24 h-24"
        position="absolute top-[10%] left-[5%]"
        className="border-t border-b border-pink-500 bg-white"
        visibleFrom="lg"
        visibleUpTo=""
      />
      <ResponsivePlushImage 
        src={potato} 
        alt="Potato Plush" 
        size="w-32 h-32"
        position="absolute top-[20%] right-[5%]"
        className="border-t border-b border-pink-300"
        visibleFrom="lg"
      />
      <ResponsivePlushImage 
        src={penguin} 
        alt="Penguin Plush" 
        size="w-28 h-28"
        position="absolute bottom-[15%] left-[20%]"
        visibleFrom="lg"
      />
      <ResponsivePlushImage 
        src={bunny} 
        alt="Bunny Plush" 
        position="absolute bottom-[14%] right-[37%]"
        rotationDeg={15}
        noShadow
        zIndex={40}
        visibleFrom="lg"
      />
      <ResponsivePlushImage 
        src={whiteRabbit} 
        alt="White Rabbit Plush" 
        position="absolute bottom-[14%] left-[36.5%]"
        rotationDeg={-15}
        noShadow
        zIndex={40}
        visibleFrom="lg"
      />
      <ResponsivePlushImage 
        src={dragon} 
        alt="Sky Dragon Plush" 
        size="w-100"
        position="absolute -bottom-[20%] right-[10%]"
        rotationDeg={-10}
        noShadow
        visibleFrom="lg"
      />

      <LoginForm />
    </div>
  );
};

export default LoginPage;