"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InscriptionCard } from "@/components/inscription-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { EmptyState } from "@/components/empty-state";
import { GraduationCap } from "lucide-react";
import { isAuthenticated, isTeacher, getUserFromToken } from "@/lib/auth";

interface Inscription {
  id: string;
  courseId: string;
  enrollment_status?: "pending" | "accepted" | "rejected";
  message?: string;
  createdAt?: string;
  updatedAt?: string;
  acceptedAt?: string;
  rawStatus?: string;
  course?: {
    id: string;
    title: string;
    description: string;
  };
  student?: {
    id: string;
    name: string;
    email: string;
  };
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

interface RawInscription {
  id?: string | number;
  userId?: string | number;
  courseId?: string | number;
  enrollment_status?: string;
  createdAt?: string;
  updatedAt?: string;
  acceptedAt?: string;
  approvedAt?: string;
  processedAt?: string;
  course?: {
    id?: string | number;
    title?: string;
    description?: string;
  };
  student?: {
    id?: string;
    name?: string;
    email?: string;
  };
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
  [key: string]: unknown;
}

const getAcceptedTimestamp = (inscription: RawInscription) => {
  const normalized = normalizeEnrollmentStatus(inscription?.enrollment_status);
  if (normalized !== "accepted") return undefined;
  return inscription?.updatedAt || inscription?.acceptedAt || inscription?.approvedAt || inscription?.processedAt;
};

export default function InscriptionsPage() {
  const router = useRouter();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [mounted, setMounted] = useState(false);
  const [teacher, setTeacher] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isTeacherRole = isTeacher();
    setTeacher(isTeacherRole);
    
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchInscriptions(isTeacherRole);
  }, [router]);

  const fetchInscriptions = async (isTeacherRole?: boolean) => {
    try {
      setLoading(true);
      setError("");
      
      // Use passed parameter or fall back to state
      const effectiveTeacher = isTeacherRole ?? teacher;
      
      if (effectiveTeacher) {
        // Para profesores: obtener inscripciones de sus cursos
        // Primero obtener los cursos del profesor
        const coursesRes = await fetch("/api/courses/professor");
        if (!coursesRes.ok) {
          const errorData = await coursesRes.json().catch(() => ({}));
          setError(errorData.error || "Error al cargar los cursos");
          return;
        }
        
        const courses = await coursesRes.json();
        if (!courses || courses.length === 0) {
          setInscriptions([]);
          return;
        }
        
        // Obtener IDs de los cursos del profesor
        const professorCourseIds = courses.map((c: { id: string | number }) => String(c.id));
        
        // Obtener TODAS las inscripciones (incluyendo pending) usando /api/inscriptions
        // El endpoint /courses/:id/students solo devuelve inscripciones activas
        const inscriptionsRes = await fetch("/api/inscriptions");
        if (!inscriptionsRes.ok) {
          const errorData = await inscriptionsRes.json().catch(() => ({}));
          setError(errorData.error || "Error al cargar las inscripciones");
          return;
        }
        
        const inscriptionsData = await inscriptionsRes.json();
        const allSystemInscriptions = inscriptionsData.inscriptions || inscriptionsData || [];
        
        // Filtrar solo las inscripciones que pertenecen a los cursos del profesor
        const professorInscriptions = allSystemInscriptions.filter((ins: RawInscription) => {
          const inscriptionCourseId = String(ins.courseId || ins.course?.id);
          return professorCourseIds.includes(inscriptionCourseId);
        });
        
        // Mapear inscripciones al formato esperado
        const allInscriptions: Inscription[] = professorInscriptions.map((ins: RawInscription) => {
          const normalizedStatus = normalizeEnrollmentStatus(ins.enrollment_status);
          const course = courses.find((c: { id: string | number }) => String(c.id) === String(ins.courseId || ins.course?.id));
          
          return {
            id: String(ins.id),
            courseId: String(ins.courseId || ins.course?.id),
            enrollment_status: normalizedStatus,
            rawStatus: ins.enrollment_status,
            createdAt: ins.createdAt as string,
            updatedAt: ins.updatedAt,
            course: course ? {
              id: String(course.id),
              title: course.title,
              description: course.description,
            } : ins.course as Inscription['course'],
            student: ins.student as Inscription['student'] || ins.user as Inscription['student'],
          };
        });
        
        setInscriptions(allInscriptions);
      } else {
        // Para estudiantes: usar /inscriptions que devuelve todas las inscripciones (pending, active, etc.)
        // El endpoint /inscriptions/courses solo devuelve inscripciones 'active'
        const currentUser = getUserFromToken();
        const currentUserId = currentUser?.id;
        
        const res = await fetch("/api/inscriptions");
        if (res.ok) {
          const data = await res.json();
          const items = data.inscriptions || data || [];
          
          // Filtrar solo las inscripciones del usuario actual
          const userItems = currentUserId 
            ? items.filter((ins: RawInscription) => String(ins.userId) === String(currentUserId))
            : items;
          
          const normalized = userItems.map((ins: RawInscription) => {
            const normalizedStatus = normalizeEnrollmentStatus(ins.enrollment_status);
            return {
              ...ins,
              rawStatus: ins.enrollment_status,
              enrollment_status: normalizedStatus,
              acceptedAt: getAcceptedTimestamp(ins),
            } as Inscription;
          });
          setInscriptions(normalized);
        } else {
          const errorData = await res.json().catch(() => ({}));
          setError(errorData.error || "Error al cargar las inscripciones");
        }
      }
    } catch (err) {
      setError("Error al cargar las inscripciones. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas retirar esta solicitud?")) return;

    try {
      const res = await fetch(`/api/inscriptions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setInscriptions(inscriptions.filter((ins) => ins.id !== id));
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Error al eliminar la inscripción");
      }
    } catch (err) {
      alert("Error al eliminar la inscripción. Por favor, intenta de nuevo.");
    }
  };

  const handleUpdate = async (id: string, status: "accepted" | "rejected", message?: string) => {
    try {
      const statusMap: Record<"accepted" | "rejected", string> = {
        accepted: "active",
        rejected: "dropped",
      };

      const backendStatus = statusMap[status];

      const res = await fetch(`/api/inscriptions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollment_status: backendStatus,
          message: message || undefined,
        }),
      });

      if (res.ok) {
        // Refresh the inscriptions list
        await fetchInscriptions();
        if (teacher) {
          setFilterStatus("accepted");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al actualizar la inscripción");
      }
    } catch (err) {
      throw err;
    }
  };

  // Filter inscriptions by status
  const filteredInscriptions = inscriptions.filter((inscription) => {
    if (filterStatus === "all") return true;
    return inscription.enrollment_status === filterStatus;
  });

  // Group inscriptions by status for students
  const groupedInscriptions = {
    accepted: inscriptions.filter(i => i.enrollment_status === "accepted"),
    pending: inscriptions.filter(i => i.enrollment_status === "pending"),
    rejected: inscriptions.filter(i => i.enrollment_status === "rejected")
  };

  const stats = {
    accepted: groupedInscriptions.accepted.length,
    pending: groupedInscriptions.pending.length,
    rejected: groupedInscriptions.rejected.length,
    total: inscriptions.length
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" suppressHydrationWarning>
            {mounted && teacher ? "Solicitudes de Inscripción" : "Mis Inscripciones"}
          </h1>
          <p className="text-muted-foreground" suppressHydrationWarning>
            {mounted ? (teacher
              ? "Gestiona las solicitudes de inscripción a tus cursos"
              : "Estado de tus inscripciones a cursos") : "\u00A0"}
          </p>
        </div>

        {/* Stats Cards for Students */}
        {mounted && !teacher && inscriptions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="p-4 border rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-1">Aceptadas</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.accepted}</p>
            </div>
            <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
            </div>
            <div className="p-4 border rounded-lg bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800">
              <p className="text-sm text-rose-700 dark:text-rose-300 mb-1">Rechazadas</p>
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{stats.rejected}</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filterStatus === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            Todas {inscriptions.length > 0 && `(${inscriptions.length})`}
          </button>
          <button
            onClick={() => setFilterStatus("accepted")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filterStatus === "accepted"
                ? "bg-emerald-600 text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            Aceptadas {stats.accepted > 0 && `(${stats.accepted})`}
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filterStatus === "pending"
                ? "bg-amber-600 text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            Pendientes {stats.pending > 0 && `(${stats.pending})`}
          </button>
          <button
            onClick={() => setFilterStatus("rejected")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filterStatus === "rejected"
                ? "bg-rose-600 text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            Rechazadas {stats.rejected > 0 && `(${stats.rejected})`}
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Cargando inscripciones..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchInscriptions} />
        ) : filteredInscriptions.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={
              filterStatus === "all"
                ? (teacher ? "No hay solicitudes de inscripción" : "No estás inscrito en ningún curso")
                : `No hay inscripciones ${
                    filterStatus === "accepted" ? "aceptadas" :
                    filterStatus === "pending" ? "pendientes" :
                    "rechazadas"
                  }`
            }
            description={
              filterStatus === "all"
                ? (teacher
                    ? "Las solicitudes de inscripción aparecerán aquí"
                    : "Explora el catálogo de cursos e inscríbete en los que te interesen")
                : `Cambia el filtro para ver inscripciones de otros estados`
            }
            actionLabel={!teacher && filterStatus === "all" ? "Explorar Cursos" : undefined}
            onAction={!teacher && filterStatus === "all" ? () => router.push("/courses") : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInscriptions.map((inscription) => (
              <InscriptionCard
                key={inscription.id}
                inscription={inscription}
                isTeacher={teacher}
                onDelete={!teacher ? handleDelete : undefined}
                onUpdate={teacher ? handleUpdate : undefined}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

