"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react"

const DEFAULT_PREFERENCES = {
  background_type: "color",
  background_color: "#f8f9fa",
  stress_color_low: "#22c55e",
  stress_color_high: "#ef4444",
  theme: "light",
  default_calendar_view: "week",
  stress_alerts_enabled: true,
  stress_alert_threshold: 7,
}

export default function InstructionsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [preferences, setPreferences] = useState<any>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)
  const [expandedSection, setExpandedSection] = useState<string | null>("getting-started")

  useEffect(() => {
    const checkAuthAndGetPrefs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: prefsData } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single()
        if (prefsData) {
          setPreferences(prefsData)
        }
      }
      setLoading(false)
    }
    checkAuthAndGetPrefs()
  }, [supabase])

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const sections = [
    {
      id: "getting-started",
      title: "Comenzando",
      icon: <Zap className="w-5 h-5" />,
      content: [
        {
          subtitle: "1. Completa tu perfil",
          text: "Después de registrarte, ve a Configuración para añadir tus datos: nombre completo, área de estudio y horas promedio de trabajo por semana. Esto ayuda a Equilibria a personalizar tus recomendaciones de estrés.",
        },
        {
          subtitle: "2. Añade tus primeros eventos",
          text: "Haz clic en 'Agregar evento' para crear tu horario. Incluye: clases, turnos de trabajo, exámenes, proyectos y compromisos personales. Establece el tipo de evento y el nivel de prioridad.",
        },
        {
          subtitle: "3. Crea tareas",
          text: "Añade tareas vinculadas a tus eventos o independientes. Las tareas pueden representar entregas, sesiones de estudio o actividades laborales. Indica su prioridad y horas estimadas.",
        },
      ],
    },
    {
      id: "calendar-system",
      title: "Comprendiendo el calendario",
      icon: <Calendar className="w-5 h-5" />,
      content: [
        {
          subtitle: "Vista semanal",
          text: "Tu calendario muestra una semana de 7 días. Cada columna representa un día, con colores según el tipo de evento: Azul (clases), Verde (trabajo), Rojo (exámenes), Púrpura (proyectos), Gris (personal).",
        },
        {
          subtitle: "Buffers de tiempo dinámicos",
          text: "Equilibria inserta automáticamente tiempo de buffer entre eventos para prevenir el agotamiento. Estos buffers (mostrados como áreas claras) se ajustan según la intensidad del evento. Después de un examen, obtienes más tiempo de recuperación.",
        },
        {
          subtitle: "Tipos de eventos y prioridades",
          text: "Prioridad 1-3: Eventos de baja presión (reuniones, tareas casuales). Prioridad 4-5: Media (clases regulares). Prioridad 6-7: Alta (exámenes, proyectos importantes). Prioridad 8-10: Crítica (exámenes finales, entregas).",
        },
      ],
    },
    {
      id: "stress-indicator",
      title: "Indicador de estrés",
      icon: <AlertCircle className="w-5 h-5" />,
      content: [
        {
          subtitle: "Cómo funciona",
          text: "La barra de estrés (arriba a la derecha) analiza: densidad del calendario (% del tiempo con eventos), eventos de alta prioridad esta semana y disponibilidad de buffers. Se actualiza en tiempo real al agregar eventos.",
        },
        {
          subtitle: "Códigos de color",
          text: "Verde (1-3): Carga saludable - Buen equilibrio. Amarillo (4-6): Moderado - Presta atención a los buffers. Naranja (7-8): Alto - Considera reprogramar tareas no críticas. Rojo (9-10): Crítico - Riesgo de agotamiento.",
        },
        {
          subtitle: "Recomendaciones",
          text: "Cuando el estrés es alto, Equilibria sugiere: 'Añadir más buffers', 'Reducir elementos de alta prioridad' o 'Delegar tareas'. Estas aparecen en la barra lateral del panel.",
        },
      ],
    },
    {
      id: "task-management",
      title: "Gestión de tareas",
      icon: <CheckCircle className="w-5 h-5" />,
      content: [
        {
          subtitle: "Tareas vinculadas",
          text: "Vincula tareas directamente a eventos (p.ej., 'Estudiar para el examen' vinculado al evento del examen). Esto mantiene tus tareas organizadas y muestra qué eventos requieren preparación.",
        },
        {
          subtitle: "Ciclo de vida de la tarea",
          text: "Mueve las tareas por etapas: 'Por hacer' → 'En progreso' → 'Completadas'. Al completar tareas, tu nivel de estrés general disminuye porque gestionas tu carga.",
        },
        {
          subtitle: "Horas estimadas",
          text: "Al crear una tarea, estima cuánto tardará. Esto ayuda a Equilibria a calcular si tienes tiempo suficiente antes de las fechas límite e identificar semanas sobrecargadas.",
        },
      ],
    },
    {
      id: "reports",
      title: "Informes y análisis",
      icon: <BookOpen className="w-5 h-5" />,
      content: [
        {
          subtitle: "Informes semanales",
          text: "Visita Informes para ver métricas de la semana pasada: tareas totales, tasa de finalización, nivel de estrés promedio y horas registradas de estudio/trabajo.",
        },
        {
          subtitle: "Tendencias a lo largo del tiempo",
          text: "Los gráficos muestran tus niveles de estrés y finalización de tareas a lo largo de las semanas. Identifica patrones: ¿Te estresas más ciertos días? ¿Completas tareas de forma constante?",
        },
        {
          subtitle: "Información de productividad",
          text: "Observa correlaciones entre la densidad del calendario y la finalización de tareas. Por ejemplo: 'Semanas con >6 eventos/día tienen 15% menos tasa de finalización.'",
        },
      ],
    },
    {
      id: "best-practices",
      title: "Mejores prácticas",
      icon: <Zap className="w-5 h-5" />,
      content: [
        {
          subtitle: "Planifica semanalmente",
          text: "Cada domingo, revisa tu semana. Añade todos los eventos, estima horas de tareas y revisa tu nivel de estrés. Si es alto, redistribuye tareas o reprograma elementos no críticos.",
        },
        {
          subtitle: "Usa el tiempo de buffer sabiamente",
          text: "No programes eventos durante el tiempo de buffer. Úsalo para descansos, imprevistos o recuperación mental. Los buffers son tu protección ante un día caótico.",
        },
        {
          subtitle: "Actualiza el estado de las tareas",
          text: "Marca regularmente las tareas como 'En progreso' o 'Completadas'. Esto mantiene preciso tu indicador de estrés y te ayuda a ver el progreso real.",
        },
        {
          subtitle: "Revisa tus límites",
          text: "Si consistentemente tienes >8 de estrés, reconsidera tu equilibrio trabajo-estudio. La investigación detrás de Equilibria muestra que estudiantes que trabajan 8+ horas/día mientras estudian tienen un rendimiento académico significativamente menor.",
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Resolución de problemas",
      icon: <AlertCircle className="w-5 h-5" />,
      content: [
        {
          subtitle: "Eventos no aparecen",
          text: "Asegúrate de que los eventos tengan hora de inicio y fin y una fecha válida. Actualiza el navegador si es necesario.",
        },
        {
          subtitle: "Nivel de estrés demasiado alto",
          text: "Revisa si tienes muchos eventos de alta prioridad agrupados. Añade buffers o mueve eventos de baja prioridad a otras semanas.",
        },
        {
          subtitle: "No se puede editar un evento",
          text: "Asegúrate de estar viendo la semana actual. Los eventos solo pueden editarse dentro de la app. Haz clic en el evento para abrir sus detalles.",
        },
        {
          subtitle: "Preguntas o problemas",
          text: "Contacta a support@equilibria.app o visita nuestra página de Preguntas Frecuentes para más ayuda.",
        },
      ],
    },
  ]

  const backgroundStyle = {
    backgroundColor:
      preferences?.background_type === "color"
        ? preferences.background_color
        : "transparent",
    backgroundImage:
      preferences?.background_type === "image" && preferences?.background_image_url
        ? `url('${preferences.background_image_url}')`
        : "none",
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" style={backgroundStyle}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </Button>
          {user && (
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90">Ir al Panel</Button>
            </Link>
          )}
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Guía de Equilibria</h1>
          <p className="text-lg text-muted-foreground">
            Aprende a gestionar tu tiempo, reducir el estrés y lograr un mejor equilibrio entre trabajo y estudio
          </p>
        </div>

        <div className="space-y-3">
          {sections.map((section) => (
            <Card key={section.id} className="border border-border overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-primary">{section.icon}</div>
                  <h2 className="text-lg font-semibold text-foreground text-left">{section.title}</h2>
                </div>
                {expandedSection === section.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {expandedSection === section.id && (
                <div className="px-6 py-4 bg-muted/30 border-t border-border space-y-4">
                  {section.content.map((item, idx) => (
                    <div key={idx}>
                      <h3 className="font-medium text-foreground mb-2">{item.subtitle}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        <Card className="border border-border p-6 mt-8">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Consejo rápido
          </h3>
          <p className="text-muted-foreground text-sm">
            Las investigaciones muestran que los estudiantes trabajadores que gestionan activamente los buffers y monitorizan los niveles de estrés tienen un 20-30% mejor rendimiento académico. Empieza con pequeños cambios: añade un evento a la vez, revisa tu indicador de estrés diariamente y ajusta tu horario según sea necesario.
          </p>
        </Card>

        <div className="text-center mt-8 text-muted-foreground text-sm">
          <p>¿Tienes más preguntas? Contáctanos o visita nuestra página de Preguntas Frecuentes</p>
        </div>
      </div>
    </div>
  )
}
