export default async function handler(req, res) {
  const path = req.url.replace('/api/base44-proxy', '');
  const targetUrl = `https://api.base44.com${path}`;

  const incomingHeaders = { ...req.headers };
  incomingHeaders['host'] = 'api.base44.com';
  delete incomingHeaders['connection'];

  const options = {
    method: req.method,
    headers: incomingHeaders,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (typeof req.body === 'object') {
      options.body = JSON.stringify(req.body);
    } else {
      options.body = req.body;
    }
  }

  try {
    const response = await fetch(targetUrl, options);
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Proxy Error', message: error.message });
  }
}