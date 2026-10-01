import "server-only";

// In-memory, per server instance. Move to a shared store (for example Redis)
// once the admin runs on more than one instance.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map<string, number[]>();

function recent(key: string, now: number) {
  return (failures.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
}

/** Seconds until another attempt is allowed, or 0 when allowed now. */
export function lockoutSeconds(key: string, now = Date.now()) {
  const times = recent(key, now);
  failures.set(key, times);
  if (times.length < MAX_FAILURES) return 0;
  return Math.ceil((WINDOW_MS - (now - times[0])) / 1000);
}

export function recordFailure(key: string, now = Date.now()) {
  const times = recent(key, now);
  times.push(now);
  failures.set(key, times);
  if (failures.size > 5000) {
    for (const [entry, list] of failures) if (!list.some((time) => now - time < WINDOW_MS)) failures.delete(entry);
  }
}

export function clearFailures(key: string) {
  failures.delete(key);
}
