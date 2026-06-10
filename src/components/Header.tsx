/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gem, ShieldCheck, Terminal, User } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  setView: (view: string) => void;
}

export default function Header({ currentView, setView }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/80 bg-[#0d0e14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo / Branding */}
        <div 
          onClick={() => setView('home')} 
          className="flex cursor-pointer items-center space-x-2 transition-transform duration-200 active:scale-95"
          id="header-logo"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-neon-purple to-neon-blue p-[1.5px] shadow-[0_0_15px_rgba(0,242,254,0.3)]">
            <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#12131a]">
              <Gem className="h-5 w-5 text-neon-blue animate-gem" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-wider text-white sm:text-xl">
              BOOYAH<span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">GEMS</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#aaa]">
              Official FF Store
            </span>
          </div>
        </div>

        {/* Navigation Actions */}
        <nav className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setView('home')}
            id="nav-home"
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
              currentView === 'home' || currentView === 'packages'
                ? 'bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 text-neon-blue border border-neon-blue/40 shadow-[0_0_10px_rgba(0,242,254,0.15)]'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
            }`}
          >
            Store
          </button>

          <button
            onClick={() => setView('admin')}
            id="nav-admin"
            className={`cursor-pointer flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
              currentView === 'admin'
                ? 'bg-gradient-to-r from-neon-orange/20 to-[#ff3c00]/20 text-neon-orange border border-neon-orange/40 shadow-[0_0_10px_rgba(255,106,0,0.15)]'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </nav>

        {/* Secure Delivery / Badges */}
        <div className="hidden items-center space-x-2 md:flex">
          <div className="flex items-center space-x-1 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="font-medium tracking-wide">Secure Delivery</span>
          </div>
        </div>

      </div>
    </header>
  );
}
