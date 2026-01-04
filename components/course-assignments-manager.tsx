"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Search, 
  Plus, 
  Calendar,
  Edit,
  Trash2,
  Award
} from "lucide-react";
import { type Assignment, normalizeAssignment, assignmentToBackendFormat } from "@/lib/mock-course-data";
import { AssignmentDialog } from "./assignment-dialog";
import { AssignmentSubmissionsView } from "./assignment-submissions-view";
import { GradeSubmissionDialog } from "./grade-submission-dialog";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";

interface Submission {
  id: number;
  userId: number;
  assignmentId: number;
  score: number | null;
  comments: string | null;
  submissionDate: string;
  createdAt: string;
  updatedAt: string;
  documents?: Array<{
    id: number;
    name: string;
    fileUrl: string;
  }>;
  student?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Student {
  id: number;
  name: string;
  email: string;
}

interface AssignmentsManagerProps {
  courseId: string;
}

export function CourseAssignmentsManager({ courseId }: AssignmentsManagerProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | Assignment["type"]>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | Assignment["status"]>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | undefined>();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [submissionsRefreshKey, setSubmissionsRefreshKey] = useState(0);
  const [submissionsCount, setSubmissionsCount] = useState<Map<string, number>>(new Map());
  const [totalStudents, setTotalStudents] = useState<number>(0);

  const fetchTotalStudents = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/students`);
      if (res.ok) {
        const data = await res.json();
        const studentsArray = data.students || [];
        setTotalStudents(studentsArray.length);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  }, [courseId]);

  const fetchSubmissionsCount = useCallback(async (assignmentIds: string[]) => {
    try {
      const countsMap = new Map<string, number>();
      
      // Fetch submissions count for each assignment in parallel
      const promises = assignmentIds.map(async (assignmentId) => {
        try {
          const res = await fetch(`/api/submissions/assignment/${assignmentId}`);
          if (res.ok) {
            const data = await res.json();
            const submissionsArray = Array.isArray(data) ? data : [];
            countsMap.set(assignmentId, submissionsArray.length);
          } else {
            countsMap.set(assignmentId, 0);
          }
        } catch {
          countsMap.set(assignmentId, 0);
        }
      });
      
      await Promise.all(promises);
      setSubmissionsCount(countsMap);
    } catch (err) {
      console.error("Error fetching submissions count:", err);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/assignments/course/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        const assignmentsArray = Array.isArray(data) ? data : (data.assignments || []);
        const normalizedAssignments = assignmentsArray.map(normalizeAssignment);
        setAssignments(normalizedAssignments);
        
        // Fetch submissions count for all assignments
        const assignmentIds = normalizedAssignments
          .filter((a: Assignment) => a.status === "published")
          .map((a: Assignment) => a.id);
        if (assignmentIds.length > 0) {
          await fetchSubmissionsCount(assignmentIds);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al cargar tareas");
      }
    } catch {
      setError("Error al cargar tareas. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [courseId, fetchSubmissionsCount]);

  useEffect(() => {
    fetchAssignments();
    fetchTotalStudents();
  }, [fetchAssignments, fetchTotalStudents]);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || assignment.type === filterType;
    const matchesStatus = filterStatus === "all" || assignment.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateAssignment = () => {
    setEditingAssignment(undefined);
    setDialogOpen(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setDialogOpen(true);
  };

  const handleSaveAssignment = async (assignmentData: Partial<Assignment>) => {
    try {
      const backendData = assignmentToBackendFormat(assignmentData, courseId);
      
      let url = "/api/assignments";
      let method = "POST";
      
      if (editingAssignment) {
        // Update existing
        url = `/api/assignments/${editingAssignment.id}`;
        method = "PATCH";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      });

      if (res.ok) {
        // Recargar la lista de assignments (esto también recargará los contadores)
        await fetchAssignments();
        setDialogOpen(false);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || `Error al ${editingAssignment ? "actualizar" : "crear"} la tarea`);
      }
    } catch {
      alert(`Error al ${editingAssignment ? "actualizar" : "crear"} la tarea. Por favor, intenta de nuevo.`);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
      return;
    }

    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Recargar la lista de assignments
        await fetchAssignments();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Error al eliminar tarea");
      }
    } catch {
      alert("Error al eliminar tarea. Por favor, intenta de nuevo.");
    }
  };

  const handleAssignmentClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleGradeSubmission = (submission: Submission, student: Student) => {
    setSelectedSubmission(submission);
    setSelectedStudent(student);
    setGradeDialogOpen(true);
  };

  const handleGradeSuccess = () => {
    setGradeDialogOpen(false);
    setSelectedSubmission(null);
    setSelectedStudent(null);
    // Forzar recarga de submissions
    setSubmissionsRefreshKey((prev) => prev + 1);
    // Recargar contadores de submissions
    if (selectedAssignment) {
      fetchSubmissionsCount([selectedAssignment.id]);
    }
  };

  const getTypeLabel = (type: Assignment["type"]) => {
    const labels = {
      homework: "Tarea",
      quiz: "Quiz",
      project: "Proyecto",
      exam: "Examen"
    };
    return labels[type];
  };

  const getTypeColor = (type: Assignment["type"]) => {
    const colors = {
      homework: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      quiz: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      project: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      exam: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
    };
    return colors[type];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <LoadingSpinner text="Cargando tareas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <ErrorMessage message={error} onRetry={fetchAssignments} />
      </div>
    );
  }

  // Si hay una tarea seleccionada, mostrar vista de submissions
  if (selectedAssignment) {
    return (
      <>
        <AssignmentSubmissionsView
          key={`${selectedAssignment.id}-${submissionsRefreshKey}`}
          assignment={selectedAssignment}
          courseId={courseId}
          onBack={() => setSelectedAssignment(null)}
          onGradeSubmission={handleGradeSubmission}
        />
        {selectedSubmission && selectedStudent && (
          <GradeSubmissionDialog
            open={gradeDialogOpen}
            onOpenChange={setGradeDialogOpen}
            submission={selectedSubmission}
            student={selectedStudent}
            assignment={selectedAssignment}
            onGradeSuccess={handleGradeSuccess}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Tareas y Evaluaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredAssignments.length} de {assignments.length} tareas
          </p>
        </div>
        <Button onClick={handleCreateAssignment} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="flex-1 h-9 px-3 rounded-md border border-input bg-transparent text-sm"
          >
            <option value="all">Todos los tipos</option>
            <option value="homework">Tareas</option>
            <option value="quiz">Quizzes</option>
            <option value="project">Proyectos</option>
            <option value="exam">Exámenes</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="flex-1 h-9 px-3 rounded-md border border-input bg-transparent text-sm"
          >
            <option value="all">Todos</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
          </select>
        </div>
      </div>

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "No se encontraron tareas"
                : "No hay tareas creadas"}
            </p>
            {!searchTerm && filterType === "all" && filterStatus === "all" && (
              <Button onClick={handleCreateAssignment} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Crear Primera Tarea
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAssignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleAssignmentClick(assignment)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getTypeColor(assignment.type)}`}>
                        {getTypeLabel(assignment.type)}
                      </span>
                      {assignment.status === "draft" && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                          Borrador
                        </span>
                      )}
                      {assignment.status === "published" && isDueSoon(assignment.dueDate) && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Vence pronto
                        </span>
                      )}
                      {isOverdue(assignment.dueDate) && assignment.status === "published" && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                          Vencido
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {assignment.title}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAssignment(assignment);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => handleDeleteAssignment(assignment.id, e)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {assignment.description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha de entrega</p>
                      <p className="font-medium">{formatDate(assignment.dueDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Puntos</p>
                      <p className="font-medium">{assignment.points} pts</p>
                    </div>
                  </div>
                </div>

                {assignment.status === "published" && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Entregas</span>
                      <span className="font-semibold">
                        {submissionsCount.get(assignment.id) || 0}/{totalStudents}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${totalStudents > 0 ? ((submissionsCount.get(assignment.id) || 0) / totalStudents) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assignment Dialog */}
      <AssignmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveAssignment}
        initialData={editingAssignment}
      />

    </div>
  );
}

