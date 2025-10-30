"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle } from "lucide-react"
import type { Employee } from "@/types/employee"

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee | null
}

export function DeleteConfirmDialog({ isOpen, onClose, employee }: DeleteConfirmDialogProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!employee) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Erreur lors de la suppression")

      toast({
        title: "Fiche supprimée",
        description: `La fiche de ${employee.firstName} ${employee.lastName} a été supprimée avec succès.`,
      })

      onClose()
      window.location.reload()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la fiche. Réessayez.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!employee) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-xl">Confirmer la suppression</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Êtes-vous sûr de vouloir supprimer la fiche de{" "}
            <span className="font-semibold text-foreground">
              {employee.firstName} {employee.lastName}
            </span>{" "}
            ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isDeleting}>
            Annuler
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
