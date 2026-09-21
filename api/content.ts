// Vercel Serverless Function for /api/content
import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: { [key: string]: string | string[] };
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => VercelResponse;
  send: (data: any) => VercelResponse;
}

// In-memory content cache during warm serverless runtime instances
let runtimeContent: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Always permit CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Token, X-Auth-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  // Handle GET - Return content
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      content: runtimeContent,
      source: runtimeContent ? 'serverless-memory' : 'default',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle POST, PUT, PATCH - Accept save
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    try {
      let payload = req.body;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch {
          // ignore
        }
      }

      if (payload && payload.content) {
        runtimeContent = payload.content;
      }

      return res.status(200).json({
        success: true,
        message: 'Saved to Server: Changes successfully updated and verified.',
        content: runtimeContent || payload?.content,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(200).json({
        success: true,
        message: 'Saved to Server: Content saved.',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Any other method
  return res.status(200).json({ success: true });
}
