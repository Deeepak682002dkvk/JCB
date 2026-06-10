/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Flame, Gem, Shield, Zap, Swords } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
}

const LIVE_TOPUPS = [
  { uid: '489***23', action: 'topped up 1,060 Diamonds', time: '1s ago', icon: '💎' },
  { uid: '⚡Viper***FF', action: 'activated Weekly Lite Pass', time: '12s ago', icon: '🎫' },
  { uid: '291***08', action: 'topped up 5,600 Diamonds', time: '34s ago', icon: '👑' },
  { uid: '꧁༺Gamer***꧂', action: 'topped up 310 Diamonds', time: '50s ago', icon: '💎' },
  { uid: '394***75', action: 'activated Monthly Elite Chest', time: '2m ago', icon: '📦' },
  { uid: '⚔️Shadow***⚔️', action: 'topped up 2,180 Diamonds', time: '3m ago', icon: '🔥' }
];

export default function HeroSection({ onExploreClick }: HeroSectionProps) {
  const [tickerIndex, setTickerIndex] = useState(0);

  // Cycle the live purchase feed every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_TOPUPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentTicker = LIVE_TOPUPS[tickerIndex];

  return (
    <section className="relative overflow-hidden pt-6 pb-12">
      {/* Background Neon ambient flares */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-64 w-64 rounded-full bg-neon-purple/10 blur-[80px]" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-72 w-72 rounded-full bg-neon-blue/15 blur-[100px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Dynamic Live Feed Ticker */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center space-x-2 rounded-full border border-neon-blue/30 bg-black/50 px-4 py-1.5 text-xs text-white shadow-[0_0_15px_rgba(0,242,254,0.1)] backdrop-blur-sm animate-glow-blue">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
            </span>
            <span className="text-[10px] font-semibold text-neon-blue uppercase tracking-wider font-mono">Live Activity:</span>
            <span className="font-mono text-gray-300">
              <span className="font-semibold text-white">{currentTicker.uid}</span> {currentTicker.action}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">({currentTicker.time})</span>
            <span>{currentTicker.icon}</span>
          </div>
        </div>

        {/* Hero Canvas / Premium Gaming Header */}
        <div className="relative rounded-3xl border border-gray-800 bg-gradient-to-br from-[#12131a] via-[#0e0f15] to-[#12131a] p-6 sm:p-10 lg:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(ellipse at center, #00f2fe 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            
            {/* Left Content Column */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center space-x-1.5 rounded-full border border-neon-purple/40 bg-neon-purple/10 px-3 py-1 text-xs font-semibold text-neon-purple uppercase tracking-wider">
                <Flame className="h-4 w-4 animate-bounce" />
                <span>Double Bonus Diamond Event Active!</span>
              </div>

              <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl select-none">
                FUEL YOUR <br />
                <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(157,78,221,0.2)]">
                  FREE FIRE BOOYAH
                </span>
              </h1>

              <p className="max-w-xl text-sm text-gray-300 sm:text-base leading-relaxed">
                Unlock character bundles, weapon crates, and elite passes instantly. The most reliable, secure, and lightning-fast UID top-up portal for Free Fire survivors.
              </p>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 border-t border-gray-800/85 pt-6 font-display">
                <div>
                  <span className="block text-xl font-bold text-white sm:text-2xl">4.9/5</span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Customer Rating</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-neon-blue sm:text-2xl">2M+</span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Fast Deliveries</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-neon-purple sm:text-2xl">&lt; 3 mins</span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Average Credit</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={onExploreClick}
                  className="group relative cursor-pointer px-6 py-3 font-semibold text-xs tracking-wider uppercase rounded-xl transition-transform active:scale-95 duration-200"
                >
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple p-[1.5px] shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(157,78,221,0.6)]">
                    <span className="flex h-full w-full items-center justify-center rounded-[11px] bg-black px-6 py-3 text-white transition-colors duration-300 group-hover:bg-transparent">
                      Top-Up Diamonds
                    </span>
                  </span>
                </button>

                <div className="flex items-center space-x-2 text-xs text-gray-400 font-mono">
                  <Swords className="h-4 w-4 text-neon-orange animate-pulse" />
                  <span>Enter UID &bull; Pay Real &bull; Credit In-Game</span>
                </div>
              </div>
            </div>

            {/* Right Abstract Gaming Mockup Column */}
            <div className="relative hidden lg:col-span-5 lg:block">
              <div className="relative mx-auto flex h-80 w-80 items-center justify-center">
                
                {/* Glowing game crest circles */}
                <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-neon-blue/30" style={{ animationDuration: '30s' }} />
                <div className="absolute h-64 w-64 animate-spin-slow rounded-full border border-dashed border-neon-purple/20" style={{ animationDirection: 'reverse', animationDuration: '20s' }} />
                <div className="absolute h-48 w-48 rounded-full bg-gradient-to-tr from-neon-purple/20 to-neon-blue/20 blur-xl" />

                {/* Main Diamond Illustration */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                  <div className="relative rounded-2xl bg-gradient-to-b from-[#1a1b25] to-[#14151f] p-6 shadow-2xl border border-gray-800">
                    <div className="absolute top-0 right-0 -m-2 rounded-md bg-neon-pink px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                      Bonus Event
                    </div>
                    
                    <Gem className="mx-auto h-20 w-20 text-neon-blue animate-gem filter drop-shadow-[0_0_25px_rgba(0,242,254,0.6)]" />
                    
                    <h3 className="mt-4 font-display text-xl font-bold text-white">5,600 + 840</h3>
                    <p className="text-[10px] font-mono text-neon-purple uppercase tracking-widest mt-0.5">Grandmaster Cache</p>
                    <div className="mt-4 rounded-lg bg-white/5 py-1.5 px-3 border border-white/10">
                      <span className="text-xs text-[#aaa]">Only</span>{' '}
                      <span className="font-mono text-sm font-bold text-neon-blue">₹4,000.00</span>
                    </div>
                  </div>
                </div>

                {/* Miniature badge widgets */}
                <div className="absolute -top-4 right-10 flex items-center space-x-1.5 rounded-lg border border-neon-orange/40 bg-black p-2 shadow-lg scale-90">
                  <Zap className="h-4 w-4 text-neon-orange" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white tracking-wide uppercase">⚡ 2-min delivery</span>
                  </div>
                </div>

                <div className="absolute -bottom-2 -left-6 flex items-center space-x-1.5 rounded-lg border border-green-500/30 bg-black p-2 shadow-lg scale-90">
                  <Shield className="h-4 w-4 text-green-400" />
                  <div className="text-[9px] font-bold text-white tracking-wide uppercase">UID Authorized</div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
