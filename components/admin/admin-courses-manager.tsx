"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { Search, BookOpen, Users, FileText, Eye, Plus, Edit, Trash2 } from "lucide-react";
import { CreateCourseDialog } from "@/components/create-course-dialog";
import { DeleteCourseDialog } from "@/components/delete-course-dialog";

interface Course {
  id: number;
  title: string;
  description: string;
  professor_id: number;
  createdAt: string;
  updatedAt: string;
}

interface CourseWithStats extends Course {
  professorName?: string;
  studentsCount?: number;
}

export function AdminCoursesManager() {
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithStats | null>(null);

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
      
      const [coursesRes, usersRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/users"),
      ]);

      if (coursesRes.ok && usersRes.ok) {
        const coursesData = await coursesRes.json();
        const usersData = await usersRes.json();
        
        const coursesArray = Array.isArray(coursesData) ? coursesData : coursesData.courses || [];
        const usersArray = Array.isArray(usersData) ? usersData : usersData.users || [];

        // Enrich courses with professor names
        const enrichedCourses = await Promise.all(
          coursesArray.map(async (course: Course) => {
            const professor = usersArray.find((u: { id: string | number }) => String(u.id) === String(course.professor_id));
            
            // Fetch students count
            let studentsCount = 0;
            try {
              const inscriptionsRes = await fetch(`/api/courses/${course.id}/students`);
              if (inscriptionsRes.ok) {
                const inscriptionsData = await inscriptionsRes.json();
                // Try multiple possible response formats
                studentsCount = inscriptionsData.totalStudents 
                  || (inscriptionsData.students ? inscriptionsData.students.length : 0)
                  || (Array.isArray(inscriptionsData) ? inscriptionsData.length : 0)
                  || 0;
              }
            } catch (err) {
              console.error("Error fetching students count:", err);
            }

            return {
              ...course,
              professorName: professor?.name || "Desconocido",
              studentsCount,
            };
          })
        );

        setCourses(enrichedCourses);
      } else {
        setError("Error al cargar los cursos");
      }
    } catch (err) {
      setError("Error al cargar los cursos. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term) ||
          c.professorName?.toLowerCase().includes(term)
      );
    }

    setFilteredCourses(filtered);
  };

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditCourse = (course: CourseWithStats) => {
    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCourse = (course: CourseWithStats) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const handleCourseCreated = (course: Course) => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedCourse(null);
    fetchCourses();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourse) return;

    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Error al eliminar el curso");
      }

      setIsDeleteDialogOpen(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Cargando cursos..." />;
  }

  if (error && courses.length === 0) {
    return <ErrorMessage message={error} onRetry={fetchCourses} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Cursos</h2>
          <p className="text-muted-foreground">
            Total: {filteredCourses.length} cursos
          </p>
        </div>
        <Button onClick={handleCreateCourse} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear Curso
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, descripción o profesor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No se encontraron cursos
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {course.title}
                    </CardTitle>
                  </div>
                  <BookOpen className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Profesor: <span className="font-medium text-foreground">{course.professorName}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Estudiantes: <span className="font-medium text-foreground">{course.studentsCount || 0}</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.location.href = `/courses/${course.id}`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCourse(course)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCourse(course)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Course Dialog */}
      {(isCreateDialogOpen || isEditDialogOpen) && (
        <CreateCourseDialog
          open={isCreateDialogOpen || isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setSelectedCourse(null);
            }
          }}
          onCourseCreated={handleCourseCreated}
          initialData={selectedCourse || undefined}
        />
      )}

      {/* Delete Course Dialog */}
      {isDeleteDialogOpen && selectedCourse && (
        <DeleteCourseDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          courseTitle={selectedCourse.title}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  );
}


