"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Search,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Eye,
} from "lucide-react";
import { type Assignment, normalizeAssignment } from "@/lib/mock-course-data";
import { getUserFromToken } from "@/lib/auth";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { StudentSubmissionView } from "@/components/student-submission-view";

interface StudentAssignmentsViewerProps {
  courseId: string;
  onSubmitClick: (assignment: Assignment) => void;
  submissionRefreshKey?: number;
}

type FilterType = "all" | "pending" | "submitted" | "graded";

interface SubmissionDocument {
  id: number;
  name: string;
  fileUrl: string;
}

interface Submission {
  id: number;
  userId: number;
  assignmentId: number;
  score: number | null;
  comments: string | null;
  submissionDate: string;
  createdAt: string;
  updatedAt: string;
  documents?: SubmissionDocument[];
}

interface SubmissionResponseItem {
  submission: {
    id: number;
    userId: number;
    assignmentId: number;
    score: number | null;
    comments: string | null;
    submissionDate: string;
    createdAt: string;
    updatedAt: string;
  };
  documents?: Array<{
    id: number;
    name: string;
    signedFileUrl?: string;
    fileUrl?: string;
  }>;
}

export function StudentAssignmentsViewer({
  courseId,
  onSubmitClick,
  submissionRefreshKey,
}: StudentAssignmentsViewerProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Map<string, Submission>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<{ submission: Submission; assignment: Assignment } | null>(null);

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
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al cargar tareas");
      }
    } catch {
      setError("Error al cargar tareas. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const fetchSubmissions = useCallback(async () => {
    try {
      const user = getUserFromToken();
      if (!user || !user.id) {
        return;
      }
      const res = await fetch(`/api/submissions/user/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        // El endpoint retorna formato: [{ submission: {...}, documents: [...] }]
        if (!Array.isArray(data)) {
          setSubmissions(new Map());
          return;
        }

        // Crear Map por assignmentId (usando assignmentId como string)
        const submissionsMap = new Map<string, Submission>();
        data.forEach((item: SubmissionResponseItem) => {
          if (item.submission) {
            const submission: Submission = {
              id: item.submission.id,
              userId: item.submission.userId,
              assignmentId: item.submission.assignmentId,
              score: item.submission.score,
              comments: item.submission.comments,
              submissionDate: item.submission.submissionDate,
              createdAt: item.submission.createdAt,
              updatedAt: item.submission.updatedAt,
              documents: (item.documents || []).map((doc) => ({
                id: doc.id,
                name: doc.name,
                fileUrl: doc.signedFileUrl || doc.fileUrl || "",
              })),
            };
            submissionsMap.set(submission.assignmentId.toString(), submission);
          }
        });
        setSubmissions(submissionsMap);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, [fetchAssignments, fetchSubmissions]);

  // Recargar submissions cuando cambia submissionRefreshKey (después de una entrega exitosa)
  useEffect(() => {
    if (submissionRefreshKey !== undefined && submissionRefreshKey > 0) {
      fetchSubmissions();
    }
  }, [submissionRefreshKey, fetchSubmissions]);

  // Only show published assignments (all from API are considered published)
  const publishedAssignments = assignments;

  const getAssignmentStatus = (assignment: Assignment) => {
    const submission = submissions.get(assignment.id);
    if (submission) {
      // Una submission está calificada si tanto score como comments no son null
      if (submission.score !== null && submission.comments !== null) {
        return "graded";
      }
      return "submitted";
    }
    return "pending";
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 2;
  };

  const filteredAssignments = publishedAssignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase());

    const status = getAssignmentStatus(assignment);
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && status === "pending") ||
      (filter === "submitted" && status === "submitted") ||
      (filter === "graded" && status === "graded");

    return matchesSearch && matchesFilter;
  });

  const getTypeLabel = (type: Assignment["type"]) => {
    const labels = {
      homework: "Tarea",
      quiz: "Quiz",
      project: "Proyecto",
      exam: "Examen",
    };
    return labels[type];
  };

  const getTypeColor = (type: Assignment["type"]) => {
    const colors = {
      homework: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      quiz: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      project: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      exam: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    };
    return colors[type];
  };

  const getStatusBadge = (assignment: Assignment) => {
    const status = getAssignmentStatus(assignment);
    const submission = submissions.get(assignment.id);

    if (status === "graded" && submission) {
      return (
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            Calificado: {submission.score}/{assignment.points}
          </span>
        </div>
      );
    }

    if (status === "submitted") {
      return (
        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Entregado</span>
        </div>
      );
    }

    if (isOverdue(assignment.dueDate)) {
      return (
        <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Atrasada</span>
        </div>
      );
    }

    if (isDueSoon(assignment.dueDate)) {
      return (
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Próxima a vencer</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Pendiente</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const pendingCount = publishedAssignments.filter(
    (a) => getAssignmentStatus(a) === "pending"
  ).length;
  const submittedCount = publishedAssignments.filter(
    (a) => getAssignmentStatus(a) === "submitted"
  ).length;
  const gradedCount = publishedAssignments.filter(
    (a) => getAssignmentStatus(a) === "graded"
  ).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSpinner text="Cargando tareas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorMessage message={error} onRetry={fetchAssignments} />
      </div>
    );
  }

  // Si hay una submission seleccionada, mostrar vista de detalles
  if (selectedSubmission) {
    return (
      <StudentSubmissionView
        submission={selectedSubmission.submission}
        assignment={selectedSubmission.assignment}
        onBack={() => setSelectedSubmission(null)}
        onSubmissionDeleted={() => {
          setSelectedSubmission(null);
          fetchAssignments();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Tareas del Curso
        </h2>
        <p className="text-muted-foreground mt-1">
          {pendingCount} pendientes • {submittedCount} entregadas • {gradedCount} calificadas
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
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
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            Todas
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            size="sm"
          >
            Pendientes
          </Button>
          <Button
            variant={filter === "submitted" ? "default" : "outline"}
            onClick={() => setFilter("submitted")}
            size="sm"
          >
            Entregadas
          </Button>
          <Button
            variant={filter === "graded" ? "default" : "outline"}
            onClick={() => setFilter("graded")}
            size="sm"
          >
            Calificadas
          </Button>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-3">
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay tareas</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "No se encontraron tareas con ese criterio" : "No hay tareas asignadas aún"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map((assignment) => {
            const status = getAssignmentStatus(assignment);
            const submission = submissions.get(assignment.id);

            return (
              <Card key={assignment.id} className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Main Content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(assignment.type)}`}>
                              {getTypeLabel(assignment.type)}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Award className="h-3.5 w-3.5" />
                              {assignment.points} pts
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold mb-1">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {assignment.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Entrega: {formatDate(assignment.dueDate)}</span>
                        </div>
                        {getStatusBadge(assignment)}
                      </div>

                      {/* Graded Info */}
                      {status === "graded" && submission?.comments && (
                        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-1">
                            Retroalimentación del profesor:
                          </p>
                          <p className="text-sm text-emerald-800 dark:text-emerald-200">
                            {submission.comments}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center">
                      {status === "pending" && !isOverdue(assignment.dueDate) && (
                        <Button
                          onClick={() => onSubmitClick(assignment)}
                          className="gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Entregar
                        </Button>
                      )}
                      {status === "submitted" && submission && (
                        <Button
                          variant="outline"
                          onClick={() => setSelectedSubmission({ submission, assignment })}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Ver entrega
                        </Button>
                      )}
                      {status === "graded" && submission && (
                        <Button
                          variant="outline"
                          onClick={() => setSelectedSubmission({ submission, assignment })}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Ver entrega
                        </Button>
                      )}
                      {status === "pending" && isOverdue(assignment.dueDate) && (
                        <Button variant="outline" disabled>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Atrasada
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
