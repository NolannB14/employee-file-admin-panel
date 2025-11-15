/**
 * Pages Function for session verification
 * GET /api/auth/session - Verify current session
 */

interface Env {
  DB: D1Database
}

function verifySessionToken(token: string): { accountId: string; email: string; expiresAt: string } | null {
  try {
    const session = JSON.parse(atob(token))
    if (new Date(session.expiresAt) < new Date()) {
      return null
    }
    return session
  } catch {
    return null
  }
}

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('Cookie')
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').map(c => c.trim())
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=')
    if (key === name) return value
  }
  return null
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const { DB } = env
    const sessionToken = getCookie(request, 'session')

    if (!sessionToken) {
      return Response.json(
        { authenticated: false, message: "Aucune session active" },
        { status: 401 }
      )
    }

    // Verify token
    const session = verifySessionToken(sessionToken)

    if (!session) {
      return Response.json(
        { authenticated: false, message: "Session expirée" },
        { status: 401 }
      )
    }

    // Get account from database
    const account = await DB
      .prepare("SELECT id, email, lastLogin FROM accounts WHERE id = ?")
      .bind(session.accountId)
      .first()

    if (!account) {
      return Response.json(
        { authenticated: false, message: "Compte introuvable" },
        { status: 401 }
      )
    }

    return Response.json({
      authenticated: true,
      account: {
        id: account.id,
        email: account.email,
        lastLogin: account.lastLogin,
      },
    })
  } catch (error) {
    console.error("Session verification error:", error)
    return Response.json(
      { authenticated: false, message: "Erreur de vérification de session" },
      { status: 500 }
    )
  }
}
