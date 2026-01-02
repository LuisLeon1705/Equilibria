import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, TrendingUp, AlertCircle } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Equilibria</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90">Empezar</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
          Domina Tu Tiempo,
          <br />
          Reduce Tu Estrés
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
          Equilibria es una plataforma diseñada para ayudar a estudiantes trabajadores a gestionar su tiempo de manera efectiva,
          equilibrando sus responsabilidades académicas y laborales con facilidad.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Empezar
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            Ver Demo
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/30 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16 text-foreground">Utilidades especializadas</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Colchones de tiempo dinamicos</h3>
              <p className="text-muted-foreground">
                Tiempos de descanso inteligentes que se ajustan automáticamente según la carga de tu horario, asegurando que siempre tengas tiempo para recargar energías.

              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Indicador de estres</h3>
              <p className="text-muted-foreground">
                Efectos visuales en tiempo real que muestran cuando tu horario se está volviendo demasiado denso, ayudándote a tomar decisiones proactivas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Calendario Unificado</h3>
              <p className="text-muted-foreground">
                Clases, turnos de trabajo y tareas, todo en un solo lugar para una gestión de tiempo sin complicaciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>© 2025 Equilibria. Hecho para estudiantes trabajadores en todo el mundo.</p>
        </div>
      </footer>
    </main>
  )
}
