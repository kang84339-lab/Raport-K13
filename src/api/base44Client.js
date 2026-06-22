import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion } = appParams;

// Use Vercel local proxy for all Base44 API calls
const VERCEL_PROXY_BASE = '/api';

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: VERCEL_PROXY_BASE,
  requiresAuth: false,
  appBaseUrl: VERCEL_PROXY_BASE
});