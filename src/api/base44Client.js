import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion } = appParams;
const FIREBASE_URL = 'https://raport-k13-9353a.web.app';

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: FIREBASE_URL,
  requiresAuth: false,
  appBaseUrl: FIREBASE_URL
});