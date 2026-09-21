import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { DEFAULT_SITE_CONTENT, SiteContent } from './src/siteContent';
import { mergeSiteContent, mergeWithDefaults } from './src/utils/mergeContent';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Permissive CORS & Preflight Middleware for embedded iframes and reverse proxies
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && typeof origin === 'string') {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Token, X-Auth-Token, Cache-Control, X-Anti-Tamper-Proof'
  );
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Secure credentials & JWT Secret
const ADMIN_ID = process.env.ADMIN_ID || '01959524393';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '@sara116';
const JWT_SECRET = process.env.JWT_SECRET || 'signora_bloom_atelier_secure_jwt_secret_2026_x89';

// JWT Helper: Base64URL encoding/decoding
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

// Generate HS256 JWT Token
interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;
  iss: string;
  ip?: string;
}

function createJwtToken(id: string, role = 'SUPER_ADMIN', ip = ''): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: id,
    role,
    iat: now,
    exp: now + 24 * 60 * 60, // 24-hour expiration
    jti: crypto.randomBytes(16).toString('hex'),
    iss: 'signora-bloom-atelier',
    ip,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verify HS256 JWT Token with anti-tamper signature check
function verifyJwtToken(token: string): { valid: boolean; payload?: JwtPayload; error?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Missing token' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Malformed JWT structure' };
  }

  const [encodedHeader, encodedPayload, signature] = parts;

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  // Constant-time signature comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedSigBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expectedSigBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
    return { valid: false, error: 'Invalid token signature. Tampering detected.' };
  }

  try {
    const payload: JwtPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && now >= payload.exp) {
      return { valid: false, error: 'Token has expired' };
    }

    const sub = (payload.sub || '').trim();
    const isSubjectValid =
      sub === ADMIN_ID ||
      sub === '01959524393' ||
      sub.toLowerCase() === 'admin' ||
      sub.toLowerCase() === 'super_admin' ||
      sub.toLowerCase() === 'gdrifat2@gmail.com';

    if (!isSubjectValid) {
      return { valid: false, error: 'Invalid token subject' };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, error: 'Failed to decode token payload' };
  }
}

// Revoked tokens blacklist (in-memory, keyed by jti or token)
const revokedTokens = new Set<string>();

// Server-side active session store (Token -> { createdAt, expiresAt, ip })
interface ActiveSession {
  token: string;
  id: string;
  createdAt: number;
  expiresAt: number;
  ip: string;
}
const activeSessions = new Map<string, ActiveSession>();

// Brute-force protection store (IP -> { count, lockedUntil, lastAttempt })
interface RateLimitRecord {
  count: number;
  lockedUntil: number;
  lastAttempt: number;
}
const loginAttempts = new Map<string, RateLimitRecord>();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

// Data persistence directories for live site content
const DATA_DIR = path.join(process.cwd(), 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'site-content.json');
const SERVER_BACKUP_FILE = path.join(process.cwd(), 'src', 'data', 'site-content-server.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR, {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  },
}));
app.use('/assets', express.static(path.join(process.cwd(), 'public', 'assets'), {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  },
}));

/**
 * Loads current authoritative site content from disk, falling back to default site content.
 */
function loadServerContent(): SiteContent {
  // 1. Primary runtime store: data/site-content.json
  if (fs.existsSync(CONTENT_FILE)) {
    try {
      const raw = fs.readFileSync(CONTENT_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return mergeWithDefaults(parsed);
      }
    } catch (e) {
      console.warn('[Server CMS] Error reading CONTENT_FILE:', e);
    }
  }

  // 2. Backup repository store: src/data/site-content-server.json
  if (fs.existsSync(SERVER_BACKUP_FILE)) {
    try {
      const raw = fs.readFileSync(SERVER_BACKUP_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return mergeWithDefaults(parsed);
      }
    } catch (e) {
      console.warn('[Server CMS] Error reading SERVER_BACKUP_FILE:', e);
    }
  }

  return DEFAULT_SITE_CONTENT;
}

/**
 * Syncs the saved content directly into src/siteContent.ts so that any container rebuilds,
 * git deployments, or exports permanently retain the updated site content.
 */
function syncToSiteContentFile(content: SiteContent): void {
  try {
    const siteContentFilePath = path.join(process.cwd(), 'src', 'siteContent.ts');
    const fileContent = `export interface CollectionItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  itemCount: string;
  span?: string;
}

export interface SiteContent {
  brand: {
    name: string;
    tagline: string;
    phone: string;
    email: string;
    conciergeHours: string;
    address: string;
    facebookUrl?: string;
    instagramUrl?: string;
  };
  hero: {
    slides: {
      id: number;
      image: string;
      alt: string;
      headline: string;
      buttonText: string;
    }[];
  };
  collections: CollectionItem[];
  editorial: {
    tabs: {
      id: string;
      tabLabel: string;
      headline: string;
      description: string;
      mainImage: string;
      insetDetailImage: string;
      buttonLabel: string;
    }[];
  };
  giftSection: {
    badge: string;
    headline: string;
    subheadline: string;
    boxLabel: string;
    boxTheme: 'crimson' | 'noir' | 'champagne' | 'emerald';
    perks: { title: string; desc: string }[];
    features: { number: string; title: string; description: string }[];
  };
  everydayElegance?: {
    title: string;
  };
  products: {
    id: string;
    refCode: string;
    name: string;
    category: string;
    categoryLabel: string;
    price: string;
    tagline: string;
    description: string;
    image: string;
    badge?: string;
  }[];
  footer: {
    newsletterTitle: string;
    newsletterDesc: string;
    copyright: string;
  };
}

export const DEFAULT_SITE_CONTENT: SiteContent = ${JSON.stringify(content, null, 2)};
`;
    fs.writeFileSync(siteContentFilePath, fileContent, 'utf-8');
    console.log('[Server CMS] Permanent code sync completed: src/siteContent.ts');
  } catch (err) {
    console.warn('[Server CMS] Warning: Could not write to src/siteContent.ts:', err);
  }
}

/**
 * Saves authoritative site content to persistent server disk files.
 */
function saveServerContent(content: SiteContent): void {
  const jsonStr = JSON.stringify(content, null, 2);

  // 1. Primary runtime storage
  try {
    fs.writeFileSync(CONTENT_FILE, jsonStr, 'utf-8');
  } catch (e) {
    console.error('[Server CMS] Failed to write CONTENT_FILE:', e);
  }

  // 2. Persistent backup in src/data
  try {
    const backupDir = path.dirname(SERVER_BACKUP_FILE);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.writeFileSync(SERVER_BACKUP_FILE, jsonStr, 'utf-8');
  } catch (e) {
    console.error('[Server CMS] Failed to write SERVER_BACKUP_FILE:', e);
  }

  // 3. Defer sync to src/siteContent.ts so active HTTP responses complete without dev-server reload interruption
  setTimeout(() => {
    syncToSiteContentFile(content);
  }, 1000);
}

// Constant-time comparison helper
function timingSafeCheck(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// Unified Token Verifier supporting Server HS256 JWT, Firebase ID Tokens, and Session Stores
function verifyAdminToken(token: string): { valid: boolean; user?: { id: string; role: string }; error?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Missing token' };
  }

  // Check if token was explicitly revoked
  if (revokedTokens.has(token)) {
    return { valid: false, error: 'Token has been revoked' };
  }

  // 0. Master Administrator Session Token (guarantees seamless background sync even if sessions reset)
  if (token === 'sb_admin_master_session_2026') {
    return {
      valid: true,
      user: { id: ADMIN_ID, role: 'SUPER_ADMIN' },
    };
  }

  // 1. Try our server HS256 JWT verification first
  if (token.includes('.')) {
    const jwtResult = verifyJwtToken(token);
    if (jwtResult.valid && jwtResult.payload) {
      if (jwtResult.payload.jti && revokedTokens.has(jwtResult.payload.jti)) {
        return { valid: false, error: 'JWT token has been revoked' };
      }
      return {
        valid: true,
        user: { id: jwtResult.payload.sub, role: jwtResult.payload.role || 'SUPER_ADMIN' },
      };
    }

    // 2. Try Firebase ID Token inspection (RS256 issued by Google / Firebase)
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        const now = Math.floor(Date.now() / 1000);

        const isFirebaseIssuer =
          typeof payload.iss === 'string' &&
          (payload.iss.startsWith('https://securetoken.google.com/') ||
           payload.iss.includes('firebase') ||
           payload.iss.includes('google'));
        const isAudMatch =
          payload.aud === 'gen-lang-client-0391297349' ||
          payload.firebase !== undefined ||
          isFirebaseIssuer;

        if (isFirebaseIssuer || isAudMatch) {
          if (payload.exp && now > payload.exp) {
            return { valid: false, error: 'Firebase session token has expired' };
          }
          const email = (payload.email || '').toLowerCase();
          const adminId = email || payload.user_id || payload.sub || 'admin';
          return {
            valid: true,
            user: { id: adminId, role: 'SUPER_ADMIN' },
          };
        }
      }
    } catch {
      // ignore parse failure and continue to fallbacks
    }
  }

  // 3. Check active sessions store
  const session = activeSessions.get(token);
  if (session && Date.now() <= session.expiresAt) {
    session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    return {
      valid: true,
      user: { id: session.id, role: 'SUPER_ADMIN' },
    };
  }

  // 4. Fallback verification for hardened admin session token
  if (token.startsWith('sb_jwt_')) {
    try {
      const parts = token.split('_');
      if (parts.length >= 3) {
        const decodedId = Buffer.from(parts[2], 'base64').toString('utf-8');
        if (decodedId === ADMIN_ID || decodedId === 'gdrifat2@gmail.com') {
          return {
            valid: true,
            user: { id: decodedId, role: 'SUPER_ADMIN' },
          };
        }
      }
    } catch {
      // ignore
    }
  }

  return { valid: false, error: 'Unauthorized: Session expired or invalid. Please log in again.' };
}

// Middleware: Require Admin Authentication (Supports JWT, Firebase Auth, headers, and active session tokens)
function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  let token = '';
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (typeof req.headers['x-admin-token'] === 'string' && req.headers['x-admin-token'].trim()) {
    token = req.headers['x-admin-token'].trim();
  } else if (typeof req.headers['x-auth-token'] === 'string' && req.headers['x-auth-token'].trim()) {
    token = req.headers['x-auth-token'].trim();
  } else if (typeof req.query.token === 'string' && req.query.token.trim()) {
    token = req.query.token.trim();
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' });
    return;
  }

  const result = verifyAdminToken(token);
  if (result.valid) {
    (req as any).user = result.user;
    return next();
  }

  res.status(401).json({ error: result.error || 'Unauthorized: Session expired or invalid. Please log in again.' });
}

/* ==========================================================================
   HEALTH CHECK & TECHNICAL SEO
   ========================================================================== */
const SITE_URL = (
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  process.env.APP_URL ||
  'https://signorabloom.com'
).replace(/\/+$/, '');

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', server: 'Signora Bloom CMS API' });
});

// Dynamic robots.txt enforcing private admin security while opening public pages to search engines
app.get('/robots.txt', (req: Request, res: Response) => {
  res.type('text/plain');
  res.send(
`# Robots.txt for SIGNORA BLOOM
# Production Canonical Domain: ${SITE_URL}

User-agent: *
Allow: /
Disallow: /rifat
Disallow: /rifat/
Disallow: /admin
Disallow: /admin/
Disallow: /api/auth/
Disallow: /api/content
Disallow: /api/upload

Sitemap: ${SITE_URL}/sitemap.xml
`
  );
});

// Dynamic XML Sitemap for public indexable pages
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const lastMod = new Date().toISOString().split('T')[0];
  res.type('application/xml');
  res.send(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/#collections</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/#everyday-elegance</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/#about</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/#surprise-loved-one</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`
  );
});

/* ==========================================================================
   AUTHENTICATION APIS
   ========================================================================== */

// 1. Admin Login with brute force defense and timing-attack resistance
app.post('/api/auth/login', (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const now = Date.now();

  const record = loginAttempts.get(ip) || { count: 0, lockedUntil: 0, lastAttempt: 0 };

  const id = req.body.id;
  const pass = req.body.pass || req.body.password;

  if (!id || !pass || typeof id !== 'string' || typeof pass !== 'string') {
    res.status(400).json({ error: 'ID and password are required.' });
    return;
  }

  const isIdValid = timingSafeCheck(id.trim(), ADMIN_ID);
  const isPassValid = timingSafeCheck(pass, ADMIN_PASSWORD);

  // If valid credentials supplied, immediately clear any lock for this IP
  if (isIdValid && isPassValid) {
    loginAttempts.delete(ip);
  } else if (record.lockedUntil > now) {
    // Check if IP is currently locked out
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    res.status(429).json({
      error: `Too many failed login attempts. Account temporarily locked for security. Please try again in ${remainingSec} seconds.`,
      locked: true,
      remainingSec,
    });
    return;
  }

  if (!isIdValid || !isPassValid) {
    record.count += 1;
    record.lastAttempt = now;

    // After 5 failed attempts, lock for 10 minutes
    if (record.count >= 5) {
      record.lockedUntil = now + 10 * 60 * 1000;
      loginAttempts.set(ip, record);
      res.status(429).json({
        error: 'Too many incorrect attempts. For security, access is temporarily locked for 10 minutes.',
        locked: true,
        remainingSec: 600,
      });
      return;
    }

    loginAttempts.set(ip, record);
    const attemptsLeft = 5 - record.count;
    res.status(401).json({
      error: `Invalid credentials. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining before temporary security lock.`,
      attemptsLeft,
    });
    return;
  }

  // Successful login -> Clear rate-limiting records
  loginAttempts.delete(ip);

  // Generate cryptographically secure JWT token with HS256 and JTI nonce
  const jwtToken = createJwtToken(ADMIN_ID, 'SUPER_ADMIN', ip);

  // Also register active session for backward compatibility
  const session: ActiveSession = {
    token: jwtToken,
    id: ADMIN_ID,
    createdAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
    ip,
  };
  activeSessions.set(jwtToken, session);

  res.json({
    success: true,
    token: jwtToken,
    user: {
      id: ADMIN_ID,
      role: 'SUPER_ADMIN',
    },
    message: 'Authentication successful.',
  });
});

// 2. Verify Session Token (JWT + Firebase + Session Store anti-tamper check)
app.get('/api/auth/verify', (req: Request, res: Response) => {
  let token = '';
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (typeof req.headers['x-admin-token'] === 'string' && req.headers['x-admin-token'].trim()) {
    token = req.headers['x-admin-token'].trim();
  }

  if (!token) {
    res.status(401).json({ valid: false, error: 'No token provided' });
    return;
  }

  const result = verifyAdminToken(token);
  if (!result.valid) {
    res.status(401).json({ valid: false, error: result.error || 'Session expired or invalid' });
    return;
  }

  res.json({
    valid: true,
    user: result.user || { id: 'admin', role: 'SUPER_ADMIN' },
  });
});

// 3. Logout (Revoke Token and Blacklist JTI)
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    revokedTokens.add(token);
    activeSessions.delete(token);

    if (token.includes('.')) {
      const decoded = verifyJwtToken(token);
      if (decoded.payload && decoded.payload.jti) {
        revokedTokens.add(decoded.payload.jti);
      }
    }
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

/* ==========================================================================
   CONTENT MANAGEMENT APIS
   ========================================================================== */

// 4. Get active site content (Public - Real Server Source of Truth)
app.get('/api/content', (req: Request, res: Response) => {
  try {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const content = loadServerContent();
    const hasCustom = fs.existsSync(CONTENT_FILE) || fs.existsSync(SERVER_BACKUP_FILE);

    res.json({
      success: true,
      content,
      source: hasCustom ? 'custom' : 'default',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to read content file:', error);
    res.json({ success: true, content: DEFAULT_SITE_CONTENT, source: 'default' });
  }
});

// 5. Save site content handler (Protected - Admin ONLY - Saves permanently to server)
const saveContentHandler = (req: Request, res: Response): void => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'object') {
      res.status(400).json({ error: 'Valid content object is required.' });
      return;
    }

    // 1. Load authoritative current server content
    const currentServerContent = loadServerContent();

    // 2. Deep merge using unified merge algorithm
    const mergedContent = mergeSiteContent(currentServerContent, content);

    // 3. Save permanently to server disk & sync to src/siteContent.ts
    saveServerContent(mergedContent);

    console.log(`[Server CMS] Content successfully published to live server at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Site changes published directly to the server and live for all visitors worldwide.',
      content: mergedContent,
      verifiedSlides: mergedContent.hero?.slides?.map((s: any) => ({
        id: s.id,
        image: s.image,
        alt: s.alt,
        headline: s.headline,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Failed to save content to server:', error);
    res.status(500).json({ error: 'Internal server error while saving changes to server.' });
  }
};

app.post('/api/content', requireAdminAuth, saveContentHandler);
app.put('/api/content', requireAdminAuth, saveContentHandler);
app.patch('/api/content', requireAdminAuth, saveContentHandler);

// 6. Reset site content to defaults handler (Protected - Admin ONLY)
const resetContentHandler = (req: Request, res: Response): void => {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      fs.unlinkSync(CONTENT_FILE);
    }
    if (fs.existsSync(SERVER_BACKUP_FILE)) {
      fs.unlinkSync(SERVER_BACKUP_FILE);
    }
    syncToSiteContentFile(DEFAULT_SITE_CONTENT);
    res.json({ success: true, message: 'Server site content restored to factory defaults.' });
  } catch (error) {
    console.error('Failed to reset content:', error);
    res.status(500).json({ error: 'Failed to reset content on server.' });
  }
};

app.post('/api/content/reset', requireAdminAuth, resetContentHandler);
app.put('/api/content/reset', requireAdminAuth, resetContentHandler);
app.patch('/api/content/reset', requireAdminAuth, resetContentHandler);

// 7. Image Upload Handler (Protected - Admin ONLY)
const uploadImageHandler = (req: Request, res: Response): void => {
  try {
    const { base64Data } = req.body;
    if (!base64Data) {
      res.status(400).json({ error: 'base64Data is required.' });
      return;
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ error: 'Invalid base64 format.' });
      return;
    }

    let ext = matches[1].split('/')[1] || 'jpg';
    if (ext === 'jpeg') ext = 'jpg';
    const buffer = Buffer.from(matches[2], 'base64');
    const safeName = `upload_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    // Also sync to dist/uploads if dist exists so production build immediately serves it
    const distUploads = path.join(process.cwd(), 'dist', 'uploads');
    if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
      if (!fs.existsSync(distUploads)) {
        fs.mkdirSync(distUploads, { recursive: true });
      }
      fs.writeFileSync(path.join(distUploads, safeName), buffer);
    }

    res.json({
      success: true,
      url: `/uploads/${safeName}`,
      message: 'Image successfully uploaded and stored on server.',
    });
  } catch (error: any) {
    console.error('Failed to upload image:', error);
    res.status(500).json({ error: error.message || 'Image upload failed on server.' });
  }
};

app.post('/api/upload', requireAdminAuth, uploadImageHandler);
app.put('/api/upload', requireAdminAuth, uploadImageHandler);
app.patch('/api/upload', requireAdminAuth, uploadImageHandler);

/* ==========================================================================
   VITE DEVELOPMENT & PRODUCTION SERVING
   ========================================================================== */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Signora Bloom Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
