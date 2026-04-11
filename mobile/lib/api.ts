import Constants from "expo-constants";
import NetInfo from "@react-native-community/netinfo";
import { supabase } from "./supabase";

const BASE_URL: string =
  Constants.expoConfig?.extra?.apiBaseUrl ?? "https://jonnoai.com";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function checkNetwork(): Promise<void> {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    throw new Error("No internet connection. Please check your network and try again.");
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 1): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (e: any) {
      if (attempt === retries) throw e;
      // Wait 1s before retry
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error("Request failed");
}

export async function apiGet<T>(path: string): Promise<T> {
  await checkNetwork();
  const headers = await getAuthHeaders();
  const res = await fetchWithRetry(`${BASE_URL}${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  await checkNetwork();
  const headers = await getAuthHeaders();
  const res = await fetchWithRetry(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `POST ${path} failed: ${res.status}`);
  }
  return res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  await checkNetwork();
  const headers = await getAuthHeaders();
  const res = await fetchWithRetry(`${BASE_URL}${path}`, { method: "DELETE", headers });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  await checkNetwork();
  const headers = await getAuthHeaders();
  const res = await fetchWithRetry(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return res.json();
}
