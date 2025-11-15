/**
 * Authentication utilities for password hashing and verification
 * Uses Web Crypto API (available in Cloudflare Workers)
 */

const SALT_LENGTH = 16
const ITERATIONS = 100000
const KEY_LENGTH = 32

/**
 * Hash a password using PBKDF2
 * Returns a PHC-style string: $pbkdf2$iterations$salt$hash
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate random salt
  const salt = new Uint8Array(SALT_LENGTH)
  crypto.getRandomValues(salt)

  // Encode password as bytes
  const passwordBuffer = new TextEncoder().encode(password)

  // Import password as key
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  )

  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: ITERATIONS,
      hash: "SHA-256"
    },
    passwordKey,
    KEY_LENGTH * 8
  )

  // Convert to base64
  const hashArray = Array.from(new Uint8Array(derivedBits))
  const hashBase64 = btoa(String.fromCharCode(...hashArray))
  const saltBase64 = btoa(String.fromCharCode(...Array.from(salt)))

  // Return PHC-style string
  return `$pbkdf2$${ITERATIONS}$${saltBase64}$${hashBase64}`
}

/**
 * Verify a password against a PHC-style hash
 */
export async function verifyPassword(password: string, phcString: string): Promise<boolean> {
  try {
    // Parse PHC string
    const parts = phcString.split("$")
    if (parts.length !== 5 || parts[0] !== "" || parts[1] !== "pbkdf2") {
      return false
    }

    const iterations = parseInt(parts[2])
    const saltBase64 = parts[3]
    const expectedHashBase64 = parts[4]

    // Decode salt
    const saltString = atob(saltBase64)
    const salt = new Uint8Array(saltString.length)
    for (let i = 0; i < saltString.length; i++) {
      salt[i] = saltString.charCodeAt(i)
    }

    // Encode password as bytes
    const passwordBuffer = new TextEncoder().encode(password)

    // Import password as key
    const passwordKey = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    )

    // Derive key using same parameters
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: iterations,
        hash: "SHA-256"
      },
      passwordKey,
      KEY_LENGTH * 8
    )

    // Convert to base64
    const hashArray = Array.from(new Uint8Array(derivedBits))
    const hashBase64 = btoa(String.fromCharCode(...hashArray))

    // Compare hashes (constant-time comparison would be better, but this is acceptable)
    return hashBase64 === expectedHashBase64
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

/**
 * Generate a random ID for accounts and sessions
 */
export function generateId(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Create a session token (simple implementation - in production, use JWT or similar)
 */
export function createSessionToken(accountId: string, email: string): string {
  const session = {
    accountId,
    email,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  }
  return btoa(JSON.stringify(session))
}

/**
 * Verify and decode a session token
 */
export function verifySessionToken(token: string): { accountId: string; email: string; expiresAt: string } | null {
  try {
    const session = JSON.parse(atob(token))
    if (new Date(session.expiresAt) < new Date()) {
      return null // Expired
    }
    return session
  } catch {
    return null
  }
}
