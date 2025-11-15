/**
 * Pages Function for user login
 * POST /api/auth/login - Authenticate user and create session
 */

interface Env {
  DB: D1Database
}

const SALT_LENGTH = 16
const ITERATIONS = 100000
const KEY_LENGTH = 32

async function verifyPassword(password: string, phcString: string): Promise<boolean> {
  try {
    const parts = phcString.split("$")
    if (parts.length !== 5 || parts[0] !== "" || parts[1] !== "pbkdf2") {
      return false
    }

    const iterations = parseInt(parts[2])
    const saltBase64 = parts[3]
    const expectedHashBase64 = parts[4]

    const saltString = atob(saltBase64)
    const salt = new Uint8Array(saltString.length)
    for (let i = 0; i < saltString.length; i++) {
      salt[i] = saltString.charCodeAt(i)
    }

    const passwordBuffer = new TextEncoder().encode(password)
    const passwordKey = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    )

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

    const hashArray = Array.from(new Uint8Array(derivedBits))
    const hashBase64 = btoa(String.fromCharCode(...hashArray))

    return hashBase64 === expectedHashBase64
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

function createSessionToken(accountId: string, email: string): string {
  const session = {
    accountId,
    email,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }
  return btoa(JSON.stringify(session))
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const { DB } = env
    const body = await request.json() as any
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return Response.json(
        { success: false, message: "Email et mot de passe requis" },
        { status: 400 }
      )
    }

    // Find account by email
    const account = await DB
      .prepare("SELECT * FROM accounts WHERE email = ?")
      .bind(email)
      .first()

    if (!account) {
      return Response.json(
        { success: false, message: "Email ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, account.password as string)

    if (!isValid) {
      return Response.json(
        { success: false, message: "Email ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    // Update last login
    const now = new Date().toISOString()
    await DB
      .prepare("UPDATE accounts SET lastLogin = ? WHERE id = ?")
      .bind(now, account.id)
      .run()

    // Create session token
    const sessionToken = createSessionToken(account.id as string, account.email as string)

    // Create response with session cookie
    const response = Response.json({
      success: true,
      message: "Connexion réussie",
      account: {
        id: account.id as string,
        email: account.email as string,
        lastLogin: now,
      },
    })

    // Set HTTP-only cookie (using Set-Cookie header)
    const cookieValue = `session=${sessionToken}; HttpOnly; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Lax`
    response.headers.set('Set-Cookie', cookieValue)

    return response
  } catch (error) {
    console.error("Login error:", error)
    return Response.json(
      { success: false, message: "Erreur lors de la connexion" },
      { status: 500 }
    )
  }
}
