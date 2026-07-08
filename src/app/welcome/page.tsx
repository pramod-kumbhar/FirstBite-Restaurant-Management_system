'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Phone } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(err => {
        console.log("Autoplay was prevented:", err);
      });
    }
  }, []);

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-between items-center text-white px-6 py-8 relative overflow-hidden bg-slate-950"
      style={{
        backgroundImage: 'url(/firstbite_welcome_bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Video Background */}
      <video 
        ref={videoRef}
        autoPlay 
        loop 
        muted 
        playsInline 
        poster="/firstbite_welcome_bg.jpg"
        className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-[0.35] select-none pointer-events-none"
      >
        <source src="/firstbite_welcome_slowmo.mp4" type="video/mp4" />
      </video>

      {/* Top Header */}
      <header className="w-full max-w-6xl flex justify-between items-center z-10">
        <div className="text-xl font-extrabold tracking-tight select-none flex items-center gap-1.5">
          <span className="italic">First</span>
          <span className="text-rose-500">Bite</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
          <Phone className="h-3.5 w-3.5 text-rose-400" />
          <span>+1 (555) 123-4567</span>
        </div>
      </header>
      {/* Hero Content */}
      <div className="flex flex-col items-center text-center max-w-2xl z-10 my-auto">
        {/* Brand Name */}
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight select-none flex items-center gap-2 sm:gap-4 justify-center">
          <span className="italic">First</span>
          <span className="bg-rose-500 text-white px-3 py-1 sm:px-5 sm:py-1.5 rounded-2xl sm:rounded-3xl not-italic text-3xl sm:text-5xl md:text-7xl font-extrabold shadow-2xl shadow-rose-500/30">Bite</span>
        </h1>
        
        {/* Tagline */}
        <p className="text-base sm:text-xl md:text-3xl mt-4 sm:mt-6 font-light text-slate-200 tracking-wide">
          Experience premium dining & effortless ordering
        </p>

        {/* Explore Button */}
        <button 
          onClick={() => router.push('/login')}
          className="group mt-8 sm:mt-10 flex items-center gap-3 bg-rose-500 hover:bg-rose-600 px-6 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base font-bold tracking-wide shadow-xl shadow-rose-500/20 hover:shadow-rose-500/30 hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0"
        >
          <span>Explore FirstBite</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
        </button>
      </div>

      {/* Muted Copyright Footer */}
      <footer className="w-full max-w-6xl text-center z-10 text-xs text-slate-400 font-light tracking-wide">
        By continuing past this page, you agree to our Terms of Service, Cookie Policy, and Privacy Policy. All rights reserved. 2026 © FirstBite™ Ltd.
      </footer>
    </div>
  );
}
