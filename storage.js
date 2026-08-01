// Standalone storage shim.
// Mirrors the same get/set/delete/list API the app already uses,
// but backs it with the browser's own localStorage instead of
// Claude's artifact storage — so it works on any static site,
// including GitHub Pages, with no external dependency.

(function () {
  function namespacedKey(key, shared) {
    return "oracle:" + (shared ? "shared" : "personal") + ":" + key;
  }

  window.storage = {
    async get(key, shared = false) {
      try {
        const raw = localStorage.getItem(namespacedKey(key, shared));
        if (raw === null) return null;
        return { key, value: raw, shared };
      } catch (err) {
        return null;
      }
    },

    async set(key, value, shared = false) {
      try {
        localStorage.setItem(namespacedKey(key, shared), value);
        return { key, value, shared };
      } catch (err) {
        return null;
      }
    },

    async delete(key, shared = false) {
      try {
        localStorage.removeItem(namespacedKey(key, shared));
        return { key, deleted: true, shared };
      } catch (err) {
        return null;
      }
    },

    async list(prefix = "", shared = false) {
      try {
        const nsPrefix = namespacedKey(prefix, shared);
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(nsPrefix)) {
            keys.push(k.slice(("oracle:" + (shared ? "shared" : "personal") + ":").length));
          }
        }
        return { keys, prefix, shared };
      } catch (err) {
        return null;
      }
    },
  };
})();
