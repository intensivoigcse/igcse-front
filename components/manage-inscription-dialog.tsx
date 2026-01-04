"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { X, Check, XCircle } from "lucide-react";

interface ManageInscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inscription: {
    id: string;
    student?: {
      name: string;
      email: string;
    };
    course?: {
      title: string;
    };
  };
  onUpdate: (id: string, status: "accepted" | "rejected", message?: string) => Promise<void>;
}

export function ManageInscriptionDialog({
  open,
  onOpenChange,
  inscription,
  onUpdate,
}: ManageInscriptionDialogProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async (status: "accepted" | "rejected") => {
    setLoading(true);
    setError("");

    try {
      await onUpdate(inscription.id, status, message);
      setMessage("");
      onOpenChange(false);
    } catch (err) {
      setError("Error al procesar la solicitud. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Gestionar Inscripción</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Student Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Estudiante</p>
                  <p className="font-semibold">{inscription.student?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm">{inscription.student?.email}</p>
                </div>
                {inscription.course && (
                  <div>
                    <p className="text-sm text-muted-foreground">Curso</p>
                    <p className="text-sm">{inscription.course.title}</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Message Field */}
            <Field>
              <FieldLabel htmlFor="message">
                Mensaje para el estudiante (opcional)
              </FieldLabel>
              <textarea
                id="message"
                placeholder="Agrega un mensaje sobre tu decisión..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              />
            </Field>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleAction("rejected")}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                {loading ? "Procesando..." : "Rechazar"}
              </Button>
              <Button
                type="button"
                onClick={() => handleAction("accepted")}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                {loading ? "Procesando..." : "Aceptar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

