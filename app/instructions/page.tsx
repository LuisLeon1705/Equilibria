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
      title: "Getting Started",
      icon: <Zap className="w-5 h-5" />,
      content: [
        {
          subtitle: "1. Complete Your Profile",
          text: "After signing up, go to Settings to add your details: full name, field of study, and average work hours per week. This helps Equilibria personalize your stress recommendations.",
        },
        {
          subtitle: "2. Add Your First Events",
          text: "Click 'Add Event' to create your schedule. Include: classes, work shifts, exams, projects, and personal commitments. Set the event type and priority level.",
        },
        {
          subtitle: "3. Create Tasks",
          text: "Add tasks linked to your events or standalone. Tasks can represent assignments, study sessions, or work-related activities. Mark their priority and estimated hours.",
        },
      ],
    },
    {
      id: "calendar-system",
      title: "Understanding the Calendar",
      icon: <Calendar className="w-5 h-5" />,
      content: [
        {
          subtitle: "Weekly View",
          text: "Your calendar shows a 7-day week. Each column represents one day, color-coded by event type: Blue (classes), Green (work), Red (exams), Purple (projects), Gray (personal).",
        },
        {
          subtitle: "Dynamic Time Buffers",
          text: "Equilibria automatically inserts buffer time between events to prevent burnout. These buffers (shown as light areas) are adjusted based on event intensity. After an exam, you get more buffer time to recover.",
        },
        {
          subtitle: "Event Types & Priorities",
          text: "Priority 1-3: Low stress events (meetings, casual tasks). Priority 4-5: Medium (regular classes). Priority 6-7: High (exams, major projects). Priority 8-10: Critical (final exams, submissions).",
        },
      ],
    },
    {
      id: "stress-indicator",
      title: "The Stress Indicator",
      icon: <AlertCircle className="w-5 h-5" />,
      content: [
        {
          subtitle: "How It Works",
          text: "The stress bar (top right) analyzes: schedule density (% of time with events), high-priority events this week, and buffer time availability. It updates in real-time as you add events.",
        },
        {
          subtitle: "Color Codes",
          text: "Green (1-3): Healthy load - You have good work-life balance. Yellow (4-6): Moderate - Pay attention to buffers. Orange (7-8): High - Consider rescheduling non-critical tasks. Red (9-10): Critical - Potential burnout risk.",
        },
        {
          subtitle: "Recommendations",
          text: "When stress is high, Equilibria suggests: 'Add more buffers', 'Reduce high-priority items', or 'Delegate tasks'. These appear in your dashboard sidebar.",
        },
      ],
    },
    {
      id: "task-management",
      title: "Task Management",
      icon: <CheckCircle className="w-5 h-5" />,
      content: [
        {
          subtitle: "Linked Tasks",
          text: "Link tasks directly to events (e.g., 'Study for Exam' linked to your exam event). This keeps your tasks organized and shows which events have preparation tasks.",
        },
        {
          subtitle: "Task Lifecycle",
          text: "Move tasks through stages: 'To Do' → 'In Progress' → 'Completed'. As you complete tasks, your overall stress level decreases because you're managing your workload.",
        },
        {
          subtitle: "Estimated Hours",
          text: "When creating a task, estimate how long it will take. This helps Equilibria calculate if you have enough time before deadlines and identify overloaded weeks.",
        },
      ],
    },
    {
      id: "reports",
      title: "Reports & Insights",
      icon: <BookOpen className="w-5 h-5" />,
      content: [
        {
          subtitle: "Weekly Reports",
          text: "Visit Reports to see metrics for the past week: total tasks, completion rate, average stress level, and hours logged for study/work.",
        },
        {
          subtitle: "Trends Over Time",
          text: "Charts show your stress levels and task completion over weeks. Identify patterns: Do you stress more on certain days? Are you completing tasks consistently?",
        },
        {
          subtitle: "Productivity Insights",
          text: "See correlations between your schedule density and task completion. For example: 'Weeks with >6 events/day have 15% lower completion rates.'",
        },
      ],
    },
    {
      id: "best-practices",
      title: "Best Practices",
      icon: <Zap className="w-5 h-5" />,
      content: [
        {
          subtitle: "Plan Weekly",
          text: "Every Sunday, review your week. Add all events, estimate task hours, and check your stress level. If it's high, redistribute tasks or find non-critical items to reschedule.",
        },
        {
          subtitle: "Use Buffer Time Wisely",
          text: "Don't schedule events during buffer time. Use it for breaks, unexpected delays, or mental recovery. Buffers are your protection against a chaotic day.",
        },
        {
          subtitle: "Update Task Status",
          text: "Regularly mark tasks as 'In Progress' or 'Completed'. This keeps your stress indicator accurate and helps you see real progress.",
        },
        {
          subtitle: "Review Your Limits",
          text: "If you consistently have >8 stress level, reconsider your work-study balance. The research behind Equilibria shows students working 8+ hours/day while studying have significantly lower academic performance.",
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: <AlertCircle className="w-5 h-5" />,
      content: [
        {
          subtitle: "Events Not Appearing",
          text: "Ensure events have a start and end time, and a valid date. Refresh your browser if needed.",
        },
        {
          subtitle: "Stress Level Too High",
          text: "Check if you have many high-priority events clustered together. Add buffer time or move low-priority events to other weeks.",
        },
        {
          subtitle: "Can't Edit an Event",
          text: "Make sure you're viewing the current week. Events can only be edited within the app. Click the event to open its details.",
        },
        {
          subtitle: "Questions or Issues",
          text: "Contact support@equilibria.app or visit our FAQ page for more help.",
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
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" style={backgroundStyle}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          {user && (
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90">Go to Dashboard</Button>
            </Link>
          )}
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Equilibria Guide</h1>
          <p className="text-lg text-muted-foreground">
            Learn how to manage your time, reduce stress, and achieve better work-study balance
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
            Quick Tip
          </h3>
          <p className="text-muted-foreground text-sm">
            Research shows student-workers who actively manage buffers and monitor stress levels have 20-30% better
            academic performance. Start with small changes: add one event at a time, review your stress indicator daily,
            and adjust your schedule accordingly.
          </p>
        </Card>

        <div className="text-center mt-8 text-muted-foreground text-sm">
          <p>Have more questions? Contact us or visit our FAQ</p>
        </div>
      </div>
    </div>
  )
}
