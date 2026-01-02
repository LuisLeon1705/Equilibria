"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle, Calendar, Check, X } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [fieldOfStudy, setFieldOfStudy] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  const passwordsMatch = password === confirmPassword && password.length > 0
  const passwordLengthValid = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const isFormValid =
    email &&
    password &&
    confirmPassword &&
    fullName &&
    passwordsMatch &&
    passwordLengthValid &&
    hasUpperCase &&
    hasNumbers

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!passwordsMatch) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (!passwordLengthValid) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          data: {
            full_name: fullName,
            field_of_study: fieldOfStudy,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
      } else if (data?.user?.id) {
        try {
          const DEFAULT_PREFERENCES = {
            user_id: data.user.id,
            background_type: "color",
            background_color: "#f8f9fa",
            stress_color_low: "#22c55e",
            stress_color_high: "#ef4444",
            theme: "light",
            default_calendar_view: "week",
            stress_alerts_enabled: true,
            stress_alert_threshold: 7,
          }

          await supabase.from("user_preferences").insert([DEFAULT_PREFERENCES])
        } catch (prefError) {
          console.log("[v0] Could not create preferences:", prefError)
        }

        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 1000)
      }
    } catch (err) {
      setError("Un error inesperado ocurrió. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">Equilibria</span>
        </div>

        <Card className="border border-border bg-card p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Crea tu cuenta</h1>
          <p className="text-muted-foreground mb-6">Unete a estudiantes-trabajadores que gestionan mejor su tiempo</p>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md flex gap-2 items-start">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100/10 border border-green-300/30 rounded-md flex gap-2 items-start">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">¡Cuenta Creada Exitosamente! Redirigiendo...</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1">
                Nombre Completo
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-foreground mb-1">
                Campo de Estuido (Opcional)
              </label>
              <Input
                id="fieldOfStudy"
                type="text"
                placeholder="e.g., Computer Science"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <div className="mt-2 space-y-1 text-xs">
                <p className="flex items-center gap-2">
                  {passwordLengthValid ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={passwordLengthValid ? "text-green-600" : "text-muted-foreground"}>
                    Minimo 8 caracteres
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  {hasUpperCase ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={hasUpperCase ? "text-green-600" : "text-muted-foreground"}>
                    Al menos una letra mayúscula
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  {hasNumbers ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={hasNumbers ? "text-green-600" : "text-muted-foreground"}>Al menos un número</span>
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                Confirmar Contraseña
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
              {confirmPassword && (
                <p className="mt-2 text-xs flex items-center gap-2">
                  {passwordsMatch ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Las contraseñas coinciden</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 text-destructive" />
                      <span className="text-destructive">Las contraseñas no coinciden</span>
                    </>
                  )}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading || !isFormValid}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-4">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Iniciar Sesión
            </Link>
          </p>
        </Card>

        <p className="text-center text-muted-foreground text-xs mt-6">
          Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad
        </p>
      </div>
    </div>
  )
}
