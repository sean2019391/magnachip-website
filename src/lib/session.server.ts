/**
 * Lightweight session store scaffold.
 * - In-memory Map by default (suitable for development)
 * - Optional Redis backing when REDIS_URL is provided and `ioredis` is installed
 */

type Stored = { expiresAt: number };

const memoryStore = new Map<string, Stored>();
let redisClient: any = null;
let usingRedis = false;

if (process.env.REDIS_URL) {
  try {
    // require at runtime so project doesn't fail if dependency not installed
    // To enable Redis in production, add `ioredis` to dependencies and set REDIS_URL.
    // Example: REDIS_URL=redis://:password@hostname:6379
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const IORedis = require('ioredis');
    redisClient = new IORedis(process.env.REDIS_URL);
    usingRedis = true;
  } catch (err) {
    // Redis not available — fall back to memory store but log a warning at runtime
    // (Avoid throwing so tests and local dev continue to work.)
    // eslint-disable-next-line no-console
    console.warn('REDIS_URL set but ioredis not installed — falling back to in-memory session store');
  }
}

export async function setSession(id: string, ttlSeconds: number) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  if (usingRedis && redisClient) {
    try {
      await redisClient.set(`session:${id}`, '1', 'EX', ttlSeconds);
      return;
    } catch (err) {
      // fallback to memory
    }
  }
  memoryStore.set(id, { expiresAt });
}

export async function hasSession(id: string) {
  if (!id) return false;
  if (usingRedis && redisClient) {
    try {
      const val = await redisClient.get(`session:${id}`);
      return Boolean(val);
    } catch (err) {
      // fallback to memory
    }
  }
  const stored = memoryStore.get(id);
  if (!stored) return false;
  if (stored.expiresAt < Date.now()) {
    memoryStore.delete(id);
    return false;
  }
  return true;
}

export async function deleteSession(id: string) {
  if (!id) return;
  if (usingRedis && redisClient) {
    try {
      await redisClient.del(`session:${id}`);
      return;
    } catch (err) {
      // fallback
    }
  }
  memoryStore.delete(id);
}
