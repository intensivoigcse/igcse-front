"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface BackendDonationResponse {
  id?: string | number;
  amount?: number | string;
  description?: string;
  status?: string;
  init_point?: string;
  sandbox_init_point?: string;
  mercadoPagoPreferenceId?: string;
  mercadoPagoPaymentId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface CreateDonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDonationCreated: (donation: BackendDonationResponse) => void;
}

export function CreateDonationDialog({
  open,
  onOpenChange,
  onDonationCreated,
}: CreateDonationDialogProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(parseFloat(amount)),
          description: description || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear la donación");
        return;
      }

      const payload: BackendDonationResponse = data.donation || data;

      const paymentUrl = payload.init_point || payload.sandbox_init_point;
      if (paymentUrl && typeof window !== "undefined") {
        window.open(paymentUrl, "_blank", "noopener,noreferrer");
      }

      onDonationCreated(payload);
      setAmount("");
      setDescription("");
      onOpenChange(false);
    } catch (err) {
      setError("Error al crear la donación. Por favor, intenta de nuevo.");
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
            <h2 className="text-2xl font-bold">Crear Donación</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="amount">Monto (CLP)</FieldLabel>
              <Input
                id="amount"
                type="number"
                step="100"
                min="100"
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <FieldDescription>
                Ingresa el monto en pesos chilenos que deseas donar
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Descripción (Opcional)</FieldLabel>
              <textarea
                id="description"
                placeholder="Motivo de la donación..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </Field>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Donación"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

