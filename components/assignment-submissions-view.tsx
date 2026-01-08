"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import {
  FileText,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  Award,
  ArrowLeft,
  Edit,
  Download,
  File,
  Eye,
  Maximize,
  Minimize,
  X,
} from "lucide-react";
import type { Assignment } from "@/lib/mock-course-data";

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
  student?: Student;
  assignment?: {
    assignment_id: number;
    course_id: number;
    title: string;
    description?: string;
    maxScore?: number;
    due_date: string;
  };
}

interface Student {
  id: number;
  name: string;
  email: string;
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

interface AssignmentSubmissionsViewProps {
  assignment: Assignment;
  courseId: string;
  onBack: () => void;
  onGradeSubmission: (submission: Submission, student: Student) => void;
}

export function AssignmentSubmissionsView({
  assignment,
  courseId,
  onBack,
  onGradeSubmission,
}: AssignmentSubmissionsViewProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<Map<number, Student>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewDocument, setPreviewDocument] = useState<SubmissionDocument | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/students`);
      if (res.ok) {
        const data = await res.json();
        const studentsArray = data.students || [];
        const studentsMap = new Map<number, Student>();
        studentsArray.forEach((student: { id: string | number; name: string; email: string }) => {
          const studentId = typeof student.id === "string" ? parseInt(student.id) : student.id;
          studentsMap.set(studentId, {
            id: studentId,
            name: student.name,
            email: student.email,
          });
        });
        setStudents(studentsMap);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  }, [courseId]);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // assignment.id es string, pero el backend espera number
      const assignmentId = typeof assignment.id === "string" ? parseInt(assignment.id) : assignment.id;
      
      // Obtener todas las submissions de la assignment en una sola llamada
      const res = await fetch(`/api/submissions/assignment/${assignmentId}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          // No hay submissions para esta assignment, es normal
          setSubmissions([]);
          return;
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Error al cargar entregas");
      }

      const data = await res.json();
      
      // El endpoint retorna un array: [{ submission: {...}, documents: [...] }]
      if (!Array.isArray(data)) {
        setSubmissions([]);
        return;
      }

      // Normalizar las submissions y mapear la información del estudiante
      const normalizedSubmissions: Submission[] = data
        .map((item: SubmissionResponseItem) => {
          if (!item.submission) {
            return null;
          }

          const submission = item.submission;
          const userId = submission.userId;
          
          // Obtener información del estudiante del Map
          const student = students.get(userId);
          
          // Si no encontramos el estudiante, aún así incluimos la submission
          // pero sin información del estudiante (se filtrará en filteredSubmissions)
          const normalizedSubmission: Submission = {
            id: submission.id,
            userId: submission.userId,
            assignmentId: submission.assignmentId,
            score: submission.score,
            comments: submission.comments,
            submissionDate: submission.submissionDate,
            createdAt: submission.createdAt,
            updatedAt: submission.updatedAt,
            student: student ? {
              id: student.id,
              name: student.name,
              email: student.email,
            } : undefined,
            documents: (item.documents || []).map((doc) => ({
              id: doc.id,
              name: doc.name,
              fileUrl: doc.signedFileUrl || doc.fileUrl || "",
            })),
          };
          
          return normalizedSubmission;
        })
        .filter((s): s is Submission => s !== null);
      
      setSubmissions(normalizedSubmissions);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError(err instanceof Error ? err.message : "Error al cargar entregas. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [assignment.id, students]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (students.size > 0 && assignment.id) {
      fetchSubmissions();
    }
  }, [assignment.id, students.size, fetchSubmissions]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredSubmissions = submissions.filter((submission) => {
    // Usar student de la submission (siempre debería estar disponible ahora)
    const student = submission.student;
    
    // Si no hay estudiante, no mostrar la submission
    if (!student) {
      return false;
    }
    
    // Si hay término de búsqueda, filtrar por nombre o email
    if (searchTerm) {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }
    
    return true;
  });

  const handlePreview = (doc: SubmissionDocument) => {
    setPreviewDocument(doc);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    if (isFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsPreviewOpen(false);
    setPreviewDocument(null);
    setIsFullscreen(false);
  };

  const toggleFullscreen = async () => {
    const modalElement = document.getElementById('pdf-preview-modal-professor');
    if (!modalElement) return;

    try {
      if (!document.fullscreenElement) {
        await modalElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const getStatusBadge = (submission: Submission) => {
    // Verificar que score sea un número válido (no null ni undefined)
    if (submission.score != null && submission.score !== undefined) {
      return (
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Calificado</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Pendiente de calificar</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <LoadingSpinner text="Cargando entregas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <ErrorMessage message={error} onRetry={fetchSubmissions} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Entregas de: {assignment.title}
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredSubmissions.length} de {submissions.length} entregas
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nombre o email del estudiante..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay entregas</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "No se encontraron entregas con ese criterio"
                : "Aún no hay estudiantes que hayan entregado esta tarea"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSubmissions.map((submission, index) => {
            // Usar student de la submission (siempre debería estar disponible)
            const student = submission.student;
            if (!student) return null;
            
            const displayName = student.name;
            const displayEmail = student.email;

            return (
              <Card key={`submission-${submission.id}-${index}`} className="hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-primary">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg leading-tight">{displayName}</CardTitle>
                        <p className="text-sm text-muted-foreground truncate">{displayEmail}</p>
                      </div>
                    </div>
                    {getStatusBadge(submission)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha de entrega</p>
                        <p className="font-medium">{formatDate(submission.submissionDate || submission.createdAt)}</p>
                      </div>
                    </div>
                    {submission.score != null && submission.score !== undefined && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Calificación</p>
                          <p className="font-medium">
                            {submission.score}/{assignment.points} pts
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {submission.comments && (submission.score == null || submission.score === undefined) && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Comentarios del estudiante:</p>
                      <p className="text-sm">{submission.comments}</p>
                    </div>
                  )}

                  {submission.score != null && submission.score !== undefined && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <p className="text-xs font-medium text-emerald-900 dark:text-emerald-100 mb-1">
                        Retroalimentación del profesor:
                      </p>
                      <p className="text-sm text-emerald-800 dark:text-emerald-200">
                        {submission.comments || "Sin comentarios"}
                      </p>
                    </div>
                  )}

                  {/* Archivos de la entrega */}
                  {submission.documents && submission.documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Archivos entregados:</p>
                      <div className="space-y-1">
                        {submission.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                          >
                            <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm flex-1 truncate">{doc.name}</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handlePreview(doc)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Vista previa"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => window.open(doc.fileUrl, "_blank")}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Descargar archivo"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => onGradeSubmission(submission, student)}
                    >
                      <Edit className="h-4 w-4" />
                      {submission.score != null && submission.score !== undefined ? "Editar Calificación" : "Calificar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && previewDocument && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            id="pdf-preview-modal-professor"
            className="w-full h-full max-w-7xl max-h-[90vh] bg-background rounded-lg shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">{previewDocument.name}</h3>
                  <p className="text-xs text-muted-foreground">Vista previa de la entrega</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="gap-2"
                  title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closePreview}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cerrar
                </Button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden relative bg-muted/50">
              <iframe
                src={`${previewDocument.fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                className="w-full h-full border-0"
                title={previewDocument.name}
                style={{
                  pointerEvents: 'auto',
                }}
                onContextMenu={(e) => e.preventDefault()}
              />
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ userSelect: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

