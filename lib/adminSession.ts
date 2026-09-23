"use client";

/**
 * Held in sessionStorage rather than a persistent cookie, so the session
 * survives reloads and backgrounding within this browser tab (mobile
 * browsers frequently discard and reload background tabs) but disappears
 * once the tab is closed, and never carries over to a freshly opened tab.
 */
const STORAGE_KEY = "cgh_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.sessionStorage.setItem(STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // sessionStorage unavailable (e.g. private browsing) — session just won't persist.
  }
}
