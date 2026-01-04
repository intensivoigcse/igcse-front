"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { X } from "lucide-react";

interface Submission {
  id: number;
  userId: number;
  assignmentId: number;
  score: number | null;
  comments: string | null;
  submissionDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
}

interface Assignment {
  id: string;
  title: string;
  points: number;
}

interface GradeSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: Submission | null;
  student: Student | null;
  assignment: Assignment | null;
  onGradeSuccess: () => void;
}

export function GradeSubmissionDialog({
  open,
  onOpenChange,
  submission,
  student,
  assignment,
  onGradeSuccess,
}: GradeSubmissionDialogProps) {
  const [score, setScore] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (submission) {
      setScore(submission.score?.toString() || "");
      setComments(submission.comments || "");
    } else {
      setScore("");
      setComments("");
    }
    setError("");
  }, [submission, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!submission || !assignment) return;

    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0) {
      setError("El score debe ser un número válido mayor o igual a 0");
      return;
    }

    if (scoreNum > assignment.points) {
      setError(`El score no puede ser mayor a ${assignment.points} puntos`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/submissions/${submission.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: scoreNum,
          comments: comments.trim() || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al calificar la entrega");
        setLoading(false);
        return;
      }

      onGradeSuccess();
      onOpenChange(false);
    } catch (err) {
      setError("Error al calificar la entrega. Por favor, intenta de nuevo.");
      setLoading(false);
    }
  };

  if (!open || !submission || !student || !assignment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Calificar Entrega</CardTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Info */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">Estudiante:</p>
              <p className="text-lg font-semibold">{student.name}</p>
              <p className="text-sm text-muted-foreground">{student.email}</p>
            </div>

            {/* Assignment Info */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">Tarea:</p>
              <p className="text-lg font-semibold">{assignment.title}</p>
              <p className="text-sm text-muted-foreground">
                Puntos máximos: {assignment.points} pts
              </p>
            </div>

            {/* Score */}
            <Field>
              <FieldLabel htmlFor="score">Calificación *</FieldLabel>
              <Input
                id="score"
                type="number"
                min="0"
                max={assignment.points}
                step="0.1"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder={`0 - ${assignment.points}`}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Máximo: {assignment.points} puntos
              </p>
            </Field>

            {/* Comments */}
            <Field>
              <FieldLabel htmlFor="comments">Comentarios de Retroalimentación</FieldLabel>
              <textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Escribe tus comentarios sobre la entrega del estudiante..."
                className="w-full min-h-[120px] px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={loading}
              />
            </Field>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Calificación"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

