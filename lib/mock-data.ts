/**
 * Mock data for development mode
 * Used when NEXT_PUBLIC_USE_MOCK_DATA=true
 */

import type { Employee } from "@/types/employee"

let mockEmployees: Employee[] = [
  {
    id: "1",
    firstName: "Marie",
    lastName: "Dubois",
    email: "marie.dubois@example.com",
    phone: "+33 6 12 34 56 78",
    role: "Directrice Technique",
    linkedin: "https://linkedin.com/in/mariedubois",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    createdAt: "2024-01-15T10:30:00.000Z"
  },
  {
    id: "2",
    firstName: "Thomas",
    lastName: "Martin",
    email: "thomas.martin@example.com",
    phone: "+33 6 23 45 67 89",
    role: "Développeur Full Stack",
    linkedin: "https://linkedin.com/in/thomasmartin",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    createdAt: "2024-02-10T14:20:00.000Z"
  },
  {
    id: "3",
    firstName: "Sophie",
    lastName: "Bernard",
    email: "sophie.bernard@example.com",
    phone: "+33 6 34 56 78 90",
    role: "Designer UX/UI",
    linkedin: "https://linkedin.com/in/sophiebernard",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    createdAt: "2024-03-05T09:15:00.000Z"
  },
  {
    id: "4",
    firstName: "Lucas",
    lastName: "Petit",
    email: "lucas.petit@example.com",
    phone: "+33 6 45 67 89 01",
    role: "Chef de Projet",
    linkedin: "https://linkedin.com/in/lucaspetit",
    avatarUrl: "https://i.pravatar.cc/150?img=13",
    createdAt: "2024-01-20T11:45:00.000Z"
  },
  {
    id: "5",
    firstName: "Emma",
    lastName: "Rousseau",
    email: "emma.rousseau@example.com",
    phone: "+33 6 56 78 90 12",
    role: "Développeuse Frontend",
    linkedin: "https://linkedin.com/in/emmarousseau",
    avatarUrl: "https://i.pravatar.cc/150?img=9",
    createdAt: "2024-04-12T16:00:00.000Z"
  }
]

let mockAccounts = [
  {
    id: "admin-1",
    email: "admin@example.com",
    password: "$pbkdf2$100000$c2FsdHNhbHRzYWx0c2FsdA==$aGFzaGhhc2hoYXNoaGFzaGhhc2hoYXNoaGFzaA==", // password: admin123
    lastLogin: "2024-11-14T10:00:00.000Z"
  }
]

function delay(ms: number = 300) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function generateId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const mockAPI = {
  // Employees
  async getEmployees(sort?: string): Promise<Employee[]> {
    await delay()

    let sorted = [...mockEmployees]

    if (sort) {
      const [field, direction] = sort.split(":")
      sorted.sort((a, b) => {
        const aVal = a[field as keyof Employee] || ""
        const bVal = b[field as keyof Employee] || ""
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        return direction === "asc" ? comparison : -comparison
      })
    }

    return sorted
  },

  async getEmployee(id: string): Promise<Employee> {
    await delay()
    const employee = mockEmployees.find(e => e.id === id)
    if (!employee) throw new Error("Employé non trouvé")
    return employee
  },

  async createEmployee(data: Omit<Employee, "id" | "createdAt">): Promise<Employee> {
    await delay(500)

    // Check if email exists
    if (mockEmployees.some(e => e.email === data.email)) {
      throw new Error("Un employé avec cet email existe déjà")
    }

    const newEmployee: Employee = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString()
    }

    mockEmployees.push(newEmployee)
    return newEmployee
  },

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    await delay(500)

    const index = mockEmployees.findIndex(e => e.id === id)
    if (index === -1) throw new Error("Employé non trouvé")

    // Check email uniqueness if changing
    if (data.email && data.email !== mockEmployees[index].email) {
      if (mockEmployees.some(e => e.email === data.email && e.id !== id)) {
        throw new Error("Un employé avec cet email existe déjà")
      }
    }

    mockEmployees[index] = { ...mockEmployees[index], ...data }
    return mockEmployees[index]
  },

  async deleteEmployee(id: string): Promise<{ success: boolean; message: string }> {
    await delay(500)

    const index = mockEmployees.findIndex(e => e.id === id)
    if (index === -1) throw new Error("Employé non trouvé")

    mockEmployees.splice(index, 1)
    return { success: true, message: "Employé supprimé avec succès" }
  },

  // Auth
  async login(email: string, password: string) {
    await delay(800)

    const account = mockAccounts.find(a => a.email === email)
    if (!account) {
      throw new Error("Email ou mot de passe incorrect")
    }

    // In mock mode, accept any password for demo purposes
    const now = new Date().toISOString()
    account.lastLogin = now

    return {
      success: true,
      message: "Connexion réussie",
      account: {
        id: account.id,
        email: account.email,
        lastLogin: now
      }
    }
  },

  async logout() {
    await delay()
    return { success: true, message: "Déconnexion réussie" }
  },

  async getSession() {
    await delay()
    // In mock mode, always return authenticated
    return {
      authenticated: true,
      account: {
        id: "admin-1",
        email: "admin@example.com",
        lastLogin: new Date().toISOString()
      }
    }
  },

  // Upload
  async uploadProfilePicture(file: File) {
    await delay(1000)

    // Simulate upload by creating a fake URL
    const mockUrl = `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`

    return {
      success: true,
      url: mockUrl,
      filename: `mock-${file.name}`
    }
  },

  async deleteProfilePicture(filename: string) {
    await delay()
    return { success: true, message: "Image supprimée avec succès" }
  }
}
