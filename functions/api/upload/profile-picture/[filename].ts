/**
 * Pages Function for retrieving and deleting profile pictures from R2
 * GET /api/upload/profile-picture/:filename - Get a profile picture
 * DELETE /api/upload/profile-picture/:filename - Delete a profile picture
 */

interface Env {
  PROFILE_PICTURES: R2Bucket
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  try {
    const { PROFILE_PICTURES } = env
    const filename = params.filename as string

    // Get object from R2
    const object = await PROFILE_PICTURES.get(filename)

    if (!object) {
      return Response.json({ error: "Image non trouvée" }, { status: 404 })
    }

    // Return the image with appropriate headers
    const headers = new Headers()
    headers.set("Content-Type", object.httpMetadata?.contentType || "image/jpeg")
    headers.set("Cache-Control", "public, max-age=31536000, immutable")

    return new Response(object.body, { headers })
  } catch (error) {
    console.error("Error fetching profile picture:", error)
    return Response.json(
      { error: "Erreur lors de la récupération de l'image" },
      { status: 500 }
    )
  }
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  try {
    const { PROFILE_PICTURES } = env
    const filename = params.filename as string

    // Delete object from R2
    await PROFILE_PICTURES.delete(filename)

    return Response.json({ success: true, message: "Image supprimée avec succès" })
  } catch (error) {
    console.error("Error deleting profile picture:", error)
    return Response.json(
      { error: "Erreur lors de la suppression de l'image" },
      { status: 500 }
    )
  }
}
