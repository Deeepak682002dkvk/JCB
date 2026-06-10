/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DiamondPackage {
  id: string;
  name: string;
  diamonds: number;
  bonusDiamonds: number;
  price: number;
  image: string; // Dynamic icon identifier or illustration
  tag?: string; // e.g., 'Hot', 'Best Value', 'Bonus'
  isCustom?: boolean;
}

export interface PlayerVerification {
  uid: string;
  nickname: string;
  success: boolean;
}

export interface TopupOrder {
  id: string;
  playerUid: string;
  playerNickname: string;
  packageId: string;
  packageName: string;
  diamonds: number;
  bonusDiamonds: number;
  price: number;
  quantity: number;
  totalPrice: number;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: 'Pending' | 'Success' | 'Processing' | 'Failed';
  createdAt: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  successfulOrders: number;
  pendingOrders: number;
}

export interface UpiSettings {
  upiId: string;
  payeeName: string;
  qrImageBase64: string;
}

export interface LookupApiConfig {
  apiUrl: string;
  apiKey: string;
  uidParamName: string;
  apiKeyHeaderName: string;
  apiKeyParamName: string;
}

