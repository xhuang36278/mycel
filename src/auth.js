const url = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const tokenKey = "mycel-auth-session";

export const authConfigured = Boolean(url && key);

function headers(token) {
  return {
    "Content-Type": "application/json",
    apikey: key,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${url}/auth/v1${path}`, {
    ...options,
    headers: { ...headers(options.token), ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.message || data.error_description || "Authentication failed");
  return data;
}

function saveSession(data) {
  if (data?.access_token) localStorage.setItem(tokenKey, JSON.stringify(data));
  return data;
}

export const mycelAuth = {
  async session() {
    const stored = JSON.parse(localStorage.getItem(tokenKey) || "null");
    if (!stored?.access_token) return null;
    try {
      const user = await request("/user", { token: stored.access_token });
      return { ...stored, user };
    } catch {
      localStorage.removeItem(tokenKey);
      return null;
    }
  },
  async signUp(email, password, name) {
    return saveSession(await request("/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, data: { name } }),
    }));
  },
  async signIn(email, password) {
    return saveSession(await request("/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }));
  },
  async signOut() {
    const stored = JSON.parse(localStorage.getItem(tokenKey) || "null");
    if (stored?.access_token) await request("/logout", { method: "POST", token: stored.access_token }).catch(() => {});
    localStorage.removeItem(tokenKey);
  },
};
