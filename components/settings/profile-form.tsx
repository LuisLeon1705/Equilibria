"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"

interface ProfileFormProps {
  user?: any
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [fullName, setFullName] = useState("")
  const [fieldOfStudy, setFieldOfStudy] = useState("")
  const [hoursPerWeek, setHoursPerWeek] = useState(0)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = getSupabaseClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

      if (data) {
        setFullName(data.full_name || "")
        setFieldOfStudy(data.field_of_study || "")
        setHoursPerWeek(data.hours_per_week_working || 0)
      }
      setEmail(user.email || "")
      setLoading(false)
    }

    fetchProfile()
  }, [user, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)

    try {
      if (!user) {
        setError("Usuario no encontrado")
        return
      }

      if (password !== confirmPassword) {
        toast({
          title: 'Error',
          description: 'Las contraseñas no coinciden.',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      const authUpdates: { email?: string; password?: string; } = {};
      if (email && email !== user.email) {
        authUpdates.email = email;
      }
      if (password) {
        authUpdates.password = password;
      }
      
      if(Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) {
            setError(authError.message)
            setSaving(false)
            return
        }
      }

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          email: email,
          full_name: fullName,
          field_of_study: fieldOfStudy,
          hours_per_week_working: hoursPerWeek,
        }, {
          onConflict: 'user_id',
        })

      if (upsertError) {
        setError(upsertError.message)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        toast({
            title: 'Perfil actualizado',
            description: 'Tu perfil ha sido actualizado exitosamente.',
        });
      }
    } catch (err) {
      setError("Ocurrió un error inesperado")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Cargando...</div>
  }

  return (
    <Card className="border border-border p-6">
      <h2 className="text-xl font-bold text-foreground mb-4">Configuración de Perfil</h2>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md flex gap-2 items-start">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100/30 border border-green-500/30 rounded-md">
          <p className="text-sm text-green-600">¡Perfil actualizado exitosamente!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-foreground mb-1">Nombre completo</Label>
          <Input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={saving} />
        </div>
        <div>
          <Label className="block text-sm font-medium text-foreground mb-1">Correo electrónico</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={saving} />
        </div>
        <div>
          <Label className="block text-sm font-medium text-foreground mb-1">Área de estudio</Label>
          <Input type="text" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} disabled={saving} />
        </div>
        <div>
          <Label className="block text-sm font-medium text-foreground mb-1">Horas trabajadas por semana</Label>
          <Input
            type="number"
            min="0"
            max="60"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(Number.parseInt(e.target.value))}
            disabled={saving}
          />
        </div>
        <div>
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
        </div>
        <div>
            <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
            <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            />
        </div>

        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </Card>
  )
}
