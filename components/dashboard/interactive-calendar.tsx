"use client";

import { useState, useMemo, ReactNode } from "react";
import { DayProps } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Event } from "@/types"; // Asumo que Event incluye un 'id'
import { Button } from "@/components/ui/button";
import {
  format,
  addMonths,
  subMonths,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// Importa el formulario correcto
import { EventForm } from "../event-form";
import {
  calculateStressMetrics,
  getStressGradient,
} from "@/lib/stress-calculator-improved";
import { Pencil, Trash2 } from "lucide-react";

type CalendarView = "month" | "week" | "day";

interface InteractiveCalendarProps {
  events: Event[];
  colorLow?: string;
  colorHigh?: string;
  // onUpdateEvent ya no es necesario, el formulario lo maneja
  onDeleteEvent: (eventId: string | number) => Promise<void>;
  onRefreshEvents: () => void; // Para recargar datos después de editar/crear
}

// Componente EventItem mejorado con acciones
const EventItem = ({
  event,
  onEdit,
  onDelete,
}: {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}) => (
  <div className="py-2 px-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors flex justify-between items-center">
    <div>
      <p className="font-semibold text-sm">{event.title}</p>
      <p className="text-xs text-muted-foreground">
        {format(new Date(event.start_time), "p", { locale: es })} -{" "}
        {format(new Date(event.end_time), "p", { locale: es })}
      </p>
    </div>
    <div className="flex-shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onEdit(event)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={() => onDelete(event)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

export function InteractiveCalendar({
  events,
  colorLow = "#22c55e",
  colorHigh = "#ef4444",
  onDeleteEvent,
  onRefreshEvents,
}: InteractiveCalendarProps) {
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Estado para los modales
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // Estado solo para eliminar

  const { eventsByDate, dailyStressLevels } = useMemo(() => {
    const eventsByDate = events.reduce((acc, event) => {
      const date = format(new Date(event.start_time), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    }, {} as Record<string, Event[]>);
    const dailyStressLevels = Object.keys(eventsByDate).reduce(
      (acc, dateStr) => {
        const dayEvents = eventsByDate[dateStr];
        // By appending T00:00:00, we ensure the date string is parsed in the user's local timezone,
        // avoiding the UTC conversion issue that can subtract a day.
        const localDate = new Date(dateStr + "T00:00:00");
        const metrics = calculateStressMetrics(
          dayEvents,
          startOfDay(localDate),
          endOfDay(localDate),
          "day"
        );

        acc[dateStr] = metrics.stressLevel;
        return acc;
      },
      {} as Record<string, number>
    );

    return { eventsByDate, dailyStressLevels };
  }, [events]);

  // Handlers para Navegación
  const handlePrev = () => {
    if (view === "month") setSelectedDate(subMonths(selectedDate, 1));
    if (view === "week") setSelectedDate(subWeeks(selectedDate, 1));
    if (view === "day") setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNext = () => {
    if (view === "month") setSelectedDate(addMonths(selectedDate, 1));
    if (view === "week") setSelectedDate(addWeeks(selectedDate, 1));
    if (view === "day") setSelectedDate(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Handlers para Acciones de Eventos
  const handleEditClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedEvent(null);
    onRefreshEvents(); // Llama a la función de refrescar
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return;
    setIsDeleting(true);
    try {
      await onDeleteEvent(selectedEvent.id);
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
      onRefreshEvents() // Opcional: refrescar también al eliminar
    } catch (err) {
      console.error("Failed to delete event:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const headerTitle = useMemo(() => {
    if (view === "day")
      return format(selectedDate, "MMMM d, yyyy", { locale: es });
    if (view === "week") {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
    return format(selectedDate, "MMMM yyyy", { locale: es });
  }, [view, selectedDate]);

  const CustomDay = (props: DayProps) => {
    const dayDate = props.day?.date ?? new Date();
    const dateStr = format(dayDate, "yyyy-MM-dd");
    const stress = dailyStressLevels[dateStr] || 0;
    const glareBackground = getStressGradient(stress, colorLow, colorHigh);
    return (
      <div className="relative h-full w-full">
        <div
          className="absolute inset-0 pointer-events-none opacity-20 rounded-md"
          style={{ background: glareBackground }}
        />
        {props.children}
      </div>
    );
  };

  // --- VISTAS (sin cambios) ---

  const renderMonthView = () => {
    const eventsForSelectedDay =
      eventsByDate[format(selectedDate, "yyyy-MM-dd")] || [];
    eventsForSelectedDay.sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={selectedDate}
            onMonthChange={setSelectedDate}
            className="p-0"
            classNames={{
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
            }}
            modifiers={{
              hasEvent: (date) =>
                dailyStressLevels[format(date, "yyyy-MM-dd")] > 0,
            }}
            modifiersClassNames={{ hasEvent: "font-bold !text-primary" }}
            components={{ Day: CustomDay }}
          />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              Eventos - {format(selectedDate, "MMMM d", { locale: es })}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[380px] overflow-y-auto p-0">
            {eventsForSelectedDay.length > 0 ? (
              eventsForSelectedDay.map((event) => (
                <EventItem
                  key={event.id}
                  event={event}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))
            ) : (
              <p className="p-4 text-center text-muted-foreground">
                No hay eventos este día.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) =>
      addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i)
    );
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dateStr] || [];
          dayEvents.sort(
            (a, b) =>
              new Date(a.start_time).getTime() -
              new Date(b.start_time).getTime()
          );
          const stress = dailyStressLevels[dateStr] || 0;
          const glareBackground = getStressGradient(
            stress,
            colorLow,
            colorHigh
          );
          return (
            <Card
              key={day.toString()}
              className={`flex flex-col relative overflow-hidden ${
                isSameDay(day, new Date()) ? "border-primary" : ""
              }`}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{ background: glareBackground }}
              />
              <CardHeader className="p-3 text-center border-b bg-transparent relative z-10">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  {format(day, "EEE", { locale: es })}
                </p>
                <p
                  className={`text-lg font-bold ${
                    isSameDay(day, selectedDate) ? "text-primary" : ""
                  }`}
                >
                  {format(day, "d")}
                </p>
              </CardHeader>
              <CardContent className="p-0 flex-grow overflow-y-auto bg-transparent relative z-10">
                {dayEvents.length > 0 ? (
                  dayEvents.map((event) => (
                    <EventItem
                      key={event.id}
                      event={event}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                    />
                  ))
                ) : (
                  <p className="p-4 text-xs text-center text-muted-foreground">
                    Sin eventos
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const dayEvents = eventsByDate[dateStr] || [];
    dayEvents.sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    const stress = dailyStressLevels[dateStr] || 0;
    const glareBackground = getStressGradient(stress, colorLow, colorHigh);
    return (
      <Card className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: glareBackground }}
        />
        <CardHeader>
          <CardTitle>
            Eventos - {format(selectedDate, "MMMM d, yyyy", { locale: es })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative z-10">
          {dayEvents.length > 0 ? (
            dayEvents.map((event) => (
              <EventItem
                key={event.id}
                event={event}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))
          ) : (
            <p className="p-6 text-center text-muted-foreground">
              No hay eventos programados para este día.
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const viewContent: Record<CalendarView, ReactNode> = {
    month: renderMonthView(),
    week: renderWeekView(),
    day: renderDayView(),
  };

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrev}>
              Ant
            </Button>
            <Button variant="outline" onClick={handleToday}>
              Hoy
            </Button>
            <Button variant="outline" onClick={handleNext}>
              Sig
            </Button>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-center order-first sm:order-none">
            {headerTitle}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant={view === "day" ? "default" : "outline"}
              onClick={() => setView("day")}
            >
              Día
            </Button>
            <Button
              variant={view === "week" ? "default" : "outline"}
              onClick={() => setView("week")}
            >
              Semana
            </Button>
            <Button
              variant={view === "month" ? "default" : "outline"}
              onClick={() => setView("month")}
            >
              Mes
            </Button>
          </div>
        </CardContent>
      </Card>

      {viewContent[view]}

      {/* --- MODALES --- */}

      {/* Modal de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          {/* Renderiza tu EventForm aquí.
            Le pasamos el evento seleccionado como initialData.
            El formulario manejará su propia lógica de envío.
            Solo necesitamos saber cuándo se completa (onSuccess) o se cancela (onCancel).
          */}
          <EventForm
            initialData={selectedEvent}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmar Eliminación */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el evento:
              <br />
              <strong className="py-2 inline-block">
                {selectedEvent?.title}
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
