"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { X, FileText, Calendar, Award, Sliders } from "lucide-react";
import { type Assignment } from "@/lib/mock-course-data";

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (assignment: Partial<Assignment>) => void;
  initialData?: Assignment;
}

export function AssignmentDialog({
  open,
  onOpenChange,
  onSave,
  initialData
}: AssignmentDialogProps) {
  const [formData, setFormData] = useState<Partial<Assignment>>({
    title: "",
    description: "",
    type: "homework",
    dueDate: "",
    points: 10,
    status: "draft"
  });
  const [pointsInput, setPointsInput] = useState<string>("10");

  useEffect(() => {
    if (initialData) {
      // Convertir dueDate a formato YYYY-MM-DD para el input type="date"
      const dueDateFormatted = initialData.dueDate 
        ? new Date(initialData.dueDate).toISOString().split('T')[0]
        : "";
      
      setFormData({
        ...initialData,
        dueDate: dueDateFormatted
      });
      setPointsInput(initialData.points?.toString() || "10");
    } else {
      setFormData({
        title: "",
        description: "",
        type: "homework",
        dueDate: "",
        points: 10,
        status: "draft"
      });
      setPointsInput("10");
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  if (!open) return null;
  const today = new Date().toISOString().split("T")[0];

  const handlePointsChange = (value: number) => {
    if (value >= 1) {
      setFormData({ ...formData, points: value });
      setPointsInput(value.toString());
    }
  };

  const handlePointsInputChange = (value: string) => {
    setPointsInput(value);
    // Solo actualizar formData si es un número válido >= 1
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1) {
      setFormData({ ...formData, points: numValue });
    }
  };

  const handlePointsBlur = () => {
    // Al perder el foco, asegurar que el valor sea válido
    const numValue = parseInt(pointsInput);
    if (isNaN(numValue) || numValue < 1) {
      const validValue = 10;
      setPointsInput(validValue.toString());
      setFormData({ ...formData, points: validValue });
    } else {
      setPointsInput(numValue.toString());
      setFormData({ ...formData, points: numValue });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {initialData ? "Editar Tarea" : "Nueva Tarea"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Crea una nueva evaluación para tus estudiantes
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Field>
              <FieldLabel htmlFor="title">
                Título <span className="text-rose-500">*</span>
              </FieldLabel>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Ecuaciones Lineales - Ejercicios Básicos"
                required
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.title?.length || 0}/200 caracteres
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">
                Descripción <span className="text-rose-500">*</span>
              </FieldLabel>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe las instrucciones y objetivos de la tarea..."
                className="w-full min-h-[120px] px-3 py-2 text-sm border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                required
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description?.length || 0}/2000 caracteres
              </p>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="type">
                  Tipo <span className="text-rose-500">*</span>
                </FieldLabel>
                <Select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Assignment["type"] })}
                  required
                >
                  <option value="homework">Tarea</option>
                  <option value="quiz">Quiz</option>
                  <option value="project">Proyecto</option>
                  <option value="exam">Examen</option>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="status">
                  Estado <span className="text-rose-500">*</span>
                </FieldLabel>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Assignment["status"] })}
                  required
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                </Select>
              </Field>
            </div>

            {/* Date Picker */}
            <Field>
              <FieldLabel htmlFor="dueDate">
                Fecha de Entrega <span className="text-rose-500">*</span>
              </FieldLabel>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <DatePicker
                  id="dueDate"
                  min={today}
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
              {formData.dueDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(formData.dueDate).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              )}
            </Field>

            {/* Points with Slider */}
            <Field>
              <FieldLabel htmlFor="points">
                Puntos Máximos <span className="text-rose-500">*</span>
              </FieldLabel>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="range"
                      min="1"
                      max="200"
                      value={Math.min(formData.points || 10, 200)}
                      onChange={(e) => handlePointsChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      disabled={formData.points ? formData.points > 200 : false}
                    />
                  </div>
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="points"
                      type="text"
                      inputMode="numeric"
                      value={pointsInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Permitir solo números
                        if (value === "" || /^\d+$/.test(value)) {
                          handlePointsInputChange(value);
                        }
                      }}
                      onBlur={handlePointsBlur}
                      className="w-28 text-center font-semibold"
                      required
                      placeholder="10"
                    />
                    <span className="text-sm text-muted-foreground">pts</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Mínimo: 1</span>
                  <span className="flex items-center gap-1">
                    <Sliders className="h-3 w-3" />
                    {formData.points && formData.points > 200 
                      ? "Usa el campo numérico para valores mayores"
                      : "Slider: 1-200"}
                  </span>
                  <span className="text-muted-foreground/70">
                    Sin límite máximo
                  </span>
                </div>
                {formData.points && formData.points > 200 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                    💡 El slider solo funciona hasta 200. Usa el campo numérico para valores mayores.
                  </p>
                )}
                {pointsInput && parseInt(pointsInput) < 1 && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded">
                    ⚠️ El valor mínimo es 1 punto
                  </p>
                )}
              </div>
            </Field>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {initialData ? "Guardar Cambios" : "Crear Tarea"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
