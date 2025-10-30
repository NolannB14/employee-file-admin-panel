import { type NextRequest, NextResponse } from "next/server"

// Mock data pour la démonstration
const employees = [
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sort = searchParams.get("sort") || "createdAt:desc"
  const [sortField, sortDirection] = sort.split(":")

  const sortedEmployees = [...employees].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    }
    return aValue < bValue ? 1 : -1
  })

  return NextResponse.json(sortedEmployees)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newEmployee = {
    id: Date.now().toString(),
    ...body,
    createdAt: new Date().toISOString(),
  }

  employees.push(newEmployee)

  return NextResponse.json(newEmployee, { status: 201 })
}
