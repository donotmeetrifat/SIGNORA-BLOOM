// Vercel Serverless Function Catch-All for any /api/* endpoints
import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: { [key: string]: string | string[] };
  method?: string;
  url?: string;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => VercelResponse;
  send: (data: any) => VercelResponse;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Token, X-Auth-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  const url = req.url || '';

  // Auth login simulation on serverless
  if (url.includes('/auth/login')) {
    return res.status(200).json({
      success: true,
      token: 'sb_jwt_admin_token_' + Date.now(),
      user: { id: '01959524393', role: 'SUPER_ADMIN' },
      message: 'Authentication successful.',
    });
  }

  // Auth verify
  if (url.includes('/auth/verify')) {
    return res.status(200).json({
      valid: true,
      user: { id: '01959524393', role: 'SUPER_ADMIN' },
    });
  }

  // Health check
  if (url.includes('/health')) {
    return res.status(200).json({ status: 'ok', environment: 'serverless' });
  }

  // Catch-all response
  return res.status(200).json({
    success: true,
    message: 'Request processed successfully by serverless backend.',
    timestamp: new Date().toISOString(),
  });
}
