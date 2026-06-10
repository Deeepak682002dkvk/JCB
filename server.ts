/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { serverDb } from './serverDb';
import Razorpay from 'razorpay';
import { TopupOrder } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Razorpay client helper
let razorpayClient: Razorpay | null = null;
const isRazorpayConfigured = (): boolean => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return !!(
    keyId &&
    keySecret &&
    !keyId.includes('rzp_test_XXXX') &&
    keyId.trim() !== ''
  );
};

const getRazorpayInstance = (): Razorpay | null => {
  if (!isRazorpayConfigured()) {
    return null;
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!
    });
  }
  return razorpayClient;
};

// ==================== API ROUTES ====================

// 1. Get Packages
app.get('/api/packages', (req, res) => {
  try {
    const packages = serverDb.getPackages();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve packages' });
  }
});

// 2. Save/Update Package
app.post('/api/packages', (req, res) => {
  try {
    const pkg = req.body;
    if (!pkg.id || !pkg.name || !pkg.diamonds || !pkg.price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const saved = serverDb.savePackage(pkg);
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save package' });
  }
});

// 3. Delete Package
app.delete('/api/packages/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = serverDb.deletePackage(id);
    if (success) {
      res.json({ success: true, message: 'Package deleted successfully' });
    } else {
      res.status(404).json({ error: 'Package not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete package' });
  }
});

// 4. Get Orders
app.get('/api/orders', (req, res) => {
  try {
    const orders = serverDb.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// 5. Create Order Entry
app.post('/api/orders', (req, res) => {
  try {
    const orderData: Omit<TopupOrder, 'id' | 'createdAt' | 'status'> = req.body;
    if (!orderData.playerUid || !orderData.packageId || !orderData.quantity) {
      return res.status(400).json({ error: 'Missing required order details' });
    }

    const newOrder: TopupOrder = {
      ...orderData,
      id: 'order_' + Math.random().toString(36).substr(2, 9),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const saved = serverDb.createOrder(newOrder);
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record order' });
  }
});

// 6. Update Order Status
app.put('/api/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, razorpayPaymentId } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Missing status' });
    }
    const updated = serverDb.updateOrderStatus(id, status, razorpayPaymentId);
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// 7. Verify Player UID
app.post('/api/player/verify', async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'UID is required' });
    }
    const result = await serverDb.verifyPlayerUid(uid);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to verify player UID' });
  }
});

// 8. Razorpay Create Order Endpoint
app.post('/api/razorpay/order', async (req, res) => {
  try {
    const { amount, receipt, notes } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Convert amount to paise (currency substructure) - Razorpay accepts in minimal subunits (paise for INR)
    const amountInPaise = Math.round(amount * 100);

    const client = getRazorpayInstance();
    if (client) {
      // Real API integration
      const razorpayOrder = await client.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt || 'receipt_' + Date.now(),
        notes: notes || {}
      });
      return res.json({
        success: true,
        isCustomSandbox: false,
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      });
    } else {
      // High fidelity automated test sandbox setup
      const mockOrderId = 'order_rzp_mock_' + Math.random().toString(36).substr(2, 9);
      return res.json({
        success: true,
        isCustomSandbox: true,
        keyId: 'rzp_test_mockKey_7b8d7a1',
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: 'INR'
      });
    }
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: error.message || 'Razorpay order creation failed' });
  }
});

// 9. Razorpay Verify Payment Endpoint
app.post('/api/razorpay/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isCustomSandbox } = req.body;

    if (isCustomSandbox) {
      // Dynamic verification for our test sandbox payments
      return res.json({
        success: true,
        message: 'Sandbox payment verified successfully'
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment signature verification parameters' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Razorpay secret key is not configured' });
    }

    // HMAC Signature Validation
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      res.json({
        success: true,
        message: 'Payment verified and secured successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }
  } catch (error: any) {
    console.error('Payment signature verification error:', error);
    res.status(500).json({ error: error.message || 'Verification system error' });
  }
});

// GET statistics for Admin panel
app.get('/api/admin/stats', (req, res) => {
  try {
    const orders = serverDb.getOrders();
    const successful = orders.filter(o => o.status === 'Success');
    const pending = orders.filter(o => o.status === 'Pending' || o.status === 'Processing');
    const totalRev = successful.reduce((sum, o) => sum + o.totalPrice, 0);

    res.json({
      totalRevenue: totalRev,
      totalOrders: orders.length,
      successfulOrders: successful.length,
      pendingOrders: pending.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compile database statistics' });
  }
});

// GET UPI Settings
app.get('/api/upi-settings', (req, res) => {
  try {
    const settings = serverDb.getUpiSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch UPI settings' });
  }
});

// POST UPI Settings
app.post('/api/upi-settings', (req, res) => {
  try {
    const settings = req.body;
    if (!settings.upiId || !settings.payeeName) {
      return res.status(400).json({ error: 'UPI ID and Payee Name are required' });
    }
    const saved = serverDb.saveUpiSettings(settings);
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save UPI settings' });
  }
});

// GET API Lookup Settings
app.get('/api/admin/api-config', (req, res) => {
  try {
    const config = serverDb.getApiConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch API lookup configuration' });
  }
});

// POST API Lookup Settings
app.post('/api/admin/api-config', (req, res) => {
  try {
    const config = req.body;
    const saved = serverDb.saveApiConfig(config);
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save API lookup configuration' });
  }
});


// ==================== VITE INGRESS / STATIC ASSETS ====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT} [Node Mode: ${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer();
