"use client";

import { useEffect, useState } from "react";
import { CourseCard } from "@/components/course-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { EmptyState } from "@/components/empty-state";
import { BookOpen, Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  description: string;
  category?: string;
  level?: string;
  tags?: string[];
  duration_hours?: number;
  max_students?: number;
  modality?: string;
  image_url?: string;
  status?: string;
}

interface InscriptionItem {
  courseId?: string | number;
  enrollment_status?: string;
  updatedAt?: string;
  acceptedAt?: string;
  approvedAt?: string;
  course?: {
    id?: string | number;
  };
  [key: string]: unknown;
}

interface Inscription {
  id: string;
  courseId: string;
  enrollment_status?: "pending" | "accepted" | "rejected";
  updatedAt?: string;
  acceptedAt?: string;
  course?: {
    id: string;
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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedModality, setSelectedModality] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    
    // Redirect professors to dashboard - courses page is only for students
    const userRole = getUserRole();
    if (userRole === "professor") {
      router.push("/dashboard");
      return;
    }
    
    fetchCourses();
    fetchInscriptions();
  }, [router]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al cargar los cursos");
      }
    } catch (err) {
      setError("Error al cargar los cursos. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInscriptions = async () => {
    try {
      // Usar /inscriptions/courses que devuelve SOLO las inscripciones del usuario autenticado
      // El endpoint /inscriptions devuelve TODAS las inscripciones de todos los usuarios
      const res = await fetch("/api/inscriptions/courses");
      if (res.ok) {
        const data = await res.json();
        const items = data.inscriptions || data || [];
        
        console.log("[Catalog] User inscriptions from API:", items);
        
        // Solo procesar inscripciones con estados válidos para mostrar en el catálogo
        const validStatuses = ["pending", "active", "accepted"];
        const filtered = items.filter((ins: InscriptionItem) => {
          const hasValidStatus = ins.enrollment_status && validStatuses.includes(ins.enrollment_status);
          const hasCourseId = ins.courseId || ins.course?.id;
          return hasValidStatus && hasCourseId;
        });
        
        const normalized = filtered.map((ins: InscriptionItem) => {
          const normalizedStatus = normalizeEnrollmentStatus(ins.enrollment_status);
          return {
            ...ins,
            enrollment_status: normalizedStatus,
            acceptedAt: normalizedStatus === "accepted"
              ? ins.updatedAt || ins.acceptedAt || ins.approvedAt
              : undefined,
          } as Inscription;
        });
        setInscriptions(normalized);
      }
    } catch (err) {
      console.error("Error fetching inscriptions:", err);
    }
  };

  const getEnrollmentStatus = (courseId: string): "pending" | "accepted" | "rejected" | null => {
    // Comparar IDs de forma robusta (pueden ser string o number)
    const inscription = inscriptions.find(
      (ins) => String(ins.courseId) === String(courseId) || String(ins.course?.id) === String(courseId)
    );
    return inscription?.enrollment_status || null;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedLevel("");
    setSelectedModality("");
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedLevel || selectedModality;

  const filteredCourses = courses.filter((course) => {
    // Only hide draft courses, show all others (including null/undefined status)
    if (course.status === "draft") return false;

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.category?.toLowerCase().includes(searchLower) ||
        course.tags?.some((tag) => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory && course.category !== selectedCategory) {
      return false;
    }

    // Level filter
    if (selectedLevel && course.level !== selectedLevel) {
      return false;
    }

    // Modality filter
    if (selectedModality && course.modality !== selectedModality) {
      return false;
    }

    return true;
  });

  // Get unique categories from courses
  const uniqueCategories = Array.from(new Set(courses.map((c) => c.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Catálogo de Cursos</h1>
          <p className="text-muted-foreground">
            Explora todos los cursos disponibles e inscríbete en los que te interesen
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar cursos, categorías, etiquetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {[selectedCategory, selectedLevel, selectedModality].filter(Boolean).length}
                </span>
              )}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Categoría</label>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Todas</option>
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Nivel</label>
                  <Select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="primero">1° Medio</option>
                    <option value="segundo">2° Medio</option>
                    <option value="tercero">3° Medio</option>
                    <option value="cuarto_medio">4° Medio</option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Modalidad</label>
                  <Select
                    value={selectedModality}
                    onChange={(e) => setSelectedModality(e.target.value)}
                  >
                    <option value="">Todas</option>
                    <option value="online">Online</option>
                    <option value="presencial">Presencial</option>
                    <option value="hybrid">Híbrido</option>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {loading ? "Cargando..." : `${filteredCourses.length} curso${filteredCourses.length !== 1 ? "s" : ""} encontrado${filteredCourses.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {loading ? (
          <LoadingSpinner text="Cargando cursos..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchCourses} />
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={hasActiveFilters ? "No se encontraron cursos" : "No hay cursos disponibles"}
            description={
              hasActiveFilters
                ? "Intenta ajustar los filtros de búsqueda"
                : "Aún no hay cursos disponibles en el catálogo"
            }
            actionLabel={hasActiveFilters ? "Limpiar filtros" : undefined}
            onAction={hasActiveFilters ? clearFilters : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const enrollmentStatus = getEnrollmentStatus(course.id);
              return (
                <div key={course.id} className="relative">
                  <CourseCard course={course} />
                  {enrollmentStatus && (
                    <div className="absolute top-4 right-4 z-10">
                      {enrollmentStatus === "pending" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 shadow-sm">
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                          Pendiente
                        </span>
                      )}
                      {enrollmentStatus === "accepted" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 shadow-sm">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Inscrito
                        </span>
                      )}
                      {enrollmentStatus === "rejected" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 shadow-sm">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          Rechazado
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
