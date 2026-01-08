"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  ArrowLeft,
  Download,
  File,
  Eye,
  Maximize,
  Minimize,
  X,
  Trash2,
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
}

interface StudentSubmissionViewProps {
  submission: Submission;
  assignment: Assignment;
  onBack: () => void;
  onSubmissionDeleted?: () => void;
}

export function StudentSubmissionView({
  submission,
  assignment,
  onBack,
  onSubmissionDeleted,
}: StudentSubmissionViewProps) {
  const [previewDocument, setPreviewDocument] = useState<SubmissionDocument | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isGraded = submission.score !== null && submission.comments !== null;

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
    const modalElement = document.getElementById('pdf-preview-modal-submission');
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

  const handleDeleteSubmission = async () => {
    if (isGraded) {
      alert("No puedes anular una entrega que ya ha sido calificada.");
      return;
    }

    if (!confirm("¿Estás seguro de que deseas anular esta entrega? Esta acción no se puede deshacer y podrás volver a entregar la tarea.")) {
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Entrega anulada exitosamente. Puedes volver a entregar la tarea.");
        if (onSubmissionDeleted) {
          onSubmissionDeleted();
        }
        onBack();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Error al anular la entrega");
      }
    } catch (err) {
      alert("Error al anular la entrega. Por favor, intenta de nuevo.");
    } finally {
      setIsDeleting(false);
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
              Mi Entrega: {assignment.title}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isGraded ? "Calificada" : "En revisión"}
            </p>
          </div>
        </div>
        {!isGraded && (
          <Button
            variant="destructive"
            onClick={handleDeleteSubmission}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Anulando..." : "Anular Entrega"}
          </Button>
        )}
      </div>

      {/* Submission Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Información de la Entrega</CardTitle>
            {isGraded ? (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Calificada</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Pendiente de calificar</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date and Score Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Fecha de entrega</p>
                <p className="font-medium">
                  {formatDate(submission.submissionDate || submission.createdAt)}
                </p>
              </div>
            </div>
            {isGraded && submission.score !== null && (
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Calificación</p>
                  <p className="font-medium text-lg">
                    {submission.score}/{assignment.points} pts
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Graded Feedback */}
          {isGraded && submission.comments && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-2">
                Retroalimentación del profesor:
              </p>
              <p className="text-sm text-emerald-800 dark:text-emerald-200">
                {submission.comments}
              </p>
            </div>
          )}

          {/* Documents */}
          {submission.documents && submission.documents.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground">
                Archivos entregados:
              </p>
              <div className="space-y-2">
                {submission.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
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

          {/* No documents message */}
          {(!submission.documents || submission.documents.length === 0) && (
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                No hay archivos asociados a esta entrega
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Tarea</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">Descripción:</p>
            <p className="text-sm text-muted-foreground">
              {assignment.description || "Sin descripción"}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Fecha límite:</span>
              <span className="font-medium">
                {formatDate(assignment.dueDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Puntos:</span>
              <span className="font-medium">{assignment.points} pts</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {isPreviewOpen && previewDocument && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            id="pdf-preview-modal-submission"
            className="w-full h-full max-w-7xl max-h-[90vh] bg-background rounded-lg shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">{previewDocument.name}</h3>
                  <p className="text-xs text-muted-foreground">Vista previa de tu entrega</p>
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

