import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Fungsi pembersih untuk mencegah URL bertumpuk ganda di Vercel
const cleanUrl = (url) => {
  if (!url) return 'https://api.base44.com';
  
  // Jika URL mengandung teks ganda akibat bug AI
  if (url.includes('https:/api.base44.com') || url.includes('https://api.base44.com')) {
    return 'https://api.base44.com';
  }
  
  // Jika URL bersih, gunakan apa adanya
  return url.startsWith('http') ? url : `https://${url}`;
};

const finalServerUrl = cleanUrl(appBaseUrl);

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: finalServerUrl,
  requiresAuth: false,
  appBaseUrl: finalServerUrl
});