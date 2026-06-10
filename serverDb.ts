/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { DiamondPackage, TopupOrder, UpiSettings, LookupApiConfig } from './src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const PACKAGES_FILE = path.join(DATA_DIR, 'packages.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const API_CONFIG_FILE = path.join(DATA_DIR, 'api_config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default packages list modeled after Free Fire
const DEFAULT_PACKAGES: DiamondPackage[] = [
  {
    id: 'ff_1200',
    name: 'Ranger Box',
    diamonds: 8400,
    bonusDiamonds: 840,
    price: 1200,
    image: 'diamond_pot',
    tag: 'New'
  },
  {
    id: 'ff_1500',
    name: 'Squad Loader Pro',
    diamonds: 10500,
    bonusDiamonds: 1050,
    price: 1500,
    image: 'diamond_pot',
    tag: 'Popular'
  },
  {
    id: 'ff_1600',
    name: 'Pro Hoard',
    diamonds: 11200,
    bonusDiamonds: 1200,
    price: 1600,
    image: 'diamond_pot',
    tag: 'Super Value'
  },
  {
    id: 'ff_2000',
    name: 'Booyah Special',
    diamonds: 14000,
    bonusDiamonds: 1500,
    price: 2000,
    image: 'diamond_pot',
    tag: 'Recommended'
  },
  {
    id: 'ff_2500',
    name: 'Gamer Vault Lite',
    diamonds: 17500,
    bonusDiamonds: 2000,
    price: 2500,
    image: 'diamond_chest',
    tag: 'Best Seller'
  },
  {
    id: 'ff_3000',
    name: 'Gladiator Chest',
    diamonds: 21000,
    bonusDiamonds: 2500,
    price: 3000,
    image: 'diamond_chest',
    tag: '+12% Bonus'
  },
  {
    id: 'ff_3500',
    name: 'Evo Weapon Stash',
    diamonds: 24500,
    bonusDiamonds: 3000,
    price: 3500,
    image: 'diamond_chest',
    tag: '+12% Bonus'
  },
  {
    id: 'ff_4000',
    name: 'Grandmaster Cache',
    diamonds: 28000,
    bonusDiamonds: 3500,
    price: 4000,
    image: 'diamond_chest',
    tag: '+12% Bonus'
  },
  {
    id: 'ff_5000',
    name: 'Warlord Treasure',
    diamonds: 35000,
    bonusDiamonds: 4500,
    price: 5000,
    image: 'diamond_chest',
    tag: '+13% Bonus'
  },
  {
    id: 'ff_6000',
    name: 'Elite Legend Horde',
    diamonds: 42000,
    bonusDiamonds: 5500,
    price: 6000,
    image: 'diamond_throne',
    tag: 'Vip Level A'
  },
  {
    id: 'ff_7000',
    name: 'Apex Predator Crate',
    diamonds: 49000,
    bonusDiamonds: 6500,
    price: 7000,
    image: 'diamond_throne',
    tag: 'Vip Level B'
  },
  {
    id: 'ff_8000',
    name: 'Overlord Vault',
    diamonds: 56000,
    bonusDiamonds: 8000,
    price: 8000,
    image: 'diamond_throne',
    tag: 'Vip Level 1'
  },
  {
    id: 'ff_10000',
    name: 'Alpha Titan Trove',
    diamonds: 70000,
    bonusDiamonds: 10000,
    price: 10000,
    image: 'diamond_throne',
    tag: 'Vip Level 2'
  },
  {
    id: 'ff_12000',
    name: 'Omega Overlord Stash',
    diamonds: 84000,
    bonusDiamonds: 12000,
    price: 12000,
    image: 'diamond_throne',
    tag: 'Elite Member'
  },
  {
    id: 'ff_15000',
    name: 'Sovereign Cache',
    diamonds: 105000,
    bonusDiamonds: 16000,
    price: 15000,
    image: 'diamond_throne',
    tag: '+15% Bonus'
  },
  {
    id: 'ff_16000',
    name: 'Apex Clan Stash',
    diamonds: 112000,
    bonusDiamonds: 18000,
    price: 16000,
    image: 'diamond_throne',
    tag: 'Vip Level Max'
  },
  {
    id: 'ff_20000',
    name: 'Championship Vault',
    diamonds: 140000,
    bonusDiamonds: 24000,
    price: 20000,
    image: 'diamond_throne',
    tag: 'Special Tier'
  },
  {
    id: 'ff_25000',
    name: 'Vanguard Emperor Box',
    diamonds: 175000,
    bonusDiamonds: 31000,
    price: 25000,
    image: 'diamond_throne',
    tag: 'Imperial Tier'
  },
  {
    id: 'ff_30000',
    name: 'Sultan Ultimate Hoard',
    diamonds: 210000,
    bonusDiamonds: 38000,
    price: 30000,
    image: 'diamond_throne',
    tag: 'Sultan Tier'
  },
  {
    id: 'ff_32000',
    name: 'Titan Emperor Treasury',
    diamonds: 224000,
    bonusDiamonds: 42000,
    price: 32000,
    image: 'diamond_throne',
    tag: 'Imperial Gold'
  },
  {
    id: 'ff_40000',
    name: 'Immortal Dynasty Trove',
    diamonds: 280000,
    bonusDiamonds: 56000,
    price: 40000,
    image: 'diamond_throne',
    tag: 'Immortal Silver'
  },
  {
    id: 'ff_45000',
    name: 'Zenith Overlord Cache',
    diamonds: 315000,
    bonusDiamonds: 65000,
    price: 45000,
    image: 'diamond_throne',
    tag: 'Zenith Master'
  },
  {
    id: 'ff_50000',
    name: 'Immortal Supreme Cache',
    diamonds: 350000,
    bonusDiamonds: 75000,
    price: 50000,
    image: 'diamond_throne',
    tag: 'Immortal Status'
  }
];

// Helper to read JSON safely
function readJSON<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data) as T;
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultValue;
}

// Helper to write JSON safely
function writeJSON<T>(filePath: string, data: T): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
}

// Initialize packages with default if empty
let currentPackages = readJSON<DiamondPackage[]>(PACKAGES_FILE, DEFAULT_PACKAGES);
if (!fs.existsSync(PACKAGES_FILE)) {
  writeJSON(PACKAGES_FILE, DEFAULT_PACKAGES);
}

// Initialize empty orders list
let currentOrders = readJSON<TopupOrder[]>(ORDERS_FILE, []);
if (!fs.existsSync(ORDERS_FILE)) {
  writeJSON(ORDERS_FILE, []);
}

const DEFAULT_UPI_SETTINGS: UpiSettings = {
  upiId: 'deepak68200200@ibl',
  payeeName: 'DEEPAK',
  qrImageBase64: ''
};

let currentSettings = readJSON<UpiSettings>(SETTINGS_FILE, DEFAULT_UPI_SETTINGS);
if (!fs.existsSync(SETTINGS_FILE)) {
  writeJSON(SETTINGS_FILE, DEFAULT_UPI_SETTINGS);
}

const DEFAULT_API_CONFIG: LookupApiConfig = {
  apiUrl: 'https://id-game-checker.p.rapidapi.com/ff-global/{id}',
  apiKey: '3f96f92be1msh80ad5b002dce251p1b6f0fjsn160bee122912',
  uidParamName: 'id',
  apiKeyHeaderName: 'x-rapidapi-key',
  apiKeyParamName: ''
};

let currentApiConfig = readJSON<LookupApiConfig>(API_CONFIG_FILE, DEFAULT_API_CONFIG);
if (!fs.existsSync(API_CONFIG_FILE)) {
  writeJSON(API_CONFIG_FILE, DEFAULT_API_CONFIG);
}

// Real-time generator of Free Fire player confirmation nicknames based on UID
const EPIC_NICKNAMES = [
  '⚡NOB_BOSS⚡',
  '꧁༺ɢᴀᴍᴇʀ༻꧂',
  '🔥Viper_FF🔥',
  '『GM』々RAKESH',
  '⚔️SHADOW⚔️',
  'ALPHA_DRAGON',
  '✿STORM✿',
  'King_Of_Booyah',
  '☠️DARK_SECTOR☠️',
  'BooyahSlayer_99',
  'Crimson_Rider',
  'HunterClaw',
  'Axe_Slayer',
  'FreeFireVeteran'
];

export const serverDb = {
  // Get packages
  getPackages(): DiamondPackage[] {
    currentPackages = readJSON<DiamondPackage[]>(PACKAGES_FILE, DEFAULT_PACKAGES);
    return currentPackages;
  },

  // Save/Update package
  savePackage(pkg: DiamondPackage): DiamondPackage {
    currentPackages = this.getPackages();
    const index = currentPackages.findIndex(p => p.id === pkg.id);
    if (index >= 0) {
      currentPackages[index] = { ...pkg };
    } else {
      currentPackages.push({ ...pkg });
    }
    writeJSON(PACKAGES_FILE, currentPackages);
    return pkg;
  },

  // Delete package
  deletePackage(id: string): boolean {
    currentPackages = this.getPackages();
    const lenBefore = currentPackages.length;
    currentPackages = currentPackages.filter(p => p.id !== id);
    if (currentPackages.length < lenBefore) {
      writeJSON(PACKAGES_FILE, currentPackages);
      return true;
    }
    return false;
  },

  // Get orders
  getOrders(): TopupOrder[] {
    currentOrders = readJSON<TopupOrder[]>(ORDERS_FILE, []);
    return currentOrders;
  },

  // Create order
  createOrder(order: TopupOrder): TopupOrder {
    currentOrders = this.getOrders();
    currentOrders.unshift({ ...order }); // Insert newly created orders at the top
    writeJSON(ORDERS_FILE, currentOrders);
    return order;
  },

  // Update order status
  updateOrderStatus(orderId: string, status: TopupOrder['status'], razorpayPaymentId?: string): TopupOrder | null {
    currentOrders = this.getOrders();
    const index = currentOrders.findIndex(o => o.id === orderId);
    if (index >= 0) {
      currentOrders[index].status = status;
      if (razorpayPaymentId) {
        currentOrders[index].razorpayPaymentId = razorpayPaymentId;
      }
      writeJSON(ORDERS_FILE, currentOrders);
      return currentOrders[index];
    }
    return null;
  },

  // Player verification helper
  async verifyPlayerUid(uid: string): Promise<{ uid: string; nickname: string; success: boolean; error?: string }> {
    if (!uid || uid.trim().length < 5) {
      return { uid, nickname: '', success: false, error: 'UID must be at least 5 character length' };
    }

    const config = this.getApiConfig();
    const rawApiUrl = (process.env.FREEFIRE_API_URL || config.apiUrl || '').trim();
    const rawApiKey = (process.env.FREEFIRE_API_KEY || config.apiKey || '').trim();

    if (!rawApiUrl) {
      return {
        uid,
        nickname: '',
        success: false,
        error: 'Free Fire Player Lookup API is not connected. Under system instructions, fake player names have been disabled. Admin must configure the API URL and API Key in data/api_config.json'
      };
    }

    let targetUrl = rawApiUrl;
    // Replace placeholder [uid], {uid}, {PLAYER_UID}, {id}, [id], :uid, or :id in the URL if present
    if (targetUrl.includes('[uid]')) {
      targetUrl = targetUrl.replace('[uid]', encodeURIComponent(uid));
    } else if (targetUrl.includes('{uid}')) {
      targetUrl = targetUrl.replace('{uid}', encodeURIComponent(uid));
    } else if (targetUrl.includes('{id}')) {
      targetUrl = targetUrl.replace('{id}', encodeURIComponent(uid));
    } else if (targetUrl.includes('[id]')) {
      targetUrl = targetUrl.replace('[id]', encodeURIComponent(uid));
    } else if (targetUrl.includes('{PLAYER_UID}')) {
      targetUrl = targetUrl.replace('{PLAYER_UID}', encodeURIComponent(uid));
    } else if (targetUrl.includes(':uid')) {
      targetUrl = targetUrl.replace(':uid', encodeURIComponent(uid));
    } else if (targetUrl.includes(':id')) {
      targetUrl = targetUrl.replace(':id', encodeURIComponent(uid));
    } else {
      // Append uid as query parameter
      const separator = targetUrl.includes('?') ? '&' : '?';
      const uidParam = config.uidParamName || 'uid';
      targetUrl = `${targetUrl}${separator}${uidParam}=${encodeURIComponent(uid)}`;
    }

    // Append apiKey if configured as query parameter
    if (rawApiKey && config.apiKeyParamName) {
      const separator = targetUrl.includes('?') ? '&' : '?';
      targetUrl = `${targetUrl}${separator}${config.apiKeyParamName}=${encodeURIComponent(rawApiKey)}`;
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    // If it is a RapidAPI URL, auto-set x-rapidapi-host
    if (targetUrl.includes('rapidapi.com')) {
      try {
        const urlObj = new URL(targetUrl);
        headers['x-rapidapi-host'] = urlObj.hostname;
      } catch (e) {
        headers['x-rapidapi-host'] = 'id-game-checker.p.rapidapi.com';
      }
    }

    if (rawApiKey) {
      if (config.apiKeyHeaderName) {
        headers[config.apiKeyHeaderName.toLowerCase() === 'x-rapidapi-key' ? 'x-rapidapi-key' : config.apiKeyHeaderName] = rawApiKey;
      } else {
        headers['x-rapidapi-key'] = rawApiKey;
      }
    }

    try {
      const response = await globalThis.fetch(targetUrl, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        return {
          uid,
          nickname: '',
          success: false,
          error: 'Player not found'
        };
      }

      const responseJson = await response.json();
      
      // Handle explicit error responses from the API
      if (responseJson && (responseJson.error === true || responseJson.success === false || responseJson.status === 404 || responseJson.msg === 'id_not_found')) {
        return {
          uid,
          nickname: '',
          success: false,
          error: 'Player not found'
        };
      }

      let nickname = '';
      if (responseJson) {
        // Try directly matching response keys case-insensitively
        const keysToTry = ['nickname', 'name', 'player_name', 'playerName', 'username', 'userName', 'nick'];
        for (const k of keysToTry) {
          if (responseJson[k] && typeof responseJson[k] === 'string') {
            nickname = responseJson[k];
            break;
          }
        }
        
        // Try inside "data" object if nested
        if (!nickname && responseJson.data && typeof responseJson.data === 'object') {
          for (const k of keysToTry) {
            if (responseJson.data[k] && typeof responseJson.data[k] === 'string') {
              nickname = responseJson.data[k];
              break;
            }
          }
        }
        
        // Try inside "player" object
        if (!nickname && responseJson.player && typeof responseJson.player === 'object') {
          for (const k of keysToTry) {
            if (responseJson.player[k] && typeof responseJson.player[k] === 'string') {
              nickname = responseJson.player[k];
              break;
            }
          }
        }
      }

      if (!nickname) {
        return {
          uid,
          nickname: '',
          success: false,
          error: 'Player not found'
        };
      }

      return {
        uid,
        nickname,
        success: true
      };
    } catch (fetchErr: any) {
      return {
        uid,
        nickname: '',
        success: false,
        error: 'Player not found'
      };
    }
  },

  // UPI settings functions
  getUpiSettings(): UpiSettings {
    currentSettings = readJSON<UpiSettings>(SETTINGS_FILE, DEFAULT_UPI_SETTINGS);
    return currentSettings;
  },

  saveUpiSettings(settings: UpiSettings): UpiSettings {
    currentSettings = { ...settings };
    writeJSON(SETTINGS_FILE, currentSettings);
    return currentSettings;
  },

  // API Config functions
  getApiConfig(): LookupApiConfig {
    currentApiConfig = readJSON<LookupApiConfig>(API_CONFIG_FILE, DEFAULT_API_CONFIG);
    return currentApiConfig;
  },

  saveApiConfig(config: LookupApiConfig): LookupApiConfig {
    currentApiConfig = { ...config };
    writeJSON(API_CONFIG_FILE, currentApiConfig);
    return currentApiConfig;
  }
};
