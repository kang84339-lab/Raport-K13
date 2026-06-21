export default async function handler(req, res) {
  // Ambil path asli setelah /api/base44-proxy atau /api
  let path = req.url.replace('/api/base44-proxy', '').replace('/api', '');
  
  // Jika path kosong atau hanya '/', pastikan tidak double slash
  const targetUrl = `https://api.base44.com${path}`;

  // Salin semua header dari frontend
  const incomingHeaders = { ...req.headers };
  incomingHeaders['host'] = 'api.base44.com';
  delete incomingHeaders['connection'];

  // Set CORS Headers untuk browser
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Handle Preflight Request (OPTIONS) otomatis agar tidak kena CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const options = {
      method: req.method,
      headers: incomingHeaders,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
    }

    const response = await fetch(targetUrl, options);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Proxy Error', message: error.message });
  }
}