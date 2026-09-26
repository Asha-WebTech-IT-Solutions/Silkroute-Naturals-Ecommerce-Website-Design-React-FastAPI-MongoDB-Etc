import axios from "axios";

const PROD_BACKEND_URL = "https://silkroute-naturals-ecommerce-website.onrender.com";

function resolveBackendUrl() {
  const fromEnv = (process.env.REACT_APP_BACKEND_URL || "").trim();
  if (fromEnv && fromEnv !== "undefined" && fromEnv !== "null" && /^https?:\/\//i.test(fromEnv)) {
    return fromEnv.replace(/\/+$/, "");
  }
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  if (host && host !== "localhost" && host !== "127.0.0.1") return PROD_BACKEND_URL;
  return "http://localhost:8001";
}

export const BACKEND_URL = resolveBackendUrl();
export const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API, withCredentials: true });

// An SPA fallback (or a proxy error page) answers with HTML and HTTP 200.
// Treat that as a failure so HTML strings never reach component state.
api.interceptors.response.use((response) => {
  const d = response.data;
  if (typeof d === "string" && /^\s*<(!doctype|html)/i.test(d)) {
    return Promise.reject(new Error(`Expected JSON from ${response.config?.url}, received an HTML document.`));
  }
  return response;
});

// Always resolves to an array, whatever the endpoint or the network does.
export async function getList(path, config) {
  try {
    const r = await api.get(path, config);
    const d = r.data;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.items)) return d.items;
    if (d && Array.isArray(d.results)) return d.results;
    return [];
  } catch (e) {
    console.error("[api] getList failed:", path, e.message);
    return [];
  }
}

export default api;
