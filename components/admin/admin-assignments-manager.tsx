"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { FileText, Calendar, Award, CheckCircle, Clock } from "lucide-react";

interface Assignment {
  id: number;
  course_id: number;
  title?: string;
  description?: string;
  due_date?: string;
  points?: number;
  course?: {
    title?: string;
    name?: string;
  };
  submissionsCount?: number;
  gradedCount?: number;
}

export function AdminAssignmentsManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Primero obtener todos los cursos
      const coursesRes = await fetch("/api/courses");
      if (!coursesRes.ok) {
        setError("Error al cargar cursos");
        return;
      }

      const coursesData = await coursesRes.json();
      const courses = Array.isArray(coursesData) ? coursesData : coursesData.courses || [];
      console.log("Courses loaded:", courses.length);

      // Obtener tareas de cada curso
      const allAssignments: Assignment[] = [];
      
      await Promise.all(
        courses.map(async (course: { id: string; title?: string; name?: string }) => {
          try {
            const assignmentsRes = await fetch(`/api/assignments/course/${course.id}`);
            if (assignmentsRes.ok) {
              const assignmentsData = await assignmentsRes.json();
              const courseAssignments = Array.isArray(assignmentsData) 
                ? assignmentsData 
                : assignmentsData.assignments || [];
              
              console.log(`Assignments for course ${course.id}:`, courseAssignments.length);

              // Procesar cada tarea
              for (const assignment of courseAssignments) {
                const courseData = {
                  title: course.title || course.name,
                  name: course.name
                };

                // Cargar estadísticas de entregas
                let submissionsCount = 0;
                let gradedCount = 0;
                try {
                  const submissionsRes = await fetch(`/api/submissions/assignment/${assignment.assignment_id || assignment.id}`);
                  if (submissionsRes.ok) {
                    const submissions = await submissionsRes.json();
                    if (Array.isArray(submissions)) {
                      submissionsCount = submissions.length;
                      gradedCount = submissions.filter((s: { submission?: { score?: number }; score?: number }) => {
                        const score = s.submission?.score ?? s.score;
                        return score != null && score !== undefined;
                      }).length;
                    }
                  }
                } catch (err) {
                  console.error(`Error loading submissions for assignment ${assignment.id}:`, err);
                }

                allAssignments.push({
                  ...assignment,
                  id: assignment.assignment_id || assignment.id,
                  course_id: course.id,
                  course: courseData,
                  submissionsCount,
                  gradedCount,
                });
              }
            }
          } catch (err) {
            console.error(`Error loading assignments for course ${course.id}:`, err);
          }
        })
      );

      console.log("Total assignments loaded:", allAssignments.length);
      setAssignments(allAssignments);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Error al cargar tareas");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <LoadingSpinner text="Cargando tareas..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tareas y Entregas</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Todas las Tareas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Total de tareas: {assignments.length}
          </p>
          
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay tareas creadas todavía
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div 
                  key={assignment.id} 
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {assignment.title || `Tarea #${assignment.id}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {assignment.course?.title || assignment.course?.name || `Curso ID: ${assignment.course_id}`}
                        </p>
                      </div>
                      
                      {assignment.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {assignment.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Vence: {formatDate(assignment.due_date)}</span>
                        </div>
                        
                        {assignment.points !== undefined && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Award className="h-4 w-4" />
                            <span>{assignment.points} pts</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{assignment.submissionsCount || 0} entregas</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">{assignment.gradedCount || 0} calificadas</span>
                      </div>
                      {assignment.submissionsCount && assignment.submissionsCount > assignment.gradedCount! ? (
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            {assignment.submissionsCount - assignment.gradedCount!} pendientes
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


