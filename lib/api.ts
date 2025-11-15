/**
 * API client for making requests to Cloudflare Pages Functions
 * Supports mock mode for development (NEXT_PUBLIC_USE_MOCK_DATA=true)
 */

import { mockAPI } from "./mock-data"

const BASE = process.env.NEXT_PUBLIC_API_BASE || ""
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"

// Helper to extract query params
function getQueryParam(path: string, param: string): string | null {
  const url = new URL(path, 'http://localhost')
  return url.searchParams.get(param)
}

export async function apiGet(path: string) {
  // Mock mode
  if (USE_MOCK) {
    if (path.startsWith('/api/employees?')) {
      const sort = getQueryParam(path, 'sort')
      return mockAPI.getEmployees(sort || undefined)
    }
    if (path.match(/^\/api\/employees\/[^/]+$/)) {
      const id = path.split('/').pop()!
      return mockAPI.getEmployee(id)
    }
    if (path === '/api/auth/session') {
      return mockAPI.getSession()
    }
  }

  // Real API mode
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store' })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(error.error || `GET ${path} -> ${res.status}`)
  }
  return res.json()
}

export async function apiSend(path: string, method: string, body?: any) {
  // Mock mode
  if (USE_MOCK) {
    if (path === '/api/employees' && method === 'POST') {
      return mockAPI.createEmployee(body)
    }
    if (path.match(/^\/api\/employees\/[^/]+$/) && (method === 'PUT' || method === 'PATCH')) {
      const id = path.split('/').pop()!
      return mockAPI.updateEmployee(id, body)
    }
    if (path.match(/^\/api\/employees\/[^/]+$/) && method === 'DELETE') {
      const id = path.split('/').pop()!
      return mockAPI.deleteEmployee(id)
    }
    if (path === '/api/auth/login' && method === 'POST') {
      return mockAPI.login(body.email, body.password)
    }
    if (path === '/api/auth/logout' && method === 'POST') {
      return mockAPI.logout()
    }
  }

  // Real API mode
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  }
  if (body !== undefined) init.body = JSON.stringify(body)

  const res = await fetch(`${BASE}${path}`, init)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(error.error || `${method} ${path} -> ${res.status}`)
  }

  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return res.json()
  }
  return res.text()
}

export async function apiUpload(path: string, file: File) {
  // Mock mode
  if (USE_MOCK) {
    if (path === '/api/upload/profile-picture') {
      return mockAPI.uploadProfilePicture(file)
    }
  }

  // Real API mode
  const fd = new FormData()
  fd.append('file', file)

  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    body: fd,
    credentials: 'include'
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(error.error || `UPLOAD ${path} -> ${res.status}`)
  }
  return res.json()
}
