"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { Employee } from "@/types/employee"
import { apiSend, apiUpload } from "@/lib/api"

interface EmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee | null
  onSuccess?: () => void
}

export function EmployeeModal({ isOpen, onClose, employee, onSuccess }: EmployeeModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    linkedin: "",
    avatarUrl: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        linkedin: employee.linkedin || "",
        avatarUrl: employee.avatarUrl || "",
      })
      setPreviewUrl(employee.avatarUrl || null)
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        linkedin: "",
        avatarUrl: "",
      })
      setPreviewUrl(null)
    }
    setErrors({})
    setSelectedFile(null)
  }, [employee, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est obligatoire"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est obligatoire"
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'email est obligatoire"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Le téléphone est obligatoire"
    }
    if (!formData.role.trim()) {
      newErrors.role = "La fonction est obligatoire"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadProfilePicture = async (file: File): Promise<string | null> => {
    try {
      setIsUploadingImage(true)
      const data = await apiUpload("/api/upload/profile-picture", file)
      return data.url
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de télécharger l'image",
        variant: "destructive",
      })
      return null
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      let avatarUrl = formData.avatarUrl

      // Upload profile picture if a new file was selected
      if (selectedFile) {
        const uploadedUrl = await uploadProfilePicture(selectedFile)
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        }
      }

      const url = employee ? `/api/employees/${employee.id}` : "/api/employees"
      const method = employee ? "PUT" : "POST"

      const data = await apiSend(url, method, { ...formData, avatarUrl })

      toast({
        title: employee ? "Fiche mise à jour" : "Fiche créée",
        description: `La fiche de ${formData.firstName} ${formData.lastName} a été ${employee ? "mise à jour" : "créée"} avec succès.`,
      })

      onClose()
      if (onSuccess) onSuccess()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'enregistrer la fiche. Réessayez.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const isFormValid = formData.firstName && formData.lastName && formData.email && formData.phone && formData.role

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{employee ? "Modifier un employé" : "Ajouter un employé"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Prénom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="Jean"
              />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Dupont"
              />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="jean.dupont@entreprise.com"
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Téléphone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+33 6 12 34 56 78"
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Fonction dans l'entreprise <span className="text-destructive">*</span>
            </Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
              placeholder="Développeur Full Stack"
            />
            {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              type="url"
              value={formData.linkedin}
              onChange={(e) => handleChange("linkedin", e.target.value)}
              placeholder="https://www.linkedin.com/in/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profilePicture">Photo de profil</Label>
            <div className="flex items-center gap-4">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Aperçu"
                  className="h-20 w-20 rounded-full object-cover border-2 border-border"
                />
              )}
              <Input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploadingImage}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP ou GIF. Maximum 5MB.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting || isUploadingImage}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting || isUploadingImage}
              className="bg-[#00B7D0] hover:bg-[#00A0B8] text-white"
            >
              {isSubmitting || isUploadingImage ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
