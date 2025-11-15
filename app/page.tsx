"use client"

import { useState } from "react"
import { EmployeeTable } from "@/components/employee-table"
import { EmployeeModal } from "@/components/employee-modal"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search } from "lucide-react"
import type { Employee } from "@/types/employee"

export default function AdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleAddEmployee = () => {
    setSelectedEmployee(null)
    setIsModalOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setIsDeleteDialogOpen(true)
  }

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
            Panneau d'administration — Employés
          </h1>
          <p className="text-lg text-muted-foreground mb-6">Gérez les fiches de vos collaborateurs</p>

          <Alert className="bg-muted/50 border-border">
            <AlertDescription className="text-foreground">
              Ajoutez, modifiez ou supprimez des fiches. Les changements sont enregistrés en temps réel.
            </AlertDescription>
          </Alert>
        </header>

        {/* Action Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un employé…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button onClick={handleAddEmployee} className="bg-[#00B7D0] hover:bg-[#00A0B8] text-white">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une fiche employé
          </Button>
        </div>

        {/* Employee Table */}
        <EmployeeTable
          searchQuery={searchQuery}
          onEdit={handleEditEmployee}
          onDelete={handleDeleteClick}
          onView={handleViewEmployee}
          refreshTrigger={refreshTrigger}
        />

        {/* Employee Modal */}
        <EmployeeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          employee={selectedEmployee}
          onSuccess={handleRefresh}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          employee={employeeToDelete}
          onSuccess={handleRefresh}
        />
      </div>
    </div>
  )
}
