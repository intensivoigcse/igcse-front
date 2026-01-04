"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { 
  X, 
  Megaphone, 
  Pin, 
  AlertCircle, 
  AlertTriangle,
  Bell,
  Eye
} from "lucide-react";
import { type Announcement } from "@/lib/mock-course-data";

interface AnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (announcement: Partial<Announcement>) => void;
  initialData?: Announcement;
}

const priorities: { value: Announcement["priority"]; label: string; icon: React.ReactNode; colors: string }[] = [
  { 
    value: "normal", 
    label: "Normal", 
    icon: <Bell className="h-4 w-4" />,
    colors: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700"
  },
  { 
    value: "important", 
    label: "Importante", 
    icon: <AlertCircle className="h-4 w-4" />,
    colors: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700"
  },
  { 
    value: "urgent", 
    label: "Urgente", 
    icon: <AlertTriangle className="h-4 w-4" />,
    colors: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-300 dark:border-rose-700"
  },
];

export function AnnouncementDialog({
  open,
  onOpenChange,
  onSave,
  initialData
}: AnnouncementDialogProps) {
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: "",
    content: "",
    priority: "normal",
    isPinned: false
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: "",
        content: "",
        priority: "normal",
        isPinned: false
      });
    }
    setShowPreview(false);
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                {initialData ? "Editar Anuncio" : "Nuevo Anuncio"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Comunica información importante a tus estudiantes
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
                placeholder="Ej: Cambio de horario de clases"
                required
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.title?.length || 0}/200 caracteres
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="content">
                Contenido <span className="text-rose-500">*</span>
              </FieldLabel>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Escribe el contenido del anuncio..."
                className="w-full min-h-[150px] px-3 py-2 text-sm border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                required
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.content?.length || 0}/2000 caracteres
              </p>
            </Field>

            {/* Priority Selection */}
            <Field>
              <FieldLabel>
                Prioridad <span className="text-rose-500">*</span>
              </FieldLabel>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {priorities.map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: priority.value })}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all ${
                      formData.priority === priority.value
                        ? priority.colors
                        : "bg-muted/50 text-muted-foreground border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    {priority.icon}
                    {priority.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Pin Toggle */}
            <Field>
              <FieldLabel>Fijar Anuncio</FieldLabel>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })}
                className={`mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.isPinned
                    ? "bg-primary/10 text-primary border-primary/50"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:border-muted-foreground/30"
                }`}
              >
                <div className={`p-2 rounded-full transition-colors ${
                  formData.isPinned 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                }`}>
                  <Pin className={`h-4 w-4 transition-transform ${formData.isPinned ? "rotate-45" : ""}`} />
                </div>
                <div className="text-left">
                  <p className="font-medium">
                    {formData.isPinned ? "Anuncio Fijado" : "Fijar este anuncio"}
                  </p>
                  <p className="text-xs opacity-70">
                    {formData.isPinned 
                      ? "Aparecerá siempre al inicio de la lista" 
                      : "Los anuncios fijados aparecen primero"}
                  </p>
                </div>
                <div className={`ml-auto w-12 h-6 rounded-full transition-colors relative ${
                  formData.isPinned ? "bg-primary" : "bg-muted-foreground/30"
                }`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    formData.isPinned ? "left-7" : "left-1"
                  }`} />
                </div>
              </button>
            </Field>

            {/* Preview Toggle */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              disabled={!formData.title?.trim() && !formData.content?.trim()}
              className="w-full gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? "Ocultar" : "Ver"} Vista Previa
            </Button>

            {showPreview && (formData.title?.trim() || formData.content?.trim()) && (
              <div className="p-4 border-2 border-dashed rounded-lg space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Vista previa</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {formData.priority && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                      priorities.find(p => p.value === formData.priority)?.colors
                    }`}>
                      <span className="inline-flex items-center gap-1">
                        {priorities.find(p => p.value === formData.priority)?.icon}
                        {priorities.find(p => p.value === formData.priority)?.label}
                      </span>
                    </span>
                  )}
                  {formData.isPinned && (
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-primary/15 text-primary border border-primary/20">
                      <span className="inline-flex items-center gap-1">
                        <Pin className="h-3 w-3" />
                        Fijado
                      </span>
                    </span>
                  )}
                </div>
                <h4 className="font-semibold">{formData.title || "Sin título"}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {formData.content || "Sin contenido"}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {initialData ? "Guardar Cambios" : "Publicar Anuncio"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
