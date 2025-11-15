/**
 * Pages Function for uploading profile pictures to R2
 * POST /api/upload/profile-picture - Upload a new profile picture
 */

interface Env {
  PROFILE_PICTURES: R2Bucket
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

function generateId(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const { PROFILE_PICTURES } = env
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return Response.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: "Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF" },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: "Le fichier est trop volumineux. Taille maximale : 5MB" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || "jpg"
    const filename = `${generateId()}.${fileExtension}`

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Upload to R2
    await PROFILE_PICTURES.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    })

    // Return the URL path
    const imageUrl = `/api/upload/profile-picture/${filename}`

    return Response.json({
      success: true,
      url: imageUrl,
      filename,
    })
  } catch (error) {
    console.error("Error uploading profile picture:", error)
    return Response.json(
      { error: "Erreur lors du téléchargement de l'image" },
      { status: 500 }
    )
  }
}
