/**
 * Pages Function for individual employee operations
 * GET /api/employees/:id - Get employee by ID
 * PUT /api/employees/:id - Update employee
 * DELETE /api/employees/:id - Delete employee
 */

interface Env {
  DB: D1Database
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  try {
    const { DB } = env
    const id = params.id as string

    const employee = await DB
      .prepare("SELECT * FROM employees WHERE id = ?")
      .bind(id)
      .first()

    if (!employee) {
      return Response.json({ error: "Employé non trouvé" }, { status: 404 })
    }

    return Response.json(employee)
  } catch (error) {
    console.error("Error fetching employee:", error)
    return Response.json(
      { error: "Erreur lors de la récupération de l'employé" },
      { status: 500 }
    )
  }
}

export const onRequestPut: PagesFunction<Env> = async ({ env, params, request }) => {
  try {
    const { DB } = env
    const id = params.id as string
    const body = await request.json() as any

    // Check if employee exists
    const existing = await DB
      .prepare("SELECT id FROM employees WHERE id = ?")
      .bind(id)
      .first()

    if (!existing) {
      return Response.json({ error: "Employé non trouvé" }, { status: 404 })
    }

    // Check if email is being changed and if it already exists
    if (body.email) {
      const emailExists = await DB
        .prepare("SELECT id FROM employees WHERE email = ? AND id != ?")
        .bind(body.email, id)
        .first()

      if (emailExists) {
        return Response.json(
          { error: "Un employé avec cet email existe déjà" },
          { status: 409 }
        )
      }
    }

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []

    if (body.firstName !== undefined) {
      updates.push("firstName = ?")
      values.push(body.firstName)
    }
    if (body.lastName !== undefined) {
      updates.push("lastName = ?")
      values.push(body.lastName)
    }
    if (body.email !== undefined) {
      updates.push("email = ?")
      values.push(body.email)
    }
    if (body.phone !== undefined) {
      updates.push("phone = ?")
      values.push(body.phone)
    }
    if (body.role !== undefined) {
      updates.push("role = ?")
      values.push(body.role)
    }
    if (body.linkedin !== undefined) {
      updates.push("linkedin = ?")
      values.push(body.linkedin)
    }
    if (body.avatarUrl !== undefined) {
      updates.push("avatarUrl = ?")
      values.push(body.avatarUrl)
    }

    if (updates.length === 0) {
      return Response.json({ error: "Aucune donnée à mettre à jour" }, { status: 400 })
    }

    values.push(id)

    await DB
      .prepare(`UPDATE employees SET ${updates.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run()

    // Fetch updated employee
    const updatedEmployee = await DB
      .prepare("SELECT * FROM employees WHERE id = ?")
      .bind(id)
      .first()

    return Response.json(updatedEmployee)
  } catch (error) {
    console.error("Error updating employee:", error)
    return Response.json(
      { error: "Erreur lors de la mise à jour de l'employé" },
      { status: 500 }
    )
  }
}

export const onRequestPatch: PagesFunction<Env> = async ({ env, params, request }) => {
  // PATCH is the same as PUT for this implementation
  return onRequestPut({ env, params, request } as any)
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  try {
    const { DB } = env
    const id = params.id as string

    // Check if employee exists
    const existing = await DB
      .prepare("SELECT id FROM employees WHERE id = ?")
      .bind(id)
      .first()

    if (!existing) {
      return Response.json({ error: "Employé non trouvé" }, { status: 404 })
    }

    // Delete employee
    await DB
      .prepare("DELETE FROM employees WHERE id = ?")
      .bind(id)
      .run()

    return Response.json({ success: true, message: "Employé supprimé avec succès" })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return Response.json(
      { error: "Erreur lors de la suppression de l'employé" },
      { status: 500 }
    )
  }
}
