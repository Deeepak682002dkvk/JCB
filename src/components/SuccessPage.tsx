/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle, Gem, ExternalLink, Calendar, Zap, ArrowRight } from 'lucide-react';
import { TopupOrder } from '../types';

interface SuccessPageProps {
  order: TopupOrder;
  onGoHome: () => void;
}

export default function SuccessPage({ order, onGoHome }: SuccessPageProps) {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString();
    } catch {
      return isoString;
    }
  };

  const netDms = order.diamonds * order.quantity;
  const netBonus = order.bonusDiamonds * order.quantity;
  const totalCredited = netDms + netBonus;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      
      {/* BOOYAH SUCCESS BOX */}
      <div className="relative rounded-3xl border border-green-500/30 bg-[#0f1712]/95 p-6 sm:p-10 shadow-[0_20px_40px_rgba(34,197,94,0.1)] text-center space-y-6">
        
        {/* Aesthetic radiant halo */}
        <div className="absolute top-1/2 left-1/2 -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-[50px]" />

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400 border border-green-500/25">
          <CheckCircle className="h-10 w-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-[10px] font-bold text-green-500 uppercase tracking-widest block">
            Payment Securely Authorized
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white select-none">
            BOOYAH! TOP-UP COMPLETED
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
            Gems are successfully cleared through the server! Diamonds scheduled to reflect in your Garena app in 2-5 minutes.
          </p>
        </div>

        {/* Dynamic breakdown card of delivery */}
        <div className="rounded-2xl border border-gray-800 bg-[#12131a] p-5 text-left space-y-4">
          <header className="flex justify-between items-baseline border-b border-gray-800/60 pb-3">
            <div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Transfer Session</span>
              <span className="font-mono text-xs font-semibold text-gray-300">{order.id}</span>
            </div>
            <div className="flex items-center space-x-1 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded text-[10px] text-green-400 font-mono uppercase font-bold">
              <span>{order.status}</span>
            </div>
          </header>

          <main className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Player UID:</span>
              <span className="font-mono font-bold text-white">{order.playerUid}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Gamer Nickname:</span>
              <span className="font-bold text-neon-blue font-display">{order.playerNickname}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Diamonds Purchased:</span>
              <span className="font-mono font-bold text-white">
                {netDms} <span className="text-gray-500 text-[10px]">({order.quantity}x Packs)</span>
              </span>
            </div>

            {netBonus > 0 && (
              <div className="flex justify-between text-green-400 font-semibold font-mono">
                <span>Bonus Transferred:</span>
                <span>+{netBonus} Extra Gems</span>
              </div>
            )}

            <div className="flex justify-between pt-1 border-t border-gray-800/50">
              <span className="text-gray-500">Delivery Gateway:</span>
              <span className="flex items-center text-neon-purple font-mono text-[10px] uppercase font-bold">
                <Zap className="h-3 w-3 mr-1 text-neon-orange" /> Instant API Server
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Total Cleared Price:</span>
              <span className="font-mono font-extrabold text-neon-blue text-sm">₹{order.totalPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Gateway Ref:</span>
              <span className="font-mono font-medium text-gray-400 text-[10px] text-right truncate max-w-[150px]">
                {order.razorpayPaymentId || 'pay_test_bypassGateway'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500 font-mono">Completed Date:</span>
              <span className="font-mono text-gray-500 text-[10px]">{formatTime(order.createdAt)}</span>
            </div>
          </main>
        </div>

        {/* Safety guarantees */}
        <div className="flex items-center justify-center space-x-2 bg-black/40 border border-gray-800/80 p-3 rounded-lg text-[10px] text-gray-500 font-mono">
          <ExternalLink className="h-3.5 w-3.5 text-neon-blue mr-1" />
          <span>Need receipt help? Submit ticket using Transaction ID.</span>
        </div>

        {/* Return Button */}
        <div>
          <button
            onClick={onGoHome}
            id="btn-success-home"
            className="cursor-pointer inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 text-xs font-extrabold uppercase tracking-widest text-black hover:text-white transition-all hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] active:scale-95"
          >
            <span>Purchase More Gems</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
