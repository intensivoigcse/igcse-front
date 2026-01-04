"use client";

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
}

export function StudentSubmissionView({
  submission,
  assignment,
  onBack,
}: StudentSubmissionViewProps) {
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
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      title="Descargar archivo"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
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
    </div>
  );
}

