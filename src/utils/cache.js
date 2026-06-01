const store = new Map();
const DEFAULT_TTL = 5 * 60 * 1000;

module.exports = {
  get(key) {
    const hit = store.get(key);
    if (!hit) return null;
    if (Date.now() > hit.exp) { store.delete(key); return null; }
    return hit.data;
  },
  set(key, data, ttlMs = DEFAULT_TTL) {
    store.set(key, { data, exp: Date.now() + ttlMs });
  },
};
