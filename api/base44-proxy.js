export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathFromQuery = url.searchParams.get('path');
  let path = pathFromQuery || req.url;

  if (path.startsWith('/api/base44-proxy')) {
    path = path.replace('/api/base44-proxy', '');
  }

  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  const targetUrl = `https://api.base44.com${path}`;

  const incomingHeaders = {};
  if (req.headers.authorization) incomingHeaders.authorization = req.headers.authorization;
  if (req.headers['content-type']) incomingHeaders['content-type'] = req.headers['content-type'];

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const options = {
      method: req.method,
      headers: incomingHeaders,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
    }

    const response = await fetch(targetUrl, options);
    const contentType = response.headers.get('content-type');

    const responseData = contentType && contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    return res.status(response.status).send(responseData);
  } catch (error) {
    return res.status(500).json({ error: 'Proxy Error', message: error.message });
  }
}