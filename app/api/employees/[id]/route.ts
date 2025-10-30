import { type NextRequest, NextResponse } from "next/server"

// Mock data - dans une vraie app, ceci serait dans une base de données
let employees = [
  {
    id: "1",
    firstName: "Marie",
    lastName: "Dubois",
    email: "marie.dubois@entreprise.com",
    phone: "+33 6 12 34 56 78",
    role: "Directrice Marketing",
    linkedin: "https://www.linkedin.com/in/mariedubois",
    avatarUrl: "/professional-woman.png",
    createdAt: "2025-01-15T10:30:00Z",
  },
  {
    id: "2",
    firstName: "Thomas",
    lastName: "Martin",
    email: "thomas.martin@entreprise.com",
    phone: "+33 6 23 45 67 89",
    role: "Développeur Full Stack",
    linkedin: "https://www.linkedin.com/in/thomasmartin",
    avatarUrl: "/man-developer.png",
    createdAt: "2025-02-20T14:15:00Z",
  },
  {
    id: "3",
    firstName: "Sophie",
    lastName: "Bernard",
    email: "sophie.bernard@entreprise.com",
    phone: "+33 6 34 56 78 90",
    role: "Designer UX/UI",
    linkedin: "https://www.linkedin.com/in/sophiebernard",
    avatarUrl: "/woman-designer.png",
    createdAt: "2025-03-10T09:00:00Z",
  },
]

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const index = employees.findIndex((emp) => emp.id === id)

  if (index === -1) {
    return NextResponse.json({ error: "Employé non trouvé" }, { status: 404 })
  }

  employees[index] = {
    ...employees[index],
    ...body,
  }

  return NextResponse.json(employees[index])
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const index = employees.findIndex((emp) => emp.id === id)

  if (index === -1) {
    return NextResponse.json({ error: "Employé non trouvé" }, { status: 404 })
  }

  employees = employees.filter((emp) => emp.id !== id)

  return NextResponse.json({ success: true })
}
