"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { X } from "lucide-react";

interface ForumThread {
  id?: string | number;
  title: string;
  content: string;
  category: string;
  isPinned?: boolean;
  isLocked?: boolean;
}

interface ForumThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (thread: Partial<ForumThread>) => void;
  initialData?: ForumThread;
  categories?: string[];
}

const DEFAULT_CATEGORIES = ["Dudas", "Recursos", "Estudio", "Proyectos", "General"];

export function ForumThreadDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  categories = DEFAULT_CATEGORIES,
}: ForumThreadDialogProps) {
  const [formData, setFormData] = useState<Partial<ForumThread>>({
    title: "",
    content: "",
    category: categories[0] || "Dudas",
    isPinned: false,
    isLocked: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: "",
        content: "",
        category: categories[0] || "Dudas",
        isPinned: false,
        isLocked: false
      });
    }
  }, [initialData, open, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>
              {initialData ? "Editar Hilo" : "Nuevo Hilo de Discusión"}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Field>
              <FieldLabel htmlFor="title">Título *</FieldLabel>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: ¿Cómo resolver este tipo de ecuación?"
                maxLength={200}
                required
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.title?.length || 0}/200 caracteres
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="content">Contenido Inicial *</FieldLabel>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Escribe el contenido inicial del hilo..."
                className="w-full min-h-[150px] px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                required
                disabled={saving}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Categoría *</FieldLabel>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    disabled={saving}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      formData.category === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </Field>

            {/* Only show pin/lock for editing (professor actions) */}
            {initialData && (
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <div className="flex items-center h-full">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPinned}
                        onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                        className="w-4 h-4 rounded border-input"
                        disabled={saving}
                      />
                      <span className="text-sm font-medium">Fijar hilo</span>
                    </label>
                  </div>
                </Field>

                <Field>
                  <div className="flex items-center h-full">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isLocked}
                        onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                        className="w-4 h-4 rounded border-input"
                        disabled={saving}
                      />
                      <span className="text-sm font-medium">Bloquear respuestas</span>
                    </label>
                  </div>
                </Field>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : initialData ? "Guardar Cambios" : "Crear Hilo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
