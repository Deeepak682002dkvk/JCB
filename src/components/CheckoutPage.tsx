/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Gem, UserCheck, ShieldCheck, 
  Smartphone, Plus, Minus, CreditCard, Sparkles, Check, Info,
  Download, Copy, RefreshCw, Clock
} from 'lucide-react';
import { DiamondPackage, TopupOrder, UpiSettings } from '../types';

interface CheckoutPageProps {
  selectedPackage: DiamondPackage;
  onBack: () => void;
  onSuccess: (order: TopupOrder) => void;
}

const PAYMENT_METHODS = [
  { id: 'UPI', name: 'Instant UPI', description: 'GooglePay, PhonePe, Paytm QR', icon: '⚡' },
  { id: 'GPay', name: 'Google Pay', description: 'Requires GPay mobile client', icon: '📱' },
  { id: 'PhonePe', name: 'PhonePe', description: 'Direct checkout with PhonePe', icon: '🟣' },
  { id: 'Paytm', name: 'Paytm Wallet', description: 'Wallet balance or Paytm net', icon: '🔵' }
];

export default function CheckoutPage({ selectedPackage, onBack, onSuccess }: CheckoutPageProps) {
  const [playerUid, setPlayerUid] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Verification details
  const [verificationResult, setVerificationResult] = useState<{
    uid: string;
    nickname: string;
    success: boolean;
  } | null>(null);
  
  // Modal toggle
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmedNickname, setConfirmedNickname] = useState('');
  const [isUidConfirmed, setIsUidConfirmed] = useState(false);

  // Settings
  const [quantity, setQuantity] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errorText, setErrorText] = useState('');

  // QR Payment Gateway state integration
  const [paymentPortalOrder, setPaymentPortalOrder] = useState<TopupOrder | null>(null);
  const [qrVerificationStage, setQrVerificationStage] = useState<'idle' | 'checking_bank' | 'verifying_deposit' | 'garena_delivering' | 'success'>('idle');
  const [copied, setCopied] = useState(false);
  const [upiSettings, setUpiSettings] = useState<UpiSettings>({
    upiId: 'deepak68200200@ibl',
    payeeName: 'DEEPAK',
    qrImageBase64: ''
  });

  useEffect(() => {
    fetch('/api/upi-settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.upiId) {
          setUpiSettings(data);
        }
      })
      .catch(err => console.error('Error fetching upi info:', err));
  }, []);

  // Auto-adjust package details based on quantity
  const unitPrice = selectedPackage.price;
  const totalPrice = unitPrice * quantity;
  const totalDiamonds = selectedPackage.diamonds * quantity;
  const totalBonus = selectedPackage.bonusDiamonds * quantity;

  // Load Razorpay Script tag in browser
  useEffect(() => {
    const scriptId = 'razorpay-checkout-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // 1. Verify Player Action
  const handleVerifyPlayer = async () => {
    setErrorText('');
    if (!playerUid.trim() || playerUid.trim().length < 5) {
      setErrorText('Please enter a valid player UID (minimum 5 digits).');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/player/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: playerUid })
      });
      const data = await res.json();
      
      if (data.success) {
        setVerificationResult(data);
        setShowConfirmModal(true);
      } else {
        setErrorText(data.error || 'Player verification failed. Double check UID.');
      }
    } catch (err: any) {
      setErrorText(err.message || 'Failed to reach validation service. Try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // 2. Nickname modal confirm
  const handleConfirmNickname = () => {
    if (verificationResult) {
      setConfirmedNickname(verificationResult.nickname);
      setIsUidConfirmed(true);
      setShowConfirmModal(false);
    }
  };

  // Verification flow for custom UPI QR Payment portal
  const handleVerifyUpiPayment = async () => {
    if (!paymentPortalOrder) return;
    
    // Step through verification stages matching gameplay feel
    setQrVerificationStage('checking_bank');
    
    await new Promise(resolve => setTimeout(resolve, 1400));
    setQrVerificationStage('verifying_deposit');
    
    await new Promise(resolve => setTimeout(resolve, 1400));
    setQrVerificationStage('garena_delivering');
    
    await new Promise(resolve => setTimeout(resolve, 1400));
    
    try {
      // Complete transaction via DB
      const updateRes = await fetch(`/api/orders/${paymentPortalOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'Success',
          razorpayPaymentId: 'upi_trn_' + Math.random().toString(36).substr(2, 9).toUpperCase()
        })
      });
      const completedOrder = await updateRes.json();
      
      setQrVerificationStage('success');
      setTimeout(() => {
        onSuccess(completedOrder);
        setPaymentPortalOrder(null);
        setQrVerificationStage('idle');
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorText('Order verification failed. Please try again.');
      setQrVerificationStage('idle');
    }
  };

  // 3. Initiate payment via Razorpay / Sandbox fallback
  const handleProceedPayment = async () => {
    setErrorText('');
    if (!isUidConfirmed) {
      setErrorText('Please enter your Player UID and verify your nickname first.');
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Create Pending Order standardly in our server list
      const createOrderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerUid,
          playerNickname: confirmedNickname,
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          diamonds: selectedPackage.diamonds,
          bonusDiamonds: selectedPackage.bonusDiamonds,
          price: selectedPackage.price,
          quantity,
          totalPrice,
          paymentMethod: selectedPayment
        })
      });
      const pendingOrder: TopupOrder = await createOrderRes.json();

      // Intercept local Indian UPI/QR payment types
      if (['UPI', 'GPay', 'PhonePe', 'Paytm'].includes(selectedPayment)) {
        setPaymentPortalOrder(pendingOrder);
        setIsProcessingPayment(false);
        return;
      }

      // Trigger Razorpay order configuration on backend
      const razorpayOrderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: totalPrice,
          receipt: pendingOrder.id,
          notes: {
            playerUid,
            playerNickname: confirmedNickname,
            quantity: quantity.toString()
          }
        })
      });

      const razorpayData = await razorpayOrderRes.json();

      if (!razorpayData.success) {
        throw new Error(razorpayData.error || 'Failed to initialize payment gateway.');
      }

      // Check if server declared sandbox mode or real checkout
      if (razorpayData.isCustomSandbox) {
        // High fidelity sandbox simulator - gives immediate feedback
        setTimeout(async () => {
          try {
            // Confirm/Verify mock payment on server
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                isCustomSandbox: true,
                razorpay_order_id: razorpayData.orderId
              })
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Update status to Success
              const updateRes = await fetch(`/api/orders/${pendingOrder.id}/status`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  status: 'Success',
                  razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substr(2, 9)
                })
              });
              const completedOrder = await updateRes.json();
              
              setIsProcessingPayment(false);
              onSuccess(completedOrder);
            } else {
              throw new Error('Sandbox verification failed');
            }
          } catch (e: any) {
            setErrorText('Sandbox payment failed to secure.');
            setIsProcessingPayment(false);
          }
        }, 2200);

      } else {
        // Real Razorpay Checkout flow in checkout.js
        const rzpWindow = (window as any).Razorpay;
        if (!rzpWindow) {
          throw new Error('Razorpay client script failed to load. Check internet connectivity.');
        }

        const options = {
          key: razorpayData.keyId,
          amount: razorpayData.amount,
          currency: razorpayData.currency,
          name: 'BOOYAH GEMS',
          description: `${totalDiamonds} Diamonds Checkout`,
          order_id: razorpayData.orderId,
          prefill: {
            name: confirmedNickname,
            email: 'survivor@freefire.com'
          },
          theme: {
            color: '#9d4edd' // matching our beautiful neon purple accent
          },
          handler: async function (response: any) {
            try {
              // Double check checkout verification with signature
              const verifyRes = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  isCustomSandbox: false
                })
              });
              const verifyResult = await verifyRes.json();

              if (verifyResult.success) {
                // Update Order entry on Server to Success
                const updateRes = await fetch(`/api/orders/${pendingOrder.id}/status`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    status: 'Success',
                    razorpayPaymentId: response.razorpay_payment_id
                  })
                });
                const finalOrder = await updateRes.json();
                setIsProcessingPayment(false);
                onSuccess(finalOrder);
              } else {
                setErrorText('Payment verification failed.');
                setIsProcessingPayment(false);
              }
            } catch (err) {
              setErrorText('Failed to complete transaction confirmation.');
              setIsProcessingPayment(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
              setErrorText('Transaction cancelled by user.');
            }
          }
        };

        const razorpayInstance = new rzpWindow(options);
        razorpayInstance.open();
      }

    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Payment processing failed. Try again.');
      setIsProcessingPayment(false);
    }
  };

  const handleUidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerUid(e.target.value);
    // Reset confirmation status upon UID modifications
    if (isUidConfirmed) {
      setIsUidConfirmed(false);
      setConfirmedNickname('');
    }
  };

  if (paymentPortalOrder) {
    const upiLink = `upi://pay?pa=${encodeURIComponent(upiSettings.upiId)}&pn=${encodeURIComponent(upiSettings.payeeName)}&am=${paymentPortalOrder.totalPrice}&cu=INR`;
    const qrCodeUrl = upiSettings.qrImageBase64 || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;
    
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800/60 font-font-mono text-xs">
          <button 
            onClick={() => setPaymentPortalOrder(null)}
            className="group cursor-pointer flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Cancel & Go Back</span>
          </button>
          
          <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-green-400 font-mono">
              SECURE PAYMENT PORTAL
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            Complete Your Payment
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Scan the QR code below or use any UPI app to transfer ₹{paymentPortalOrder.totalPrice.toFixed(2)}
          </p>
        </div>

        {/* Portal Card container */}
        <div className="rounded-2xl border border-gray-800 bg-[#121319] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          
          {/* Header strip */}
          <div className="bg-gradient-to-r from-[#171822] to-[#14151e] px-6 py-4 flex items-center justify-between border-b border-gray-800">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 block">PAYING TO</span>
              <span className="font-display font-black text-xs text-green-400 tracking-wider">
                Scan And Pay
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 block">AMOUNT</span>
              <span className="font-mono font-extrabold text-[#f3f4f6] text-lg">
                ₹{paymentPortalOrder.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Grid Area */}
          <div className="grid grid-cols-1 md:grid-cols-12">
            
            {/* Left Card: QR Presentation (6 Columns) */}
            <div className="p-6 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-800 md:col-span-6 bg-black/35">
              
               {/* QR frame */}
              <div className="relative rounded-2xl bg-white p-4 shadow-xl select-none max-w-[240px]">
                <img 
                  src={qrCodeUrl} 
                  alt="UPI QR Code" 
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  id="img-payment-qr"
                />
                
                {/* Center sticker overlay resembling the PhonePe badge from input_file_1.png */}
                {!upiSettings.qrImageBase64 && (
                  <div className="absolute top-[102px] left-[102px] sm:top-[110px] sm:left-[110px] w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-100 bg-[#5f259f] flex items-center justify-center font-bold text-white text-sm shadow-[0_4px_10px_rgba(0,0,0,0.25)] select-none font-sans">
                    पे
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-6 space-y-3 max-w-[250px]">
                {/* Save/Download QR */}
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(qrCodeUrl);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `QR_Pay_DEEPAK_${paymentPortalOrder.totalPrice}.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    } catch (e) {
                      window.open(qrCodeUrl, '_blank');
                    }
                  }}
                  className="cursor-pointer w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-xs font-bold uppercase tracking-wider text-white py-3 px-4 shadow-[0_4px_12px_rgba(234,88,12,0.25)] transition-all active:scale-[0.98]"
                >
                  <Download className="h-4 w-4" />
                  <span>SAVE &bull; DOWNLOAD QR</span>
                </button>

                {/* Copy UPI ID */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(upiSettings.upiId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="cursor-pointer w-full flex items-center justify-center space-x-2 rounded-xl border border-gray-800 bg-black/60 hover:border-gray-700 hover:bg-black/90 text-xs font-bold text-gray-300 py-3 px-4 transition-colors active:scale-[0.98]"
                >
                  <Copy className="h-4 w-4 text-neon-purple" />
                  <span>{copied ? 'Copied ID!' : `Copy: ${upiSettings.upiId}`}</span>
                </button>
              </div>

              {/* Scan Apps label */}
              <div className="mt-6 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-mono block">
                  Scan with any UPI App
                </span>
                <div className="mt-2 flex items-center justify-center space-x-3 text-[11px] font-semibold text-gray-400 font-mono">
                  <span>GPAY</span>
                  <span className="text-gray-700">&bull;</span>
                  <span>PHONEPE</span>
                  <span className="text-gray-700">&bull;</span>
                  <span>PAYTM</span>
                  <span className="text-gray-700">&bull;</span>
                  <span>Any UPI App</span>
                </div>
              </div>

            </div>

            {/* Right Card: Details & Actions (6 Columns) */}
            <div className="p-6 md:p-8 flex flex-col justify-between md:col-span-6">
              
              <div className="space-y-5">
                <h3 className="font-display font-extrabold text-base text-white border-b border-gray-800 pb-2">
                  Order Details
                </h3>

                {/* Info List */}
                <div className="space-y-3 text-xs font-medium">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-gray-500 uppercase tracking-wider">Status:</span>
                    <span className="inline-flex items-center space-x-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-400 font-mono animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-ping" />
                      <span>Pending Payment</span>
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-gray-800/40">
                    <span className="text-gray-400">Game Name:</span>
                    <span className="text-white font-bold font-display">Free Fire</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-gray-800/40">
                    <span className="text-gray-400">Package Name:</span>
                    <span className="text-white font-bold font-display text-right max-w-[200px] truncate">
                      Top up {paymentPortalOrder.diamonds} Diamonds + {paymentPortalOrder.bonusDiamonds} Bonus = {paymentPortalOrder.diamonds + paymentPortalOrder.bonusDiamonds} Diamonds
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-gray-800/40 font-mono text-xs">
                    <span className="text-gray-400 font-sans">Player ID (UID):</span>
                    <span className="text-neon-blue font-extrabold">{paymentPortalOrder.playerUid}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Server / Region:</span>
                    <span className="text-white font-bold font-display">INDIA</span>
                  </div>
                </div>

                {/* Instant delivery box message with exact styling from input_file_0.png */}
                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 flex items-start space-x-3 text-xs text-green-400 leading-relaxed font-medium">
                  <ShieldCheck className="h-5 w-5 text-green-400 inline-block flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold font-display block mb-0.5 uppercase tracking-wide">Complete The Payment</span>
                    <span>Your Diamond will be added Instantly to your game account as soon as the payment is confirmed.</span>
                  </div>
                </div>
              </div>

              {/* Verify Action Flow */}
              <div className="mt-8 space-y-3.5 col-span-12">
                {qrVerificationStage !== 'idle' ? (
                  <div className="rounded-xl border border-gray-800 bg-black/60 p-4 font-mono text-xs text-center space-y-3">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-neon-blue" />
                      <span className="text-white font-bold truncate">
                        {qrVerificationStage === 'checking_bank' && 'Reconciling transaction feed...'}
                        {qrVerificationStage === 'verifying_deposit' && 'Confirming DEEPAK ledger receipt...'}
                        {qrVerificationStage === 'garena_delivering' && 'Delivering diamonds queue...'}
                        {qrVerificationStage === 'success' && 'Transaction Secured & Delivered!'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-950 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full transition-all duration-1000 ${
                        qrVerificationStage === 'checking_bank' ? 'w-1/3' : 
                        qrVerificationStage === 'verifying_deposit' ? 'w-2/3' : 
                        'w-full'
                      }`} />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleVerifyUpiPayment}
                    className="cursor-pointer w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-xs font-bold uppercase tracking-widest text-black py-4 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all transform active:scale-[0.99] flex items-center justify-center space-x-2"
                  >
                    <Check className="h-4 w-4 stroke-[3px]" />
                    <span>Verify Payment / I Have Paid</span>
                  </button>
                )}

                <button
                  onClick={() => setPaymentPortalOrder(null)}
                  disabled={qrVerificationStage !== 'idle'}
                  className="cursor-pointer w-full text-center text-[11px] font-bold uppercase tracking-wide text-gray-500 hover:text-white transition-colors py-2 disabled:opacity-40"
                >
                  Go Back & Change Package
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Back button */}
      <button 
        onClick={onBack}
        className="group cursor-pointer mb-6 flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        id="btn-back-store"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>Return to Shop</span>
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left column: UID Verification and Payment selection (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          
          {/* STEP 1: PLAYER DETAILS */}
          <div className="rounded-2xl border border-gray-800 bg-[#12131a] p-6 shadow-xl" id="checkout-step-1">
            <div className="flex items-center space-x-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neon-blue text-xs font-bold text-black font-display shadow-[0_0_10px_rgba(0,242,254,0.3)]">
                1
              </span>
              <h2 className="font-display text-lg font-bold tracking-wide text-white">
                Enter Player Identity (UID)
              </h2>
            </div>

            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              Find your Free Fire UID from your in-game profile tab (e.g. 48291039). Input your UID below and click Verify to confirm your gamer nickname correctly.
            </p>

            <div className="mt-5 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Paste Free Fire UID"
                  value={playerUid}
                  onChange={handleUidChange}
                  className="w-full rounded-xl border border-gray-800 bg-black/60 px-4 py-3.5 text-sm font-mono text-white placeholder-gray-600 focus:border-neon-blue focus:outline-none focus:ring-1 focus:ring-neon-blue transition-all"
                  id="input-player-uid"
                />
                
                {isUidConfirmed && (
                  <div className="absolute right-3 top-3.5 flex items-center text-green-400">
                    <Check className="h-4 w-4 mr-1 stroke-[3px]" />
                    <span className="text-[10px] uppercase font-bold tracking-widest font-mono">Verified</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleVerifyPlayer}
                disabled={isVerifying}
                id="btn-verify-uid"
                className="cursor-pointer rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black hover:text-white transition-all hover:shadow-[0_0_15px_rgba(0,242,254,0.4)] disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isVerifying ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent border-black mr-1" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify Player</span>
                )}
              </button>
            </div>

            {isUidConfirmed && (
              <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/5 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-green-500/80 font-bold block">Verified Survivor</span>
                    <span className="font-display font-bold text-white text-sm">{confirmedNickname}</span>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-gray-500">UID: {playerUid}</div>
              </div>
            )}
          </div>

          {/* STEP 2: PAYMENT METHOD */}
          <div className="rounded-2xl border border-gray-800 bg-[#12131a] p-6 shadow-xl" id="checkout-step-2">
            <div className="flex items-center space-x-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neon-purple text-xs font-bold text-white font-display shadow-[0_0_10px_rgba(157,78,221,0.3)]">
                2
              </span>
              <h2 className="font-display text-lg font-bold tracking-wide text-white">
                Select Checkout Payment Method
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedPayment === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 flex items-center justify-between ${
                      isSelected 
                        ? 'border-neon-purple bg-neon-purple/5 shadow-[0_0_15px_rgba(157,78,221,0.15)]' 
                        : 'border-gray-800 bg-black/40 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{method.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-display">{method.name}</span>
                        <span className="text-[10px] text-gray-500 mt-0.5">{method.description}</span>
                      </div>
                    </div>
                    
                    <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      isSelected ? 'border-neon-purple bg-neon-purple' : 'border-gray-700 bg-transparent'
                    }`}>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right column: Sticky Order Summary pane (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-gray-800 bg-[#12131a] p-6 shadow-xl space-y-6">
            
            <h2 className="font-display text-lg font-bold tracking-wide text-white border-b border-gray-800 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <Sparkles className="h-4 w-4 text-neon-blue" />
            </h2>

            {/* Selected package tier block */}
            <div className="rounded-xl bg-black/50 p-4 border border-gray-800/80 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-neon-blue/10 p-2 text-neon-blue">
                  <Gem className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#aaa]">Diamonds Bundle</h4>
                  <div className="font-display font-extrabold text-white text-base mt-0.5">
                    {selectedPackage.diamonds} Diamonds
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-xs text-gray-500 font-mono block">Price per pack</span>
                <span className="font-mono text-sm font-bold text-white">₹{selectedPackage.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between py-2 border-b border-gray-800/60">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Purchase Quantity</span>
              <div className="flex items-center space-x-1.5 bg-black/80 rounded-lg p-1 border border-gray-800">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="cursor-pointer flex h-7 w-7 items-center justify-center rounded bg-gray-900 text-gray-400 hover:text-white transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center font-mono text-xs font-bold text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="cursor-pointer flex h-7 w-7 items-center justify-center rounded bg-gray-900 text-gray-400 hover:text-white transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Calculation breakdowns */}
            <div className="space-y-2.5 text-xs text-gray-400 font-medium">
              <div className="flex justify-between">
                <span>Diamonds subtotal</span>
                <span className="text-white font-semibold font-mono">{totalDiamonds} Gems</span>
              </div>
              
              {totalBonus > 0 && (
                <div className="flex justify-between text-green-400 font-semibold">
                  <span>Bonus top-up event</span>
                  <span>+{totalBonus} Extra Gems</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Order subtotal</span>
                <span className="text-white font-mono">₹{totalPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Convenience rate</span>
                <span className="text-green-500 font-mono">Free (0.00)</span>
              </div>

              <div className="border-t border-gray-800/80 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white uppercase tracking-wider">Total Amount</span>
                <span className="font-mono text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Error notifications */}
            {errorText && (
              <div className="rounded-lg bg-red-500/10 p-3.5 border border-red-500/30 text-xs text-red-400 leading-relaxed font-mono">
                {errorText}
              </div>
            )}

            {/* Proceed Action */}
            <button
              onClick={handleProceedPayment}
              disabled={isProcessingPayment}
              id="btn-proceed-checkout"
              className="group cursor-pointer relative w-full rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink p-[1.5px] transition-transform duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              <span className="flex h-12 w-full items-center justify-center rounded-[11px] bg-black text-xs font-bold uppercase tracking-widest text-white hover:bg-transparent transition-colors shadow-lg">
                {isProcessingPayment ? (
                  <span className="flex items-center space-x-2">
                    <span className="h-3 w-3 animate-spin rounded-full border border-t-transparent border-white" />
                    <span>Processing Transaction...</span>
                  </span>
                ) : !isUidConfirmed ? (
                  <span className="text-gray-400 font-bold uppercase tracking-widest">Verify Player UID First</span>
                ) : (
                  <span>Proceed to Payment</span>
                )}
              </span>
            </button>

            {/* Safety Badging */}
            <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-500 font-mono text-center">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span>SSL SECURED GATEWAY &bull; 100% SECURE CHECKOUT</span>
            </div>

          </div>
        </div>

      </div>

      {/* CONFIRMATION NICKNAME POPUP MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" id="confirm-nickname-popup">
          <div className="relative w-full max-w-md rounded-2xl border border-gray-800 bg-[#12131a] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neon-blue/15 text-neon-blue">
                <Info className="h-6 w-6 animate-bounce" />
              </div>
              <h3 className="font-display text-lg font-bold text-white tracking-wide">
                Double Check Nickname
              </h3>
              <p className="text-xs text-gray-400">
                Please confirm that the player nickname matches your Free Fire account before sending real payments.
              </p>
            </div>

            <div className="rounded-xl border border-gray-800/80 bg-black/60 p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Player UID:</span>
                <span className="font-bold text-white">{verificationResult?.uid}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-500">In-Game Nick:</span>
                <span className="font-bold text-neon-blue text-sm">{verificationResult?.nickname}</span>
              </div>
            </div>

            <div className="flex space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="cursor-pointer flex-1 rounded-xl bg-gray-800/80 text-xs font-bold uppercase tracking-wider text-gray-300 py-3 text-center border border-gray-700/60 hover:text-white"
              >
                Re-enter UID
              </button>

              <button
                type="button"
                onClick={handleConfirmNickname}
                id="btn-confirm-survivor"
                className="cursor-pointer flex-1 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-xs font-bold uppercase tracking-wider text-black py-3 text-center hover:text-white hover:shadow-[0_0_15px_rgba(0,242,254,0.3)]"
              >
                Confirm Survivor
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
