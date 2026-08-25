import crypto from 'crypto';
import { setSession, hasSession } from './session.server';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
const SECRET = process.env.ADMIN_SECRET || 'dev_admin_secret';

function hmac(payload: string) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
}

export async function createAdminToken() {
  const id = crypto.randomUUID();
  const ts = Math.floor(Date.now() / 1000);
  const payload = `${id}:${ts}`;
  const sig = hmac(payload);
  // persist session in session store so it can be revoked if needed
  try {
    await setSession(id, SESSION_MAX_AGE);
  } catch (err) {
    // ignore — session store best-effort
  }
  return `${payload}.${sig}`;
}

export async function verifyAdminToken(token: string | undefined | null) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = hmac(payload);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  } catch (err) {
    return false;
  }
  const [id, tsStr] = payload.split(':');
  const ts = Number(tsStr || '0');
  if (!id || !ts) return false;
  const age = Math.floor(Date.now() / 1000) - ts;
  if (!(age > 0 && age <= SESSION_MAX_AGE)) return false;
  // check session store (in-memory or redis) — if absent, treat as invalid
  try {
    const ok = await hasSession(id);
    return Boolean(ok);
  } catch (err) {
    // if session store fails, fallback to signature+age check
    return true;
  }
}
