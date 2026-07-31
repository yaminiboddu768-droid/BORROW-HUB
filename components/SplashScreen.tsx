'use client';

import React, { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Check if we've already shown the splash screen in this session
    // const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    
    // if (hasSeenSplash) {
    //   setIsVisible(false);
    //   return;
    // }

    // Sequence the animations
    // 1. Background is already there
    // 2. Show content after a tiny delay
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 100);

    // 3. Begin fade out of the entire splash screen
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2800); // Wait 2.8 seconds

    // 4. Remove component from DOM completely
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      // sessionStorage.setItem('hasSeenSplash', 'true');
    }, 3500);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#090A0C' }} // Premium matte charcoal/black
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes splashLogoPulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(1.1); }
        }
        @keyframes splashGlowPulse {
          0%, 100% { opacity: 0.2; transform: scale(1.2); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}} />

      {/* Ambient background light - very subtle and wide */}
      <div 
        className="absolute inset-0 opacity-40 transition-opacity duration-1000 ease-in"
        style={{
          background: 'radial-gradient(circle at 50% 45%, rgba(168, 201, 59, 0.03) 0%, rgba(45, 143, 216, 0.02) 40%, transparent 70%)',
          opacity: showContent ? 1 : 0
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md px-6">
        {/* Logo Container with seamless blending */}
        <div 
          className="relative mb-8 flex justify-center items-center transition-all duration-1000 ease-out"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'scale(1)' : 'scale(0.85)',
            animation: showContent ? 'splashLogoPulse 2.5s ease-in-out infinite 0.5s' : 'none'
          }}
        >
          
          {/* Subtle glow specifically localized behind the logo */}
          <div 
            className="absolute inset-0 rounded-full blur-[60px] mix-blend-screen transition-all duration-1000"
            style={{ 
              background: 'radial-gradient(circle at top left, #A8C93B, transparent 60%), radial-gradient(circle at bottom right, #3CB6E7, transparent 60%)',
              transform: 'scale(1.2)',
              opacity: showContent ? 0.2 : 0,
              animation: showContent ? 'splashGlowPulse 2.5s ease-in-out infinite' : 'none'
            }} 
          />

          <img 
            src="/logo.png" 
            alt="Borrow Hub Logo" 
            className="w-40 h-40 md:w-48 md:h-48 object-cover relative z-10 mix-blend-lighten"
            style={{
              // Use mask-image to fade the edges of the image smoothly into the background,
              // eliminating any harsh boundaries from the JPG and making it feel native.
              WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 70%)',
              maskImage: 'radial-gradient(circle at center, black 45%, transparent 70%)',
              filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.5))'
            }}
          />
        </div>

        {/* Typography */}
        <div 
          className="text-center space-y-2 transition-all duration-1000 ease-out"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(15px)',
            transitionDelay: '300ms'
          }}
        >
          <h1 
            className="text-3xl md:text-4xl font-display font-medium tracking-tight text-[#F2F5F0]"
            style={{ 
              textShadow: '0px 2px 10px rgba(0,0,0,0.8)' 
            }}
          >
            Borrow Hub
          </h1>
          <p 
            className="text-sm font-medium tracking-widest uppercase text-[#88929E]"
          >
            Borrow Instead of Buy
          </p>
        </div>
      </div>
    </div>
  );
}
