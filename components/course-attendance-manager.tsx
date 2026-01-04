"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  Plus,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { CreateSessionDialog } from "./create-session-dialog";
import { TakeAttendanceView, type AttendanceRecord, type AttendanceSession } from "./take-attendance-view";
import { AttendanceStatsView } from "./attendance-stats-view";

// Extended AttendanceSession for internal use with additional fields from API
interface ExtendedAttendanceSession extends AttendanceSession {
  createdAt?: string;
  // Conteos pueden venir de diferentes formas del backend
  presentCount?: number;
  absentCount?: number;
  lateCount?: number;
  excusedCount?: number;
  // O como _count
  _count?: {
    records?: number;
    present?: number;
    absent?: number;
    late?: number;
    excused?: number;
  };
  // O como totalStudents
  totalStudents?: number;
}

interface CourseAttendanceManagerProps {
  courseId: string;
}

type ViewMode = "list" | "take-attendance" | "stats";

export function CourseAttendanceManager({ courseId }: CourseAttendanceManagerProps) {
  const [sessions, setSessions] = useState<ExtendedAttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedSession, setSelectedSession] = useState<ExtendedAttendanceSession | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [courseId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/attendance/course/${courseId}/sessions`);
      if (res.ok) {
        const data = await res.json();
        console.log("Attendance sessions response:", data); // Debug
        setSessions(Array.isArray(data) ? data : data.sessions || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al cargar las sesiones");
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Error al cargar las sesiones");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (sessionData: {
    title: string;
    description?: string;
    sessionDate: string;
    startTime?: string;
    endTime?: string;
  }) => {
    try {
      const res = await fetch("/api/attendance/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: parseInt(courseId),
          ...sessionData,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al crear sesion");
      }

      setIsCreateDialogOpen(false);
      await fetchSessions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al crear sesion");
    }
  };

  const handleDeleteSession = async (sessionId: string | number) => {
    if (!confirm("¿Estás seguro de eliminar esta sesión? Se eliminarán todos los registros de asistencia.")) return;

    try {
      const res = await fetch(`/api/attendance/session/${sessionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al eliminar sesion");
      }

      await fetchSessions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar sesion");
    }
  };

  const handleTakeAttendance = (session: ExtendedAttendanceSession) => {
    setSelectedSession(session);
    setViewMode("take-attendance");
  };

  const handleBackToList = () => {
    setSelectedSession(null);
    setViewMode("list");
    fetchSessions(); // Refresh to get updated counts
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return null;
    return time.slice(0, 5); // HH:MM
  };

  const getTotalStudents = (session: ExtendedAttendanceSession) => {
    // Intentar diferentes formatos de respuesta del backend
    
    // 1. Si viene totalStudents directamente
    if (session.totalStudents !== undefined) {
      return session.totalStudents;
    }
    
    // 2. Si viene como array de records
    if (session.records && Array.isArray(session.records)) {
      return session.records.length;
    }
    
    // 3. Si viene como _count.records
    if (session._count?.records !== undefined) {
      return session._count.records;
    }
    
    // 4. Si vienen los conteos individuales
    const fromCounts = (session.presentCount || 0) + (session.absentCount || 0) + (session.lateCount || 0) + (session.excusedCount || 0);
    if (fromCounts > 0) {
      return fromCounts;
    }
    
    // 5. Si vienen en _count como conteos individuales
    if (session._count) {
      return (session._count.present || 0) + (session._count.absent || 0) + (session._count.late || 0) + (session._count.excused || 0);
    }
    
    return 0;
  };

  const getStatusCounts = (session: ExtendedAttendanceSession) => {
    // Si vienen los records, calcular los conteos
    if (session.records && Array.isArray(session.records)) {
      return {
        present: session.records.filter(r => r.status === "present").length,
        absent: session.records.filter(r => r.status === "absent").length,
        late: session.records.filter(r => r.status === "late").length,
        excused: session.records.filter(r => r.status === "excused").length,
      };
    }
    
    // Si vienen como conteos directos
    return {
      present: session.presentCount || session._count?.present || 0,
      absent: session.absentCount || session._count?.absent || 0,
      late: session.lateCount || session._count?.late || 0,
      excused: session.excusedCount || session._count?.excused || 0,
    };
  };

  // Render stats view
  if (viewMode === "stats") {
    return (
      <AttendanceStatsView
        courseId={courseId}
        onBack={() => setViewMode("list")}
      />
    );
  }

  // Render take attendance view
  if (viewMode === "take-attendance" && selectedSession) {
    return (
      <TakeAttendanceView
        session={selectedSession}
        onBack={handleBackToList}
      />
    );
  }

  // Loading state
  if (loading && sessions.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ClipboardCheck className="h-8 w-8" />
              Asistencia
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8" />
            Asistencia
          </h1>
          <p className="text-muted-foreground mt-1">
            {sessions.length} {sessions.length === 1 ? "sesión" : "sesiones"} de clase
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode("stats")} className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Ver Estadísticas
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Sesión
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchSessions} variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sessions List */}
      {!error && (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ClipboardCheck className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay sesiones de clase</h3>
                <p className="text-muted-foreground mb-4">
                  Crea una sesión para comenzar a tomar asistencia
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Primera Sesión
                </Button>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card
                key={session.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTakeAttendance(session)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Title and Date */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{session.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(session.sessionDate)}</span>
                            {session.startTime && (
                              <>
                                <span>•</span>
                                <Clock className="h-4 w-4" />
                                <span>
                                  {formatTime(session.startTime)}
                                  {session.endTime && ` - ${formatTime(session.endTime)}`}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {session.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {session.description}
                        </p>
                      )}

                      {/* Attendance Summary */}
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{getTotalStudents(session)}</span>
                          <span className="text-muted-foreground">estudiantes</span>
                        </div>
                        
                        {getTotalStudents(session) > 0 && (() => {
                          const counts = getStatusCounts(session);
                          return (
                            <div className="flex items-center gap-3 text-sm">
                              <span className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle className="h-3.5 w-3.5" />
                                {counts.present}
                              </span>
                              <span className="flex items-center gap-1 text-rose-600">
                                <XCircle className="h-3.5 w-3.5" />
                                {counts.absent}
                              </span>
                              <span className="flex items-center gap-1 text-amber-600">
                                <Clock className="h-3.5 w-3.5" />
                                {counts.late}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create Session Dialog */}
      <CreateSessionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateSession}
      />
    </div>
  );
}

