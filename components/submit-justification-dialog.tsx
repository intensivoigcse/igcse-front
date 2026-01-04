"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Send, AlertCircle, Calendar } from "lucide-react";

interface SubmitJustificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => Promise<void>;
  sessionTitle: string;
  sessionDate: string;
}

export function SubmitJustificationDialog({
  open,
  onOpenChange,
  onSubmit,
  sessionTitle,
  sessionDate,
}: SubmitJustificationDialogProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setError("");
    }
  }, [open]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError("La justificación es requerida");
      return;
    }

    if (reason.trim().length < 10) {
      setError("La justificación debe tener al menos 10 caracteres");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onSubmit(reason.trim());
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar justificación");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Enviar Justificación
            </CardTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Session Info */}
          <div className="mb-6 p-4 rounded-lg bg-muted/50 border">
            <p className="font-semibold">{sessionTitle}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(sessionDate)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-2">
                Motivo de la ausencia/tardanza *
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explica el motivo de tu ausencia o tardanza..."
                className="w-full min-h-[120px] px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                disabled={submitting}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {reason.length}/500 caracteres
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 text-sm">
                {error}
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Nota:</strong> Tu justificación será revisada por el profesor. 
                Si es aprobada, tu asistencia cambiará a &quot;Justificado&quot;.
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                <Send className="h-4 w-4" />
                {submitting ? "Enviando..." : "Enviar Justificación"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

