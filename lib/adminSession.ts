"use client";

/**
 * Deliberately kept only in JS memory — never localStorage, sessionStorage,
 * or a cookie. A real page reload or a duplicated tab re-executes this
 * module from scratch, resetting the token to null, so the admin panel
 * always requires a fresh login in either case.
 */
let token: string | null = null;

export function getAdminToken(): string | null {
  return token;
}

export function setAdminToken(next: string | null) {
  token = next;
}
