import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion } = appParams;

// Mengarahkan langsung ke sub-folder /api di Firebase agar dibaca oleh aturan rewrites
const FIREBASE_PROXY_URL = 'https://raport-k13-9353a.web.app/api'; 

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: FIREBASE_PROXY_URL,
  requiresAuth: false,
  appBaseUrl: FIREBASE_PROXY_URL
});
// pancing git