"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  Megaphone, 
  MessageSquare, 
  TrendingUp, 
  Clock,
  Plus,
  CheckCircle2
} from "lucide-react";

interface OverviewProps {
  courseId: string;
  onCreateAssignment?: () => void;
  onCreateAnnouncement?: () => void;
  onSectionChange?: (section: "assignments" | "announcements" | "students" | "forums") => void;
}

interface CourseStats {
  totalStudents: number;
  publishedAssignments: number;
  totalAnnouncements: number;
  activeThreads: number;
  averageProgress: number;
}

interface RecentActivity {
  id: string;
  type: "enrollment" | "assignment" | "announcement" | "forum";
  description: string;
  timestamp: string;
  user?: string;
}

interface AnnouncementData {
  announcement_id?: string;
  id?: string;
  created_at?: string;
  createdAt?: string;
  title: string;
  author_name?: string;
  authorName?: string;
  author?: { name?: string };
}

interface AssignmentData {
  assignment_id?: string;
  id?: string;
  created_at?: string;
  createdAt?: string;
  due_date?: string;
  dueDate?: string;
  title: string;
}

interface ThreadData {
  thread_id?: string;
  id?: string;
  created_at?: string;
  createdAt?: string;
  title: string;
  author_name?: string;
  authorName?: string;
  author?: { name?: string };
  isLocked?: boolean;
}

interface StudentData {
  id: string;
  name: string;
  enrollmentDate?: string;
  enrollment_date?: string;
  created_at?: string;
  createdAt?: string;
}

export function CourseManagementOverview({ 
  courseId, 
  onCreateAssignment,
  onCreateAnnouncement,
  onSectionChange
}: OverviewProps) {
  const [stats, setStats] = useState<CourseStats>({
    totalStudents: 0,
    publishedAssignments: 0,
    totalAnnouncements: 0,
    activeThreads: 0,
    averageProgress: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        // Fetch all stats in parallel
        const [studentsRes, assignmentsRes, forumsRes, announcementsRes] = await Promise.all([
          fetch(`/api/courses/${courseId}/students`),
          fetch(`/api/assignments/course/${courseId}`),
          fetch(`/api/forums/course/${courseId}`),
          fetch(`/api/announcements/course/${courseId}`),
        ]);

        // Parsear todas las respuestas una sola vez
        const studentsData = studentsRes.ok ? await studentsRes.json() : null;
        const assignmentsData = assignmentsRes.ok ? await assignmentsRes.json() : null;
        const forumsData = forumsRes.ok ? await forumsRes.json() : null;
        const announcementsData = announcementsRes.ok ? await announcementsRes.json() : null;

        // Obtener estudiantes
        const studentsArray = studentsData?.students || [];
        const totalStudents = studentsData?.totalStudents || studentsArray.length;

        // Obtener assignments
        const assignmentsArray = Array.isArray(assignmentsData) 
          ? assignmentsData 
          : (assignmentsData?.assignments || []);
        const publishedAssignments = assignmentsArray.length;

        // Obtener foros activos (no bloqueados)
        const forumsArray = Array.isArray(forumsData) 
          ? forumsData 
          : (forumsData?.threads || []);
        const activeThreads = forumsArray.filter((thread: { isLocked?: boolean }) => !thread.isLocked).length;

        // Obtener anuncios
        const announcementsArray = Array.isArray(announcementsData) 
          ? announcementsData 
          : (announcementsData?.announcements || []);
        const totalAnnouncements = announcementsArray.length;

        // Actualizar stats con datos reales
        setStats(prev => ({
          ...prev,
          totalStudents,
          publishedAssignments,
          activeThreads,
          totalAnnouncements,
        }));

        // Construir actividad reciente
        const activities: RecentActivity[] = [];

        // Agregar anuncios recientes (últimos 5)
        announcementsArray
          .slice(0, 5)
          .forEach((announcement: AnnouncementData) => {
            const timestamp = announcement.created_at || announcement.createdAt;
            if (timestamp) {
              activities.push({
                id: `ann-${announcement.announcement_id || announcement.id}`,
                type: "announcement",
                description: `Nuevo anuncio: ${announcement.title}`,
                timestamp: timestamp,
                user: announcement.author_name || announcement.authorName || announcement.author?.name,
              });
            }
          });

        // Agregar assignments recientes (últimos 5)
        assignmentsArray
          .slice(0, 5)
          .forEach((assignment: AssignmentData) => {
            const timestamp = assignment.created_at || assignment.createdAt || assignment.due_date || assignment.dueDate;
            if (timestamp) {
              activities.push({
                id: `asg-${assignment.assignment_id || assignment.id}`,
                type: "assignment",
                description: `Nueva tarea: ${assignment.title}`,
                timestamp: timestamp,
              });
            }
          });

        // Agregar foros recientes (últimos 5)
        forumsArray
          .slice(0, 5)
          .forEach((thread: ThreadData) => {
            const timestamp = thread.created_at || thread.createdAt;
            if (timestamp) {
              activities.push({
                id: `thread-${thread.thread_id || thread.id}`,
                type: "forum",
                description: `Nueva discusión: ${thread.title}`,
                timestamp: timestamp,
                user: thread.author_name || thread.authorName || thread.author?.name,
              });
            }
          });

        // Agregar inscripciones recientes (últimas 5)
        const recentStudents = studentsArray
          .filter((student: StudentData) => {
            // Solo incluir si tiene alguna fecha
            return student.enrollmentDate || student.enrollment_date || student.created_at || student.createdAt;
          })
          .sort((a: StudentData, b: StudentData) => {
            const dateA = a.enrollmentDate || a.enrollment_date || a.created_at || a.createdAt || "";
            const dateB = b.enrollmentDate || b.enrollment_date || b.created_at || b.createdAt || "";
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          })
          .slice(0, 5);
        
        recentStudents.forEach((student: StudentData) => {
          const timestamp = student.enrollmentDate || student.enrollment_date || student.created_at || student.createdAt || new Date().toISOString();
          activities.push({
            id: `enroll-${student.id}`,
            type: "enrollment",
            description: `${student.name} se inscribió en el curso`,
            timestamp: timestamp,
            user: student.name,
          });
        });

        // Ordenar todas las actividades por fecha (más recientes primero) y filtrar fechas inválidas
        const validActivities = activities
          .filter(a => {
            const date = new Date(a.timestamp);
            return !isNaN(date.getTime());
          })
          .sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          });

        // Tomar las 10 más recientes
        setRecentActivities(validActivities.slice(0, 10));
      } catch (error) {
        console.error("Error fetching real stats:", error);
        // En caso de error, mantener los valores en 0 (no usar mock)
      } finally {
        setLoading(false);
      }
    };

    fetchRealStats();
  }, [courseId]);

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "enrollment":
        return <Users className="h-4 w-4" />;
      case "assignment":
        return <FileText className="h-4 w-4" />;
      case "announcement":
        return <Megaphone className="h-4 w-4" />;
      case "forum":
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: RecentActivity["type"]) => {
    switch (type) {
      case "enrollment":
        return "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "assignment":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
      case "announcement":
        return "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400";
      case "forum":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Hace ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours}h`;
    } else if (diffDays === 1) {
      return "Ayer";
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resumen del Curso</h1>
          <p className="text-muted-foreground mt-1">
            Vista general del progreso y actividad del curso
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCreateAssignment} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </Button>
          <Button onClick={onCreateAnnouncement} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Anuncio
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <Card className="overflow-hidden border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Estudiantes
                </p>
                <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total inscritos
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Published Assignments */}
        <Card className="overflow-hidden border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tareas Activas
                </p>
                <p className="text-3xl font-bold mt-2">{stats.publishedAssignments}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Publicadas
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Announcements */}
        <Card className="overflow-hidden border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Anuncios
                </p>
                <p className="text-3xl font-bold mt-2">{stats.totalAnnouncements}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total publicados
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Megaphone className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Forum Threads */}
        <Card className="overflow-hidden border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Foros Activos
                </p>
                <p className="text-3xl font-bold mt-2">{stats.activeThreads}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Discusiones abiertas
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Average Progress - Comentado porque no hay endpoint disponible */}
        {/* <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Progreso Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold">{stats.averageProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${stats.averageProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Promedio de progreso de todos los estudiantes en el curso
              </p>
            </div>
          </CardContent>
        </Card> */}

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No hay actividad reciente
                  </p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (onSectionChange) {
                        if (activity.type === "assignment") {
                          onSectionChange("assignments");
                        } else if (activity.type === "announcement") {
                          onSectionChange("announcements");
                        } else if (activity.type === "forum") {
                          onSectionChange("forums");
                        } else if (activity.type === "enrollment") {
                          onSectionChange("students");
                        }
                      }
                    }}
                  >
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(activity.timestamp)}
                        {activity.user && ` • ${activity.user}`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={onCreateAssignment}
            >
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">Crear Tarea</span>
              <span className="text-xs text-muted-foreground">
                Nueva evaluación
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={onCreateAnnouncement}
            >
              <Megaphone className="h-6 w-6 text-amber-600" />
              <span className="font-semibold">Publicar Anuncio</span>
              <span className="text-xs text-muted-foreground">
                Notificar estudiantes
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onSectionChange?.("students")}
            >
              <Users className="h-6 w-6 text-emerald-600" />
              <span className="font-semibold">Ver Estudiantes</span>
              <span className="text-xs text-muted-foreground">
                {stats.totalStudents} inscritos
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onSectionChange?.("assignments")}
            >
              <CheckCircle2 className="h-6 w-6 text-purple-600" />
              <span className="font-semibold">Revisar Entregas</span>
              <span className="text-xs text-muted-foreground">
                Calificar tareas
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

