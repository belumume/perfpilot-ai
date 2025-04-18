// layout.jsx
import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <header className="header">
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>
      
      <main>{children}</main>
      
      <footer>© 2025 My Company</footer>
      
      {/* Custom font without next/font */}
      <style jsx global>{`
        @font-face {
          font-family: 'CustomFont';
          src: url('/fonts/CustomFont.woff2') format('woff2');
          font-weight: normal;
          font-style: normal;
        }
        
        body {
          font-family: 'CustomFont', sans-serif;
        }
      `}</style>
    </div>
  );
}