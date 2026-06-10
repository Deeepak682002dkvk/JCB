/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gem, Flame, Award, Gift, Sparkles, ShoppingBag } from 'lucide-react';
import { DiamondPackage } from '../types';

interface DiamondCardProps {
  pkg: DiamondPackage;
  onSelect: (pkg: DiamondPackage) => void;
  key?: React.Key | string | number;
}

export default function DiamondCard({ pkg, onSelect }: DiamondCardProps) {
  // Select matching premium icons based on package image indicators
  const getPackageIcon = (imgKey: string) => {
    switch (imgKey) {
      case 'diamond_single':
        return <Gem className="h-10 w-10 text-neon-blue animate-gem filter drop-shadow-[0_0_10px_rgba(0,242,254,0.4)]" />;
      case 'diamond_stack':
        return (
          <div className="relative">
            <Gem className="h-10 w-10 text-neon-blue filter drop-shadow-[0_0_10px_rgba(0,242,254,0.4)]" />
            <Gem className="absolute -right-2 top-2 h-6 w-6 text-neon-purple opacity-80" />
          </div>
        );
      case 'diamond_box':
        return (
          <div className="relative">
            <Gift className="h-12 w-12 text-neon-purple animate-pulse" />
            <Gem className="absolute left-3 top-3 h-6 w-6 text-neon-blue animate-gem" />
          </div>
        );
      case 'diamond_chest':
        return (
          <div className="relative p-2">
            <div className="absolute inset-0 bg-neon-purple/20 blur-md rounded-full" />
            <ShoppingBag className="relative z-10 h-14 w-14 text-white" />
            <Gem className="absolute right-0 bottom-0 h-6 w-6 text-neon-blue animate-bounce" />
          </div>
        );
      case 'diamond_pot':
        return (
          <div className="relative p-2">
            <div className="absolute inset-0 bg-neon-orange/20 blur-md rounded-full" />
            <Flame className="relative z-10 h-14 w-14 text-neon-orange" />
            <Gem className="absolute left-3 top-3 h-7 w-7 text-neon-blue animate-gem" />
          </div>
        );
      case 'diamond_throne':
        return (
          <div className="relative p-2">
            <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple to-neon-pink opacity-30 blur-lg rounded-full" />
            <Award className="relative z-10 h-16 w-16 text-yellow-400 animate-bounce" />
            <Gem className="absolute right-2 top-2 h-6 w-6 text-neon-blue animate-gem" />
            <Sparkles className="absolute left-2 bottom-2 h-4 w-4 text-neon-pink" />
          </div>
        );
      case 'card_weekly':
        return (
          <div className="relative rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue p-[1px] shadow-lg">
            <div className="flex h-12 w-20 items-center justify-center rounded-[11px] bg-[#1a1b26] p-1 border border-white/5">
              <span className="font-display text-[10px] uppercase font-bold text-neon-blue tracking-wide">Weekly</span>
            </div>
          </div>
        );
      case 'card_monthly':
        return (
          <div className="relative rounded-xl bg-gradient-to-r from-neon-orange to-neon-pink p-[1px] shadow-lg animate-glow-purple">
            <div className="flex h-14 w-24 items-center justify-center rounded-[11px] bg-[#1a1b26] p-1 border border-white/5">
              <span className="font-display text-[10px] uppercase font-bold text-neon-pink tracking-wide animate-pulse">Monthly Elite</span>
            </div>
          </div>
        );
      default:
        return <Gem className="h-10 w-10 text-neon-blue" />;
    }
  };

  const hasTag = !!pkg.tag;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-gray-800/80 bg-[#12131a]/90 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-gray-700/80 hover:bg-[#151622]/90 hover:shadow-[0_15px_30px_rgba(0,242,254,0.1)]">
      
      {/* Selection Glow Accent */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] w-full scale-x-0 bg-gradient-to-r from-neon-blue to-neon-purple transition-transform duration-300 group-hover:scale-x-100" />

      {/* Ribbon Tag */}
      {hasTag && (
        <span className="absolute top-3 right-3 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-md">
          {pkg.tag}
        </span>
      )}

      {/* Package Header (Gem Art & Title) */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 items-center justify-center">
          {getPackageIcon(pkg.image)}
        </div>

        <h3 className="mt-4 font-display text-lg font-bold text-white tracking-wide group-hover:text-neon-blue transition-colors">
          {pkg.diamonds} Diamonds
        </h3>

        {pkg.bonusDiamonds > 0 ? (
          <span className="mt-1 flex items-center space-x-1 rounded-md bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-400 border border-green-500/25 uppercase font-mono">
            <span>+{pkg.bonusDiamonds} Bonus</span>
          </span>
        ) : (
          <span className="mt-1 h-5 block" />
        )}

        <p className="mt-2 text-xs text-gray-400 font-medium px-4 line-clamp-1">
          {pkg.name}
        </p>
      </div>

      {/* Package Footer (Pricing & Buy Button) */}
      <div className="mt-6 space-y-4">
        <div className="flex items-baseline justify-center space-x-1">
          <span className="text-xs text-gray-500 font-medium">INR</span>
          <span className="font-mono text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-200">
            ₹{pkg.price.toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => onSelect(pkg)}
          className="w-full cursor-pointer rounded-xl bg-gray-800 text-xs font-bold uppercase tracking-wider text-white py-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-neon-blue hover:to-neon-purple hover:text-white hover:shadow-[0_0_15px_rgba(0,242,254,0.4)] active:scale-[0.98]"
        >
          Buy Now
        </button>
      </div>

    </div>
  );
}
