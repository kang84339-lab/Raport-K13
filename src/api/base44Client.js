import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion } = appParams;

export const base44 = createClient({
  appId: appId || "6a37200d642d22d653e74041",
  token: token || "374517ead47a499baf3f4832821386d9",
  functionsVersion,
  serverUrl: 'https://api.base44.com', // Tulis langsung URL pusatnya di sini
  requiresAuth: false,
  appBaseUrl: 'https://api.base44.com'  // Tulis langsung URL pusatnya di sini
});