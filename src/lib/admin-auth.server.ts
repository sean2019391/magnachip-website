import crypto from 'crypto';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
const SECRET = process.env.ADMIN_SECRET || 'dev_admin_secret';

function hmac(payload: string) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
}

export function createAdminToken() {
  const id = crypto.randomUUID();
  const ts = Math.floor(Date.now() / 1000);
  const payload = `${id}:${ts}`;
  const sig = hmac(payload);
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string | undefined | null) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = hmac(payload);
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  const [id, tsStr] = payload.split(':');
  const ts = Number(tsStr || '0');
  if (!id || !ts) return false;
  const age = Math.floor(Date.now() / 1000) - ts;
  return age > 0 && age <= SESSION_MAX_AGE;
}
