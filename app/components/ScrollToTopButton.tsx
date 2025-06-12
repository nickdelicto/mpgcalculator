'use client'

import React from 'react'

interface ScrollToTopButtonProps {
  buttonText?: string;
  className?: string;
  icon?: React.ReactNode;
}

const ScrollToTopButton = ({
  buttonText = "Start Planning Now",
  className = "bg-white text-indigo-700 hover:bg-blue-50 font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1",
  icon = null
}: ScrollToTopButtonProps) => {
  const handleScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button 
      className={className}
      onClick={handleScroll}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {buttonText}
    </button>
  );
};

export default ScrollToTopButton; 