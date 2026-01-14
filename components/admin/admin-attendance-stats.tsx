"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { ClipboardCheck, Search, ChevronDown, ChevronUp, Users, TrendingUp } from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface StudentStat {
  userId: number;
  name: string;
  email: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

interface CourseStats {
  totalSessions: number;
  averageAttendance: number;
  studentStats: StudentStat[];
}

interface CourseWithStats extends Course {
  stats?: CourseStats;
  loading?: boolean;
  error?: string;
  expanded?: boolean;
}

export function AdminAttendanceStats() {
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data = await res.json();
        const coursesArray = Array.isArray(data) ? data : data.courses || [];
        
        setCourses(
          coursesArray.map((course: Course) => ({
            ...course,
            loading: false,
            expanded: false,
          }))
        );
      } else {
        setError("Error al cargar los cursos");
      }
    } catch (err) {
      setError("Error al cargar los cursos. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStats = async (courseId: string) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId ? { ...course, loading: true, error: undefined } : course
      )
    );

    try {
      const res = await fetch(`/api/attendance/course/${courseId}/stats`);
      if (res.ok) {
        const stats: CourseStats = await res.json();
        setCourses((prev) =>
          prev.map((course) =>
            course.id === courseId
              ? { ...course, stats, loading: false, error: undefined }
              : course
          )
        );
      } else {
        const errorData = await res.json().catch(() => ({}));
        setCourses((prev) =>
          prev.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  loading: false,
                  error: errorData.error || errorData.message || "Error al cargar estadísticas",
                }
              : course
          )
        );
      }
    } catch (err) {
      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId
            ? {
                ...course,
                loading: false,
                error: "Error al cargar estadísticas",
              }
            : course
        )
      );
    }
  };

  const toggleCourseExpanded = (courseId: string) => {
    setCourses((prev) => {
      const course = prev.find((c) => c.id === courseId);
      if (!course) return prev;

      const newExpanded = !course.expanded;
      
      // Si se está expandiendo y no hay stats cargados, cargarlos
      if (newExpanded && !course.stats && !course.loading) {
        fetchCourseStats(courseId);
      }

      return prev.map((c) =>
        c.id === courseId ? { ...c, expanded: newExpanded } : c
      );
    });
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((c) =>
        c.title.toLowerCase().includes(term)
      );
    }

    setFilteredCourses(filtered);
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30";
    if (rate >= 60) return "text-amber-600 bg-amber-100 dark:bg-amber-900/30";
    return "text-red-600 bg-red-100 dark:bg-red-900/30";
  };

  if (loading) {
    return <LoadingSpinner text="Cargando estadísticas..." />;
  }

  if (error && courses.length === 0) {
    return <ErrorMessage message={error} onRetry={fetchCourses} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Estadísticas de Asistencia</h2>
          <p className="text-muted-foreground">
            Total: {filteredCourses.length} cursos
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título del curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Courses Stats */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No se encontraron cursos
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleCourseExpanded(course.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-4">
                    {course.stats && (
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Promedio:{" "}
                          <span className="font-semibold text-foreground">
                            {course.stats.averageAttendance}%
                          </span>
                        </span>
                      </div>
                    )}
                    {course.expanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {course.expanded && (
                <CardContent className="pt-0">
                  {course.loading ? (
                    <div className="py-8 text-center">
                      <LoadingSpinner text="Cargando estadísticas..." />
                    </div>
                  ) : course.error ? (
                    <div className="py-4 text-center text-sm text-destructive">
                      {course.error}
                    </div>
                  ) : course.stats ? (
                    <div className="space-y-6">
                      {/* General Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Total Sesiones</p>
                          <p className="text-2xl font-bold mt-1">
                            {course.stats.totalSessions}
                          </p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            Asistencia Promedio
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            {course.stats.averageAttendance}%
                          </p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Estudiantes</p>
                          <p className="text-2xl font-bold mt-1">
                            {course.stats.studentStats.length}
                          </p>
                        </div>
                      </div>

                      {/* Students Table */}
                      {course.stats.studentStats.length > 0 ? (
                        <div className="space-y-2">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Estadísticas por Estudiante
                          </h3>
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-muted">
                                <tr>
                                  <th className="text-left p-3 text-sm font-medium">
                                    Estudiante
                                  </th>
                                  <th className="text-center p-3 text-sm font-medium">
                                    Presente
                                  </th>
                                  <th className="text-center p-3 text-sm font-medium">
                                    Ausente
                                  </th>
                                  <th className="text-center p-3 text-sm font-medium">
                                    Tarde
                                  </th>
                                  <th className="text-center p-3 text-sm font-medium">
                                    Justificado
                                  </th>
                                  <th className="text-center p-3 text-sm font-medium">
                                    Tasa
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {course.stats.studentStats.map((student) => (
                                  <tr
                                    key={student.userId}
                                    className="border-t hover:bg-muted/50"
                                  >
                                    <td className="p-3">
                                      <div>
                                        <p className="font-medium text-sm">
                                          {student.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {student.email}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="text-center p-3 text-sm text-emerald-600 font-medium">
                                      {student.present}
                                    </td>
                                    <td className="text-center p-3 text-sm text-red-600 font-medium">
                                      {student.absent}
                                    </td>
                                    <td className="text-center p-3 text-sm text-amber-600 font-medium">
                                      {student.late}
                                    </td>
                                    <td className="text-center p-3 text-sm text-blue-600 font-medium">
                                      {student.excused}
                                    </td>
                                    <td className="text-center p-3">
                                      <div className="flex items-center justify-center gap-2">
                                        <span
                                          className={`px-2 py-1 rounded text-xs font-semibold ${getAttendanceColor(
                                            student.attendanceRate
                                          )}`}
                                        >
                                          {student.attendanceRate}%
                                        </span>
                                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                          <div
                                            className={`h-full ${
                                              student.attendanceRate >= 80
                                                ? "bg-emerald-500"
                                                : student.attendanceRate >= 60
                                                ? "bg-amber-500"
                                                : "bg-red-500"
                                            }`}
                                            style={{ width: `${student.attendanceRate}%` }}
                                          />
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          No hay estudiantes inscritos en este curso
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No hay estadísticas disponibles
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
