import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="flex justify-between items-center px-8 w-full bg-white border border-pink-100 h-[71px] max-sm:px-4">
      <div className="flex gap-4 items-center">
        <Link to="/" className="flex gap-4 items-center">
          <div className="w-8 h-8 rounded bg-zinc-300" />
          <div className="text-xl font-bold leading-8 text-zinc-800">
            Jellycat Support
          </div>
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle menu"
        >
          <span className="toggle-icon">{isMobileMenuOpen ? "✕" : "☰"}</span>
        </button>

        {/* Navigation menu - will be shown/hidden on mobile based on state */}
        <nav
          className={`flex gap-8 ml-10 max-sm:hidden ${isMobileMenuOpen ? "mobile-open" : ""}`}
        >
          <Link
            to="/support-tickets"
            className="text-sm leading-5 text-gray-500 hover:text-pink-300"
          >
            Dashboard
          </Link>
          <Link
            to="/help-center"
            className="text-sm leading-5 text-gray-500 hover:text-pink-300"
          >
            Help Center
          </Link>
          <Link
            to="/support-tickets"
            className="text-sm leading-5 text-gray-500 hover:text-pink-300"
          >
            My Tickets
          </Link>
        </nav>

        <div className="flex gap-2 items-center">
          <div className="w-8 h-8 text-base leading-6 text-pink-300 bg-pink-50 rounded-full flex items-center justify-center">
            JS
          </div>
          <div className="text-sm leading-5 text-zinc-800">John Smith</div>
        </div>
      </div>
    </header>
  );
};
