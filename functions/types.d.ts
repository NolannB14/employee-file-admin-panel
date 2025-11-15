/**
 * Type definitions for Cloudflare Pages Functions
 */

declare global {
  interface Env {
    DB: D1Database
    PROFILE_PICTURES: R2Bucket
  }

  type PagesFunction<Env = unknown> = (context: {
    request: Request
    env: Env
    params: Record<string, string>
    waitUntil: (promise: Promise<any>) => void
    next: (input?: Request | string, init?: RequestInit) => Promise<Response>
    data: Record<string, unknown>
  }) => Response | Promise<Response>
}

export {}
