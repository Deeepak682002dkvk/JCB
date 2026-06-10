/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Plus, Edit, Trash2, Coins, Gem, Check, Clock, TrendingUp, 
  Layers, ShoppingBag, X, RefreshCw, LayoutDashboard, Database, CheckCircle, HelpCircle,
  QrCode, Upload
} from 'lucide-react';
import { DiamondPackage, TopupOrder, AdminStats, UpiSettings, LookupApiConfig } from '../types';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'packages' | 'orders' | 'upi' | 'api'>('packages');
  const [upiSettings, setUpiSettings] = useState<UpiSettings | null>(null);
  const [isSavingUpi, setIsSavingUpi] = useState(false);
  const [upiSuccessMessage, setUpiSuccessMessage] = useState('');
  const [upiErrorMessage, setUpiErrorMessage] = useState('');

  const [apiConfig, setApiConfig] = useState<LookupApiConfig | null>(null);
  const [isSavingApi, setIsSavingApi] = useState(false);
  const [apiSuccessMessage, setApiSuccessMessage] = useState('');
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  
  // List states
  const [packages, setPackages] = useState<DiamondPackage[]>([]);
  const [orders, setOrders] = useState<TopupOrder[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0,
    totalOrders: 0,
    successfulOrders: 0,
    pendingOrders: 0
  });

  // UI / Load indicators
  const [isLoading, setIsLoading] = useState(false);
  const [savingPackage, setSavingPackage] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  
  // Create / Edit package form state
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [formPkgId, setFormPkgId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDiamonds, setFormDiamonds] = useState(100);
  const [formBonusDiamonds, setFormBonusDiamonds] = useState(10);
  const [formPrice, setFormPrice] = useState(80);
  const [formImage, setFormImage] = useState('diamond_single');
  const [formTag, setFormTag] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch metrics data
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const pkgRes = await fetch('/api/packages');
      const pkgs = await pkgRes.json();
      setPackages(pkgs);

      const ordRes = await fetch('/api/orders');
      const ords = await ordRes.json();
      setOrders(ords);

      const statsRes = await fetch('/api/admin/stats');
      const metricStats = await statsRes.json();
      setStats(metricStats);

      const upiRes = await fetch('/api/upi-settings');
      const upi_data = await upiRes.json();
      setUpiSettings(upi_data);

      const apiRes = await fetch('/api/admin/api-config');
      const api_data = await apiRes.json();
      setApiConfig(api_data);
    } catch (err) {
      console.error('Failed to pull admin records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // 1. Delete Package
  const handleDeletePackage = async (id: string) => {
    if (!window.confirm('Are you select delete this diamond package? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/packages/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setPackages(prev => prev.filter(p => p.id !== id));
        loadAdminData();
      } else {
        alert(data.error || 'Failed to delete package.');
      }
    } catch (err) {
      alert('Delete package network failure.');
    }
  };

  // 2. Load Package for Edit Modal
  const handleOpenEdit = (pkg: DiamondPackage) => {
    setFormMode('edit');
    setFormPkgId(pkg.id);
    setFormName(pkg.name);
    setFormDiamonds(pkg.diamonds);
    setFormBonusDiamonds(pkg.bonusDiamonds);
    setFormPrice(pkg.price);
    setFormImage(pkg.image);
    setFormTag(pkg.tag || '');
    setErrorMsg('');
    setPackageModalOpen(true);
  };

  // 3. Open empty Add Modal
  const handleOpenAdd = () => {
    setFormMode('add');
    setFormPkgId('ff_' + Math.random().toString(36).substr(2, 5));
    setFormName('New Shard Pack');
    setFormDiamonds(100);
    setFormBonusDiamonds(10);
    setFormPrice(80);
    setFormImage('diamond_single');
    setFormTag('');
    setErrorMsg('');
    setPackageModalOpen(true);
  };

  // 4. Save form (Add/Edit)
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formName.trim()) {
      setErrorMsg('Package title name is required.');
      return;
    }
    if (formDiamonds <= 0 || formPrice <= 0) {
      setErrorMsg('Diamonds volume and Price must be more than zero.');
      return;
    }

    setSavingPackage(true);
    try {
      const payload: DiamondPackage = {
        id: formPkgId,
        name: formName,
        diamonds: formDiamonds,
        bonusDiamonds: formBonusDiamonds,
        price: formPrice,
        image: formImage,
        tag: formTag ? formTag : undefined
      };

      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const saved = await res.json();
      
      if (saved.id) {
        setPackageModalOpen(false);
        loadAdminData();
      } else {
        setErrorMsg(saved.error || 'Failed to write package record.');
      }
    } catch (err) {
      setErrorMsg('Connection error editing package.');
    } finally {
      setSavingPackage(false);
    }
  };

  // 5. Change Order Status (e.g. mark Success / Pending / Failed)
  const handleOrderStatusUpdate = async (orderId: string, status: TopupOrder['status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          razorpayPaymentId: status === 'Success' ? 'pay_admin_force_success_' + Math.random().toString(36).substr(2, 5) : undefined
        })
      });
      const updated = await res.json();
      if (updated.id) {
        // Reload dashboard
        loadAdminData();
      } else {
        alert(updated.error || 'Status override rejected.');
      }
    } catch (err) {
      alert('Status change connection failed.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header and Control */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-neon-orange font-mono text-xs uppercase tracking-wider">
            <Database className="h-4 w-4" />
            <span>Admin Secure Console</span>
          </div>
          <h1 className="font-display text-2xl font-black text-white sm:text-3xl tracking-wide mt-1">
            CONTROL CENTER DASHBOARD
          </h1>
        </div>

        <button
          onClick={loadAdminData}
          disabled={isLoading}
          id="btn-admin-sync"
          className="cursor-pointer flex items-center space-x-1.5 rounded-lg border border-gray-800 bg-black/60 px-4 py-2.5 text-xs text-gray-400 hover:text-white transition-all duration-200"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reload Metrics</span>
        </button>
      </div>

      {/* METRICS STATS BLOCKS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Revenue */}
        <div className="rounded-xl border border-gray-850 bg-[#12131a] p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
            <TrendingUp className="h-16 w-16" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-green-500/10 p-2 text-green-400 border border-green-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Revenue</span>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            ₹{stats.totalRevenue.toFixed(2)}
          </p>
          <span className="text-[10px] text-gray-600 block mt-1">Sum of all Success status payments</span>
        </div>

        {/* Total Orders */}
        <div className="rounded-xl border border-gray-850 bg-[#12131a] p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
            <ShoppingBag className="h-16 w-16" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-neon-blue/10 p-2 text-neon-blue border border-neon-blue/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-white">
            {stats.totalOrders}
          </p>
          <span className="text-[10px] text-gray-600 block mt-1">Pending + Successful top-ups</span>
        </div>

        {/* Delivered success */}
        <div className="rounded-xl border border-gray-850 bg-[#12131a] p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
            <CheckCircle className="h-16 w-16" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Delivered (Success)</span>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-emerald-400">
            {stats.successfulOrders}
          </p>
          <span className="text-[10px] text-gray-600 block mt-1">Cleared in-game credits</span>
        </div>

        {/* Pending Processing */}
        <div className="rounded-xl border border-gray-850 bg-[#12131a] p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
            <Clock className="h-16 w-16" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-neon-orange/10 p-2 text-neon-orange border border-neon-orange/20">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Awaiting Verification</span>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold text-neon-orange animate-pulse">
            {stats.pendingOrders}
          </p>
          <span className="text-[10px] text-gray-600 block mt-1">Orders requiring action overview</span>
        </div>

      </div>

      {/* TABS SWITCHER FOR WORKSpace */}
      <div className="flex space-x-4 border-b border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('packages')}
          id="tab-admin-packages"
          className={`cursor-pointer px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border-b-2 ${
            activeTab === 'packages'
              ? 'border-neon-blue text-neon-blue font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Manage Packages ({packages.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          id="tab-admin-orders"
          className={`cursor-pointer px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border-b-2 ${
            activeTab === 'orders'
              ? 'border-neon-orange text-neon-orange font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Customer Orders Feed ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('upi')}
          id="tab-admin-upi"
          className={`cursor-pointer px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border-b-2 ${
            activeTab === 'upi'
              ? 'border-green-400 text-green-400 font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          UPI & QR Gateway Config
        </button>

        <button
          onClick={() => setActiveTab('api')}
          id="tab-admin-api"
          className={`cursor-pointer px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border-b-2 ${
            activeTab === 'api'
              ? 'border-neon-pink text-neon-pink font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Player Lookup API Config
        </button>
      </div>

      {/* VIEW PANE CONTAINER */}
      <div>
        
        {/* TAB 1: MANAGE PACKAGES TABLE ROW */}
        {activeTab === 'packages' && (
          <div className="space-y-4" id="view-admin-packages">
            <div className="flex justify-between items-center bg-black/40 p-4 border border-gray-800 rounded-xl">
              <span className="text-xs text-gray-400 font-mono">Create, alter prices, and define gaming top-up bundles below.</span>
              <button
                onClick={handleOpenAdd}
                id="btn-add-package"
                className="cursor-pointer flex items-center space-x-1.5 rounded-lg bg-neon-blue px-3.5 py-2 text-xs font-bold text-black hover:text-white transition-all hover:shadow-[0_0_10px_rgba(0,242,254,0.3)]"
              >
                <Plus className="h-4 w-4 stroke-[3px]" />
                <span>Add Package</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#12131a]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-800 bg-[#191b26] text-gray-400 uppercase font-mono tracking-wider font-semibold">
                    <th className="p-4">Package ID</th>
                    <th className="p-4">Package Name</th>
                    <th className="p-4">Diamonds Volume</th>
                    <th className="p-4">Bonus Diamonds</th>
                    <th className="p-4">Price (INR)</th>
                    <th className="p-4">Badge / Tag</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/65 font-medium">
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-800/15 transition-colors">
                      <td className="p-4 font-mono text-gray-500">{pkg.id}</td>
                      <td className="p-4 text-white font-semibold font-display">{pkg.name}</td>
                      <td className="p-4 font-semibold text-neon-blue font-mono">{pkg.diamonds} Gems</td>
                      <td className="p-4 font-mono">
                        {pkg.bonusDiamonds > 0 ? (
                          <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">+{pkg.bonusDiamonds} Bonus</span>
                        ) : (
                          <span className="text-gray-600">&mdash;</span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-white text-sm">₹{pkg.price.toFixed(2)}</td>
                      <td className="p-4">
                        {pkg.tag ? (
                          <span className="bg-neon-purple/20 text-neon-purple text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-neon-purple/30">
                            {pkg.tag}
                          </span>
                        ) : (
                          <span className="text-gray-600">&mdash;</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => handleOpenEdit(pkg)}
                            className="cursor-pointer text-gray-400 hover:text-neon-blue p-1 rounded hover:bg-gray-800/30 transition-colors"
                            title="Edit bundle price/diamonds"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="cursor-pointer text-gray-400 hover:text-red-400 p-1 rounded hover:bg-gray-800/30 transition-colors"
                            title="Delete top-up package"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {packages.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">
                        No active bundles. Insert package values default above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOMER ORDERS FEED LISTING */}
        {activeTab === 'orders' && (
          <div className="space-y-4" id="view-admin-orders">
            <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#12131a]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-800 bg-[#191b26] text-gray-400 uppercase font-mono tracking-wider font-semibold font-small">
                    <th className="p-4">OrderID</th>
                    <th className="p-4">Survivor Details</th>
                    <th className="p-4">Bundle Item</th>
                    <th className="p-4">Qty</th>
                    <th className="p-4">Total Paid</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Delivery Node</th>
                    <th className="p-4 text-center whitespace-nowrap">Status Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/65 font-medium text-[11px]">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-800/15 transition-colors">
                      <td className="p-4 font-mono text-gray-500 whitespace-nowrap">
                        {ord.id}
                        <span className="block text-[9px] text-[#555] mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="p-4 space-y-0.5">
                        <div className="text-white font-semibold flex items-center font-display text-[12px]">
                          {ord.playerNickname}
                        </div>
                        <div className="font-mono text-gray-500 text-[10px]">
                          UID: {ord.playerUid}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-white font-semibold">
                          {(ord.diamonds * ord.quantity) + (ord.bonusDiamonds * ord.quantity)} Gems
                        </div>
                        <div className="text-[10px] text-gray-500 italic mt-0.5">
                          {ord.packageName}
                        </div>
                      </td>

                      <td className="p-4 font-mono text-gray-400 text-sm">{ord.quantity}x</td>

                      <td className="p-4 font-mono font-bold text-white text-sm">
                        ₹{ord.totalPrice.toFixed(2)}
                        <span className="block text-[9px] text-neon-blue font-semibold uppercase mt-0.5">
                          {ord.paymentMethod}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          ord.status === 'Success' 
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : ord.status === 'Failed'
                            ? 'border-red-500/30 bg-red-500/10 text-red-400'
                            : 'border-orange-500/30 bg-orange-500/10 text-neon-orange animate-pulse'
                        }`}>
                          {ord.status}
                        </span>
                      </td>

                      <td className="p-4 max-w-[120px] truncate">
                        {ord.status === 'Success' ? (
                          <div className="font-mono text-[9px] text-gray-500">
                            Ref: {ord.razorpayPaymentId?.substring(0, 15) || 'Manual_Bypassed'}...
                          </div>
                        ) : (
                          <div className="text-gray-600 font-mono text-[9px] italic">Awaiting Clearents</div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2">
                          {ord.status !== 'Success' && (
                            <button
                              onClick={() => handleOrderStatusUpdate(ord.id, 'Success')}
                              className="cursor-pointer flex items-center space-x-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black hover:font-bold border border-emerald-500/30 px-2 py-1 transition-all text-[10px]"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Authorize Deliver</span>
                            </button>
                          )}

                          {ord.status === 'Pending' && (
                            <button
                              onClick={() => handleOrderStatusUpdate(ord.id, 'Failed')}
                              className="cursor-pointer rounded border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 text-red-400 text-[10px] transition-all"
                            >
                              Cancel
                            </button>
                          )}

                          {ord.status === 'Success' && (
                            <span className="text-gray-600 text-[10px] italic">Cleared Delivery Lock</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500 font-mono">
                        No transactions registered yet. Complete a checkout to populate.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: UPI SETTINGS CONFIGURATION */}
        {activeTab === 'upi' && upiSettings && (
          <div className="space-y-6" id="view-admin-upi">
            <div className="rounded-xl border border-gray-800 bg-[#12131a] p-6 max-w-2xl mx-auto">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2 border-b border-gray-800 pb-2 flex items-center space-x-2">
                <QrCode className="h-4 w-4 text-green-400" />
                <span>UPI QR Payment Gateway Configuration</span>
              </h2>
              <p className="text-xs text-gray-400 mb-6">
                Define the merchant UPI credentials. You can also upload your static PhonePe, Paytm, or GooglePay QR Code card to ensure customers scan a genuine verified merchant QR code!
              </p>

              {upiSuccessMessage && (
                <div id="upi-success" className="mb-4 rounded bg-green-500/10 p-3 border border-green-500/30 text-xs text-green-400 font-semibold flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>{upiSuccessMessage}</span>
                </div>
              )}

              {upiErrorMessage && (
                <div id="upi-error" className="mb-4 rounded bg-red-500/10 p-3 border border-red-500/30 text-xs text-red-500 font-semibold">
                  {upiErrorMessage}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSavingUpi(true);
                  setUpiSuccessMessage('');
                  setUpiErrorMessage('');
                  try {
                    const res = await fetch('/api/upi-settings', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(upiSettings)
                    });
                    const saved = await res.json();
                    if (saved.upiId) {
                      setUpiSuccessMessage('UPI settings and custom QR Code saved successfully! Customers can now scan.');
                    } else {
                      setUpiErrorMessage(saved.error || 'Failed to save UPI specifications.');
                    }
                  } catch (err) {
                    setUpiErrorMessage('Connection failure while saving UPI settings.');
                  } finally {
                    setIsSavingUpi(false);
                  }
                }}
                className="space-y-5 text-xs font-semibold"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-bold">UPI ID (e.g. name@bank)</label>
                    <input
                      type="text"
                      required
                      value={upiSettings.upiId}
                      onChange={(e) => setUpiSettings({ ...upiSettings, upiId: e.target.value })}
                      className="w-full rounded border border-gray-800 bg-black/60 px-3 py-2.5 text-white focus:border-green-500 focus:outline-none"
                      placeholder="e.g. deepak68200200@ibl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-bold">Payee Beneficiary Name</label>
                    <input
                      type="text"
                      required
                      value={upiSettings.payeeName}
                      onChange={(e) => setUpiSettings({ ...upiSettings, payeeName: e.target.value })}
                      className="w-full rounded border border-gray-800 bg-black/60 px-3 py-2.5 text-white focus:border-green-500 focus:outline-none"
                      placeholder="e.g. DEEPAK"
                    />
                  </div>
                </div>

                {/* QR Code Upload Card */}
                <div className="border border-gray-850 bg-black/40 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Custom Merchant QR Code Card</span>
                    {upiSettings.qrImageBase64 ? (
                      <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Custom Image Active</span>
                    ) : (
                      <span className="text-[10px] text-gray-500 bg-gray-800/30 px-2 py-0.5 rounded-full">Default Generated Dynamic QR</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Upload button block */}
                    <div className="md:col-span-7">
                      <div className="relative border-2 border-dashed border-gray-800 hover:border-gray-700 rounded-xl p-6 transition-all bg-black/20 text-center flex flex-col items-center justify-center space-y-2 cursor-pointer">
                        <Upload className="h-6 w-6 text-gray-500 animate-pulse" />
                        <span className="text-xs text-gray-400 font-bold block">Drag & Drop or Tap To Upload QR Code</span>
                        <span className="text-[10px] text-gray-500 block">Accepts PNG, JPG, JPEG. Max 2MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                alert('Please upload an image smaller than 2MB.');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = () => {
                                setUpiSettings({
                                  ...upiSettings,
                                  qrImageBase64: reader.result as string
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Preview block */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center p-3 border border-gray-850 rounded-xl bg-black/40 min-h-[140px]">
                      {upiSettings.qrImageBase64 ? (
                        <div className="space-y-2 flex flex-col items-center">
                          <img
                            src={upiSettings.qrImageBase64}
                            alt="Custom QR Preview"
                            className="w-24 h-24 object-contain rounded border border-gray-800 p-1 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setUpiSettings({ ...upiSettings, qrImageBase64: '' })}
                            className="text-red-400 hover:text-red-300 text-[10px] font-bold uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded cursor-pointer"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <div className="text-center space-y-1 text-gray-400">
                          <QrCode className="h-8 w-8 mx-auto stroke-[1.25]" />
                          <span className="text-[10px] block font-medium">No custom QR uploaded. Will fallback to dynamic QR code deep link.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
                  <button
                    type="submit"
                    disabled={isSavingUpi}
                    className="cursor-pointer bg-green-500 text-black hover:bg-green-400 font-extrabold uppercase tracking-wider px-6 py-2.5 rounded-lg text-xs transition-colors shadow-[0_4px_12px_rgba(16,185,129,0.2)] disabled:opacity-50"
                  >
                    {isSavingUpi ? 'Saving Configurations...' : 'Save UPI & Gateway settings'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* TAB 4: PLAYER LOOKUP API CONFIGURATION */}
        {activeTab === 'api' && apiConfig && (
          <div className="space-y-6" id="view-admin-api">
            <div className="rounded-xl border border-gray-800 bg-[#12131a] p-6 max-w-2xl mx-auto">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2 border-b border-gray-800 pb-2 flex items-center space-x-2">
                <Database className="h-4 w-4 text-neon-pink" />
                <span>Free Fire Player Lookup API Configuration</span>
              </h2>
              <p className="text-xs text-gray-400 mb-6">
                Connect a custom third-party Free Fire Player Lookup API to automatically verify user UIDs. When configured, entering a UID on the shop page fetches their live in-game nickname instead of failing. Leave the API URL empty if you do not have an API yet.
              </p>

              {apiSuccessMessage && (
                <div id="api-success" className="mb-4 rounded bg-green-500/10 p-3 border border-green-500/30 text-xs text-green-400 font-semibold flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>{apiSuccessMessage}</span>
                </div>
              )}

              {apiErrorMessage && (
                <div id="api-error" className="mb-4 rounded bg-red-500/10 p-3 border border-red-500/30 text-xs text-red-500 font-semibold">
                  {apiErrorMessage}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSavingApi(true);
                  setApiSuccessMessage('');
                  setApiErrorMessage('');
                  try {
                    const res = await fetch('/api/admin/api-config', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(apiConfig)
                    });
                    const saved = await res.json();
                    if (saved) {
                      setApiSuccessMessage('Player Lookup API configuration saved successfully! UIDs will now be validated against this API.');
                    } else {
                      setApiErrorMessage('Failed to save API config.');
                    }
                  } catch (err) {
                    setApiErrorMessage('Connection error while saving API config.');
                  } finally {
                    setIsSavingApi(false);
                  }
                }}
                className="space-y-5 text-xs font-semibold"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-bold">API URL Endpoint</label>
                    <input
                      type="text"
                      value={apiConfig.apiUrl}
                      onChange={(e) => setApiConfig({ ...apiConfig, apiUrl: e.target.value })}
                      className="w-full rounded border border-gray-800 bg-black/60 px-3 py-2.5 text-white focus:border-neon-pink focus:outline-none focus:ring-1 focus:ring-neon-pink transition-all font-mono"
                      placeholder="e.g., https://api.example.com/freefire/lookup"
                    />
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                      Supports dynamic route formats. You can use placeholders like <code className="text-gray-300 font-mono">[uid]</code>, <code className="text-gray-300 font-mono">{"{uid}"}</code>, or <code className="text-gray-300 font-mono">:uid</code> in the URL directly, e.g. <code className="text-gray-400 font-mono">https://api.domain.com/player/[uid]</code>. If none is used, UID will be appended as a query parameter automatically.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-bold">Secret API Authorization Token / Key</label>
                    <input
                      type="text"
                      value={apiConfig.apiKey}
                      onChange={(e) => setApiConfig({ ...apiConfig, apiKey: e.target.value })}
                      className="w-full rounded border border-gray-800 bg-black/60 px-3 py-2.5 text-white focus:border-neon-pink focus:outline-none focus:ring-1 focus:ring-neon-pink transition-all font-mono"
                      placeholder="e.g. key_XXXXXXXXX"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-bold">UID Parameter Key</label>
                      <input
                        type="text"
                        required
                        value={apiConfig.uidParamName}
                        onChange={(e) => setApiConfig({ ...apiConfig, uidParamName: e.target.value })}
                        className="w-full rounded border border-gray-800 bg-black/60 px-3 py-2 text-white focus:border-neon-pink focus:outline-none"
                        placeholder="uid"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-bold">API Key Header Name</label>
                      <input
                        type="text"
                        value={apiConfig.apiKeyHeaderName}
                        onChange={(e) => setApiConfig({ ...apiConfig, apiKeyHeaderName: e.target.value })}
                        className="w-full rounded border border-gray-800 bg-black/60 px-3 py-2 text-white focus:border-neon-pink focus:outline-none"
                        placeholder="X-API-Key"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-bold">API Key Query Name</label>
                      <input
                        type="text"
                        value={apiConfig.apiKeyParamName}
                        onChange={(e) => setApiConfig({ ...apiConfig, apiKeyParamName: e.target.value })}
                        className="w-full rounded border border-gray-800 bg-black/60 px-3 py-2 text-white focus:border-neon-pink focus:outline-none"
                        placeholder="key"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
                  <button
                    type="submit"
                    disabled={isSavingApi}
                    className="cursor-pointer bg-neon-pink text-black hover:bg-pink-400 font-extrabold uppercase tracking-wider px-6 py-2.5 rounded-lg text-xs transition-colors shadow-[0_4px_12px_rgba(236,72,153,0.2)] disabled:opacity-50"
                  >
                    {isSavingApi ? 'Saving configs...' : 'Save API configurations'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* CREATE PACKAGE / EDIT PACKAGE MODAL ROW */}
      {packageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" id="package-editor-modal">
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-800 bg-[#12131a] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <header className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="font-display text-lg font-bold text-white tracking-wide uppercase">
                {formMode === 'add' ? 'Create Diamond Bundle' : 'Edit Top-Up Attributes'}
              </h3>
              <button 
                onClick={() => setPackageModalOpen(false)}
                className="cursor-pointer text-gray-500 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {errorMsg && (
              <div className="rounded bg-red-500/10 p-3 border border-red-500/30 text-xs text-red-400 font-mono">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSavePackage} className="space-y-4 text-xs font-medium">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Bundle ID (Unique)</label>
                  <input
                    type="text"
                    value={formPkgId}
                    onChange={(e) => setFormPkgId(e.target.value)}
                    disabled={formMode === 'edit'}
                    className="w-full rounded border border-gray-800 bg-black/60 px-3 py-2 text-white placeholder-gray-600 focus:border-neon-blue focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Bundle Display Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded border border-gray-800 bg-black/60 px-3 py-2 text-white focus:border-neon-blue focus:outline-none"
                    placeholder="e.g. Booyah Solo Bundle"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Diamonds Vol</label>
                  <input
                    type="number"
                    value={formDiamonds}
                    onChange={(e) => setFormDiamonds(parseInt(e.target.value) || 0)}
                    className="w-full rounded border border-gray-800 bg-black/60 px-3 py-2 text-white font-mono focus:border-neon-blue"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Bonus diamonds</label>
                  <input
                    type="number"
                    value={formBonusDiamonds}
                    onChange={(e) => setFormBonusDiamonds(parseInt(e.target.value) || 0)}
                    className="w-full rounded border border-gray-800 bg-black/60 px-3 py-2 text-white font-mono focus:border-neon-blue"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Price in INR</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    className="w-full rounded border border-gray-800 bg-black/60 px-3 py-2 text-white font-mono focus:border-neon-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Graphics Style Icon</label>
                  <select
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full rounded border border-gray-800 bg-black px-3 py-2 text-white"
                  >
                    <option value="diamond_single">Single Gem (Small)</option>
                    <option value="diamond_stack">Gems Stack (Medium)</option>
                    <option value="diamond_box">Gems Chest Box (Large)</option>
                    <option value="diamond_chest">Gamer Chest (Large+)</option>
                    <option value="diamond_pot">Pro Flame Pot (Elite)</option>
                    <option value="diamond_throne">Grandmaster Throne (Titan)</option>
                    <option value="card_weekly">Weekly Elite Pass Card</option>
                    <option value="card_monthly">Monthly Elite Pass Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Accent Badge Tag</label>
                  <input
                    type="text"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    placeholder="e.g. Best Offer, Bonus Pack"
                    className="w-full rounded border border-gray-800 bg-black/60 px-3 py-2 text-white focus:border-neon-blue"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-800/80">
                <button
                  type="button"
                  onClick={() => setPackageModalOpen(false)}
                  className="cursor-pointer rounded-lg bg-gray-800 hover:bg-gray-700 px-4 py-2.5 text-gray-300 font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPackage}
                  id="btn-admin-save-pkg"
                  className="cursor-pointer rounded-lg bg-neon-blue text-black font-extrabold uppercase tracking-wider px-5 py-2.5 hover:text-white"
                >
                  {savingPackage ? 'Writing Records...' : 'Save Bundle'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
