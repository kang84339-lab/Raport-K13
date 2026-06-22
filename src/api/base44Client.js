import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion } = appParams;

// Hapus protokol 'https://' khusus untuk serverUrl jika SDK otomatis menyusunnya,
// ATAU gunakan URL Firebase polosan tanpa embel-embel apapun.
const FIREBASE_PROXY_URL = 'https://raport-k13-9353a.web.app';

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: FIREBASE_PROXY_URL,
  requiresAuth: false,
  appBaseUrl: FIREBASE_PROXY_URL
});