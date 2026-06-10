/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gem, ShieldCheck, CreditCard, Sparkles, RefreshCw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-800/80 bg-[#07080c] py-8 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Support Grid info */}
        <div className="grid grid-cols-1 gap-6 border-b border-gray-800 pb-8 md:grid-cols-3">
          <div className="flex items-start space-x-3">
            <div className="rounded-lg bg-neon-blue/10 p-2 text-neon-blue">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide uppercase text-white">Instant Credit</h4>
              <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                Diamonds are automatically delivered to your Free Fire account via UID in 2-5 minutes once verification completes.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="rounded-lg bg-neon-purple/10 p-2 text-neon-purple">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide uppercase text-white">100% Certified</h4>
              <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                Legitimate premium top-up store. Full order tracking history and live webhook transaction logs.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="rounded-lg bg-neon-orange/10 p-2 text-neon-orange">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide uppercase text-white">24/7 Processing</h4>
              <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                Automated API servers work around the clock to authorize payments and supply bonus diamonds without delay.
              </p>
            </div>
          </div>
        </div>

        {/* Brand & Terms */}
        <div className="mt-8 flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="flex items-center space-x-2">
            <Gem className="h-4 w-4 text-neon-blue" />
            <span className="font-display font-bold tracking-wide text-white">
              BOOYAH GEMS
            </span>
            <span className="text-xs text-gray-500">| Premium diamond provider template.</span>
          </div>

          <div className="flex space-x-4 text-xs font-mono text-gray-500">
            <span>Powered by Razorpay</span>
            <span>Secure SSL Encryption</span>
          </div>
        </div>

        {/* Game Disclaimer */}
        <p className="mt-6 text-center text-[10px] text-gray-600 leading-relaxed">
          Disclaimer: This application is a mockup gaming store designed to demonstrate beautiful UI integrations, WebSockets, and state verification. Garena, Free Fire, and Booyah are registered trademarks of Garena International. All game titles, assets, characters, and descriptions used in this site belong strictly to their respective owners.
        </p>

      </div>
    </footer>
  );
}
