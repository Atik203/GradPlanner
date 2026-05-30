const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

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
