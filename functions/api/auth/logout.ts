/**
 * Pages Function for user logout
 * POST /api/auth/logout - Clear session cookie
 */

export const onRequestPost: PagesFunction = async () => {
  try {
    const response = Response.json({
      success: true,
      message: "Déconnexion réussie",
    })

    // Clear session cookie
    response.headers.set('Set-Cookie', 'session=; Path=/; Max-Age=0')

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return Response.json(
      { success: false, message: "Erreur lors de la déconnexion" },
      { status: 500 }
    )
  }
}
