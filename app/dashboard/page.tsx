"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserId, getUserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { CreateCourseDialog } from "@/components/create-course-dialog";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { EmptyState } from "@/components/empty-state";
import { Plus, BookOpen } from "lucide-react";

interface Course {
  id?: string;
  title: string;
  description: string;
  enrollment_status?: "pending" | "accepted" | "rejected";
  acceptedAt?: string;
  rawStatus?: string;
}

interface Inscription {
  enrollment_status?: string;
  updatedAt?: string;
  acceptedAt?: string;
  approvedAt?: string;
  course?: Course;
  [key: string]: unknown;
}

interface RawCourse {
  enrollment_status?: string;
  [key: string]: unknown;
}

const normalizeEnrollmentStatus = (status?: string | null) => {
  switch (status) {
    case "accepted":
    case "active":
      return "accepted";
    case "rejected":
    case "dropped":
    case "expired":
      return "rejected";
    case "pending":
    default:
      return "pending";
  }
};

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const userRole = getUserRole();
    setRole(userRole);
    fetchCourses(userRole);
  }, []);

  const fetchCourses = async (userRole?: string | null) => {
    try {
      setLoading(true);
      setError("");
      
      // Use passed role or fall back to state
      const effectiveRole = userRole ?? role;
      
      // Fetch courses based on user role
      // Use window.location.origin to ensure we're calling the frontend API route, not the backend directly
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      if (effectiveRole === "student") {
        // Usar el endpoint que solo devuelve inscripciones activas
        const insRes = await fetch(`${baseUrl}/api/inscriptions/courses`, {
          credentials: "include",
        });

        if (insRes.ok) {
          const contentType = insRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const inscriptions = await insRes.json();
            const items = inscriptions || [];
            
            // El backend ya filtra por enrollment_status: 'active'
            // Solo mapeamos los cursos de las inscripciones activas
            const activeCourses = items
              .filter((ins: Inscription) => ins.course)
              .map((ins: Inscription) => ({
                ...(ins.course as Course),
                enrollment_status: "accepted" as const,
                acceptedAt: ins.updatedAt || ins.acceptedAt || ins.approvedAt,
              }));

            setCourses(activeCourses);
            // El nuevo endpoint no devuelve inscripciones pendientes
            setPendingCount(0);
          } else {
            const text = await insRes.text();
            console.error("Non-JSON response from inscriptions:", text.substring(0, 200));
            setError("El servidor devolvió una respuesta inesperada");
          }
        } else {
          const contentType = insRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await insRes.json();
            setError(errorData.error || errorData.message || "Error al cargar las inscripciones");
          } else {
            const text = await insRes.text();
            console.error("Error response (non-JSON) from inscriptions:", text.substring(0, 200));
            setError(`Error ${insRes.status}: ${insRes.statusText}`);
          }
        }
        return;
      }

      const endpoint = "/api/courses/professor";
      const fullUrl = `${baseUrl}${endpoint}`;
      
      console.log("Fetching courses from:", fullUrl);
      
      const res = await fetch(fullUrl, {
        credentials: 'include', // Ensure cookies are sent
      });
      
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          const rawCourses = data || [];
          const normalizedCourses = rawCourses.map((course: RawCourse) => ({
            ...course,
            rawStatus: course.enrollment_status,
            enrollment_status: normalizeEnrollmentStatus(course.enrollment_status),
          }));
          setCourses(normalizedCourses);
        } else {
          const text = await res.text();
          console.error("Non-JSON response:", text.substring(0, 200));
          setError("El servidor devolvió una respuesta inesperada");
        }
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          setError(errorData.error || errorData.message || "Error al cargar los cursos");
        } else {
          const text = await res.text();
          console.error("Error response (non-JSON):", text.substring(0, 200));
          setError(`Error ${res.status}: ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err instanceof Error ? err.message : "Error al cargar los cursos. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseCreated = (newCourse: Course) => {
    setCourses([newCourse, ...courses]);
    setIsCreateDialogOpen(false);
  };

  const userIsTeacher = role === "professor";

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {mounted && role === "professor" ? "Mis Cursos" : "Mis Inscripciones"}
            </h1>
            <p className="text-muted-foreground" suppressHydrationWarning>
              {mounted ? (role === "professor"
                ? "Gestiona los cursos que impartes"
                : "Cursos en los que estás inscrito y aprobado") : "\u00A0"}
            </p>
            {mounted && role === "student" && pendingCount > 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                Tienes {pendingCount} inscripción{pendingCount > 1 ? 'es' : ''} pendiente{pendingCount > 1 ? 's' : ''} de aprobación
              </p>
            )}
          </div>
          {mounted && userIsTeacher && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Curso
            </Button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner text="Cargando cursos..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchCourses} />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={
              userIsTeacher
                ? "No tienes cursos creados aún"
                : "No estás inscrito en ningún curso"
            }
            description={
              userIsTeacher
                ? "Crea tu primer curso y comienza a compartir conocimiento"
                : "Explora el catálogo de cursos e inscríbete en los que te interesen"
            }
            actionLabel={
              userIsTeacher
                ? "Crear tu primer curso"
                : "Explorar Cursos"
            }
            onAction={
              userIsTeacher
                ? () => setIsCreateDialogOpen(true)
                : () => router.push("/courses")
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>

      {/* Create Course Dialog */}
      {mounted && userIsTeacher && (
        <CreateCourseDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCourseCreated={handleCourseCreated}
        />
      )}
    </div>
  );
}
