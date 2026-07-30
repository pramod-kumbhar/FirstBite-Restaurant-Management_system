'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Phone, Sparkles, UtensilsCrossed, ShieldCheck } from 'lucide-react';

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
        className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-[0.3] select-none pointer-events-none"
      >
        <source src="/firstbite_welcome_slowmo.mp4" type="video/mp4" />
      </video>

      {/* Top Header */}
      <header className="w-full max-w-6xl flex justify-between items-center z-10">
        <div className="text-xl font-extrabold tracking-tight select-none flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
          <UtensilsCrossed className="h-5 w-5 text-rose-500 animate-pulse" />
          <span className="italic text-white">First</span>
          <span className="text-rose-500 font-black">Bite</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-full shadow-lg hover:bg-white/20 transition">
          <Phone className="h-3.5 w-3.5 text-rose-400" />
          <span>+91 98765 43210</span>
        </div>
      </header>

      {/* Hero Content */}
      <div className="flex flex-col items-center text-center max-w-3xl z-10 my-auto py-10">
        {/* Quality Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold mb-6 backdrop-blur-md animate-glow-pulse">
          <Sparkles className="h-3.5 w-3.5 text-rose-400" />
          <span>Next-Gen Gourmet Dining & POS System</span>
        </div>

        {/* Brand Name */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight select-none flex items-center gap-3 sm:gap-4 justify-center drop-shadow-2xl">
          <span className="italic text-white">First</span>
          <span className="bg-gradient-to-r from-rose-500 to-rose-600 text-white px-4 py-1 sm:px-6 sm:py-2 rounded-3xl not-italic font-black shadow-2xl shadow-rose-500/40 border border-rose-400/30">Bite</span>
        </h1>
        
        {/* Tagline */}
        <p className="text-lg sm:text-2xl md:text-3xl mt-6 font-medium text-slate-200 tracking-wide max-w-2xl leading-relaxed text-shadow-sm">
          Experience world-class dining, instant QR table ordering & real-time restaurant management.
        </p>

        {/* Action Button */}
        <button 
          onClick={() => router.push('/login')}
          className="group mt-10 flex items-center gap-3 bg-rose-600 hover:bg-rose-500 px-8 py-4 rounded-2xl text-base sm:text-lg font-black tracking-wide shadow-2xl shadow-rose-600/40 hover:shadow-rose-500/50 hover:-translate-y-1 transition-all duration-300 active:translate-y-0 cursor-pointer border border-rose-400/30"
        >
          <span>Explore FirstBite Experience</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
        </button>

        {/* Trust Pill */}
        <div className="mt-8 flex items-center gap-4 text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Real-time POS</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Multi-Branch Sync</span>
        </div>
      </div>

      {/* Muted Copyright Footer */}
      <footer className="w-full max-w-6xl text-center z-10 text-xs text-slate-400 font-normal tracking-wide bg-slate-950/60 backdrop-blur-md py-2.5 px-4 rounded-2xl border border-white/5">
        By continuing past this page, you agree to our Terms of Service, Cookie Policy, and Privacy Policy. All rights reserved. 2026 © FirstBite™ Ltd.
      </footer>
    </div>
  );
}
