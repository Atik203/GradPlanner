const isServer = typeof window === "undefined";
// NEXT_BACKEND_URL is a private server-only env var (not prefixed NEXT_PUBLIC_) pointing to
// the deployed Express backend. On the client, leave BACKEND_URL empty so fetchApi uses
// relative paths which are proxied by next.config.ts rewrites.
const BACKEND_URL = isServer ? (process.env.NEXT_BACKEND_URL ?? "") : "";


export async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `${BACKEND_URL}${path}`;
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Ensure session cookies are sent/received
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = `HTTP error! status: ${res.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorMessage;
    } catch (_) {
      // Not JSON
    }
    throw new Error(errorMessage);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}
