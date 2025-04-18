// hero-section.jsx
import React from 'react';

export default function HeroSection() {
  return (
    <div className="hero-container">
      <h1 className="hero-title">Welcome to Our Platform</h1>
      <p className="hero-subtitle">The best solution for your business needs</p>
      
      {/* Missing next/image usage */}
      <img 
        src="/hero-banner.jpg" 
        alt="Hero Banner" 
        className="hero-image"
      />
      
      <div className="hero-cta">
        <button className="primary-button">Get Started</button>
        <button className="secondary-button">Learn More</button>
      </div>
    </div>
  );
}