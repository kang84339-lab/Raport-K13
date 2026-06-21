import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion } = appParams;

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '/api/base44-proxy',
  requiresAuth: false,
  appBaseUrl: '/api/base44-proxy'
});