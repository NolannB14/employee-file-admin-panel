"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreVertical, Eye, Pencil, Trash2, Mail, Phone } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Alert } from "@/components/ui/alert"
import type { Employee } from "@/types/employee"

interface EmployeeTableProps {
  searchQuery: string
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
  onView: (employee: Employee) => void
}

export function EmployeeTable({ searchQuery, onEdit, onDelete, onView }: EmployeeTableProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof Employee>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    fetchEmployees()
  }, [sortField, sortDirection])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/employees?sort=${sortField}:${sortDirection}`)
      if (!response.ok) throw new Error("Erreur lors du chargement")
      const data = await response.json()
      setEmployees(data)
    } catch (err) {
      setError("Impossible de charger les employés. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const query = searchQuery.toLowerCase()
    return (
      employee.firstName.toLowerCase().includes(query) ||
      employee.lastName.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      employee.role.toLowerCase().includes(query)
    )
  })

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        {error}
      </Alert>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead
                className="cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort("firstName")}
              >
                Identité
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort("email")}
              >
                Email
              </TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort("createdAt")}
              >
                Date d'ajout
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  Aucun employé trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee, index) => (
                <TableRow key={employee.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={employee.avatarUrl || "/placeholder.svg"}
                          alt={`${employee.firstName} ${employee.lastName}`}
                        />
                        <AvatarFallback className="bg-[#00B7D0] text-white">
                          {getInitials(employee.firstName, employee.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">{employee.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${employee.email}`}
                      className="flex items-center gap-2 text-[#00B7D0] hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {employee.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`tel:${employee.phone}`}
                      className="flex items-center gap-2 text-[#00B7D0] hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {employee.phone}
                    </a>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(employee.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(employee)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir la fiche
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(employee)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(employee)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
