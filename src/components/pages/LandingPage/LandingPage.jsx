import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFileAlt, FaBook, FaQuestion, FaComment } from 'react-icons/fa';
import CustomerHeader from '../../common/CustomerHeader';
import CustomerFooter from '../../common/CustomerFooter';
import ChatWidget from '../../common/ChatWidget';
import { useAuth } from '../../../context/AuthContext';

// Background Images Component 
const BackgroundImages = () => {
  // These images will be imported by the user
  const imagePositions = [
    { imgName: 'jellycat1', top: '5%', left: '3%', rotate: '-5deg', size: '120px', opacity: '0.5', zIndex: '1' },
    { imgName: 'jellycat2', top: '15%', right: '5%', rotate: '8deg', size: '100px', opacity: '0.5', zIndex: '1' },
    { imgName: 'jellycat3', bottom: '25%', left: '8%', rotate: '12deg', size: '110px', opacity: '0.5', zIndex: '1' },
    { imgName: 'jellycat4', bottom: '10%', right: '7%', rotate: '-10deg', size: '90px', opacity: '0.5', zIndex: '1' },
    { imgName: 'jellycat5', top: '50%', left: '20%', rotate: '15deg', size: '80px', opacity: '0.5', zIndex: '1' },
    { imgName: 'jellycat6', top: '40%', right: '15%', rotate: '-8deg', size: '95px', opacity: '0.5', zIndex: '1' },
  ];

  return (
    <>
      {imagePositions.map((img, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            top: img.top,
            left: img.left,
            right: img.right,
            bottom: img.bottom,
            width: img.size,
            height: img.size,
            opacity: img.opacity,
            zIndex: img.zIndex,
            transform: `rotate(${img.rotate})`,
          }}
        >
          {/* The user will import these images */}
          <img
            src={`/src/assets/landingpage/${img.imgName}.png`}
            alt=""
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
      ))}
    </>
  );
};

// Carousel Component for Plush Toys
const PlushToyCarousel = ({ toys }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Auto-rotate carousel effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % toys.length);
    }, 3000);
    
    return () => clearInterval(timer);
  }, [toys.length]);
  
  return (
    <div className="relative w-full h-64 mb-6 overflow-hidden rounded-xl shadow-md">
      {/* Image container with transition */}
      <div 
        className="flex h-full transition-transform duration-500 ease-in-out" 
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {toys.map((toy) => (
          <div key={toy.id} className="min-w-full h-full">
            <img 
              src={toy.image} 
              alt="Jellycat product" 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Sample plush toys data
  const plushToys = [
    { id: 1, image: '/src/assets/carousell/car1.png' },
    { id: 2, image: '/src/assets/carousell/car2.png' },
    { id: 3, image: '/src/assets/carousell/car3.png' },
    { id: 4, image: '/src/assets/carousell/car4.png' }
  ];

  const handleSupportClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/select-version');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-pink-50">
      {/* Header */}
      <CustomerHeader />

      {/* Hero Section */}
      <section className="container mx-auto py-12 px-4 flex-grow relative overflow-hidden">
        {/* Background decorations - Replace with scattered images */}
        <BackgroundImages />

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-4xl mx-auto z-10 relative mb-16">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome to YipHelp Customer Support</h1>
          <p className="text-center text-gray-600 mb-8">
            Get the help you need with your favorite plush companions. Our support team is here to assist you with any questions or concerns.
          </p>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-10">
            <Link 
              to={isAuthenticated ? "/customer/create-ticket" : "#"} 
              onClick={handleSupportClick}
              className="bg-pink-400 text-white px-6 py-3 rounded-lg hover:bg-pink-500 transition-colors"
            >
              Create Support Ticket
            </Link>
            <Link to="/help-center" className="bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              Browse Help Center
            </Link>
          </div>

          {/* Plush Toys Carousel (replacing the grid) */}
          <PlushToyCarousel toys={plushToys} />
        </div>

        {/* Help Options */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">How Can We Help You?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <FaFileAlt className="text-pink-500 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Submit a Ticket</h3>
              <p className="text-gray-600 text-sm text-center mb-4">
                Need help with your YipHelp? Create a support ticket and our team will assist you promptly.
              </p>
              <Link 
                to={isAuthenticated ? "/customer/create-ticket" : "#"} 
                onClick={handleSupportClick}
                className="text-pink-500 text-sm font-medium"
              >
                Get Support →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <FaBook className="text-pink-500 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Help Center</h3>
              <p className="text-gray-600 text-sm text-center mb-4">
                Browse our knowledge base and FAQs to find answers to common questions.
              </p>
              <Link to="/help-center" className="text-pink-500 text-sm font-medium">Learn More →</Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <FaQuestion className="text-pink-500 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Us</h3>
              <p className="text-gray-600 text-sm text-center mb-4">
                Couldn't find what you're looking for? Contact our support team directly.
              </p>
              <Link to="/contact" className="text-pink-500 text-sm font-medium">Get in Touch →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <CustomerFooter />
      
      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default LandingPage; 