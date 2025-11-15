/**
 * Pages Function for employees list and creation
 * GET /api/employees - List all employees with optional sorting
 * POST /api/employees - Create a new employee
 */

interface Env {
  DB: D1Database
}

function generateId(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const { DB } = env
    const url = new URL(request.url)
    const sort = url.searchParams.get("sort") || "createdAt:desc"
    const [sortField, sortDirection] = sort.split(":")

    // Validate sort field to prevent SQL injection
    const allowedFields = ["firstName", "lastName", "email", "role", "createdAt"]
    const validSortField = allowedFields.includes(sortField) ? sortField : "createdAt"
    const validSortDirection = sortDirection === "asc" ? "ASC" : "DESC"

    const { results } = await DB
      .prepare(`SELECT * FROM employees ORDER BY ${validSortField} ${validSortDirection}`)
      .all()

    return Response.json(results)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return Response.json(
      { error: "Erreur lors de la récupération des employés" },
      { status: 500 }
    )
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const { DB } = env
    const body = await request.json() as any

    const { firstName, lastName, email, phone, role, linkedin, avatarUrl } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return Response.json(
        { error: "Les champs prénom, nom et email sont requis" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await DB
      .prepare("SELECT id FROM employees WHERE email = ?")
      .bind(email)
      .first()

    if (existing) {
      return Response.json(
        { error: "Un employé avec cet email existe déjà" },
        { status: 409 }
      )
    }

    // Generate ID
    const id = generateId()

    // Insert employee
    await DB
      .prepare(
        `INSERT INTO employees (id, firstName, lastName, email, phone, role, linkedin, avatarUrl)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(id, firstName, lastName, email, phone || null, role || null, linkedin || null, avatarUrl || null)
      .run()

    // Fetch the created employee
    const newEmployee = await DB
      .prepare("SELECT * FROM employees WHERE id = ?")
      .bind(id)
      .first()

    return Response.json(newEmployee, { status: 201 })
  } catch (error) {
    console.error("Error creating employee:", error)
    return Response.json(
      { error: "Erreur lors de la création de l'employé" },
      { status: 500 }
    )
  }
}
