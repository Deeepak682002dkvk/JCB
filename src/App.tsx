/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import DiamondCard from './components/DiamondCard';
import CheckoutPage from './components/CheckoutPage';
import SuccessPage from './components/SuccessPage';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { DiamondPackage, TopupOrder } from './types';
import { Gem, Flame, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [currentView, setView] = useState<string>('home'); // Views: 'home', 'checkout', 'admin', 'success'
  const [packages, setPackages] = useState<DiamondPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  
  // Checkout selected package state
  const [selectedPkg, setSelectedPkg] = useState<DiamondPackage | null>(null);
  
  // Post-payment successful order reference state
  const [sessionOrder, setSessionOrder] = useState<TopupOrder | null>(null);

  // Retrieve packages dynamically from our back-end API
  const fetchStorePackages = async () => {
    setLoadingPackages(true);
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPackages(data);
      }
    } catch (error) {
      console.error('Failed to load shop items:', error);
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    fetchStorePackages();
  }, []);

  // When admin navigates back or pages reload, update state
  useEffect(() => {
    if (currentView === 'home') {
      fetchStorePackages();
    }
  }, [currentView]);

  const handleBuyNow = (pkg: DiamondPackage) => {
    setSelectedPkg(pkg);
    setView('checkout');
  };

  const handlePaymentSuccess = (confirmedOrder: TopupOrder) => {
    setSessionOrder(confirmedOrder);
    setView('success');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#07080c] relative transition-colors duration-300">
      
      {/* Background Top neon purple fog */}
      <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-full max-w-7xl -translate-x-1/2 bg-gradient-to-b from-neon-purple/5 to-transparent blur-[120px]" />

      <Header currentView={currentView} setView={setView} />

      <main className="flex-grow">
        
        {/* VIEW 1: HOME PORTAL */}
        {currentView === 'home' && (
          <div className="space-y-4">
            
            <HeroSection onExploreClick={() => {
              const el = document.getElementById('store-gems-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} />

            {/* STORE LIST SECTION */}
            <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" id="store-gems-grid">
              
              <div className="flex flex-col space-y-2 border-b border-gray-800 pb-5 md:flex-row md:items-baseline md:justify-between md:space-y-0">
                <div>
                  <div className="flex items-center space-x-1.5 text-neon-blue font-mono text-[10px] uppercase tracking-widest font-extrabold">
                    <Layers className="h-4 w-4" />
                    <span>Secure Top-UP Diamonds</span>
                  </div>
                  <h2 className="font-display text-xl font-black text-white sm:text-2xl tracking-wide uppercase mt-1">
                    Select Your Gems Package
                  </h2>
                </div>
                <p className="text-xs text-gray-500 font-mono">
                  Input UID at checkout &bull; 100% Garena Legal
                </p>
              </div>

              {/* LOADING INDICATOR OR CARDS ROW */}
              {loadingPackages ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <RefreshCw className="h-8 w-8 text-neon-blue animate-spin" />
                  <span className="text-xs font-mono text-gray-500 uppercase tracking-widest animate-pulse">
                    Connecting Secure Gem Vault...
                  </span>
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {packages.map((pkg) => (
                    <DiamondCard 
                      key={pkg.id} 
                      pkg={pkg} 
                      onSelect={handleBuyNow} 
                    />
                  ))}
                  {packages.length === 0 && (
                    <div className="col-span-full text-center py-12 border border-dashed border-gray-800 rounded-2xl bg-black/40">
                      <p className="text-sm text-gray-500 font-mono">No packages returned from database. Sync or reload.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {/* VIEW 2: CHECKOUT DIAL */}
        {currentView === 'checkout' && selectedPkg && (
          <CheckoutPage 
            selectedPackage={selectedPkg} 
            onBack={() => setView('home')} 
            onSuccess={handlePaymentSuccess} 
          />
        )}

        {/* VIEW 3: SUCCESS CONGRATS */}
        {currentView === 'success' && sessionOrder && (
          <SuccessPage 
            order={sessionOrder} 
            onGoHome={() => {
              setSessionOrder(null);
              setSelectedPkg(null);
              setView('home');
            }} 
          />
        )}

        {/* VIEW 4: ADMIN CONTROLLER */}
        {currentView === 'admin' && (
          <AdminPanel />
        )}

      </main>

      <Footer />
    </div>
  );
}
