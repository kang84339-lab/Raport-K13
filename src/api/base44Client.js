import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion } = appParams;
const SAME_ORIGIN_URL = window.location.origin;

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: SAME_ORIGIN_URL,
  requiresAuth: false,
  appBaseUrl: SAME_ORIGIN_URL
});
