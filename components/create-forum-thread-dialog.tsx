"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, MessageSquare, Eye, CheckCircle2, AlertCircle } from "lucide-react";

interface CreateForumThreadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onCreateSuccess: () => void;
}

const categories = ["Dudas", "Recursos", "Estudio", "Proyectos", "General"];

export function CreateForumThreadDialog({
  isOpen,
  onClose,
  courseId,
  onCreateSuccess,
}: CreateForumThreadDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [content, setContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("El titulo es requerido");
      return;
    }
    if (title.length < 5) {
      setError("El titulo debe tener al menos 5 caracteres");
      return;
    }
    if (!content.trim()) {
      setError("El contenido es requerido");
      return;
    }
    if (content.length < 10) {
      setError("El contenido debe tener al menos 10 caracteres");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/forums/thread", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: parseInt(courseId),
          title: title.trim(),
          content: content.trim(),
          category,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al crear el tema");
      }

      setSuccess(true);
      setTimeout(() => {
        onCreateSuccess();
        handleClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el tema");
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setCategory(categories[0]);
    setContent("");
    setShowPreview(false);
    setSubmitting(false);
    setError("");
    setSuccess(false);
    onClose();
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      Dudas: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300",
      Recursos: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300",
      Estudio: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300",
      Proyectos: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300",
      General: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-300",
    };
    return colors[cat] || "bg-muted text-muted-foreground border-muted";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card flex items-center justify-between p-6 border-b z-10">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Crear Nuevo Tema
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Comparte dudas, recursos o ideas con tus companeros
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleClose} disabled={submitting}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <Label htmlFor="title">
              Titulo <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              placeholder="Ej: Como resolver el ejercicio 3 de la guia?"
              maxLength={200}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {title.length}/200 caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="category">
              Categoria <span className="text-rose-500">*</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  disabled={submitting}
                  className={`px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all ${
                    category === cat
                      ? getCategoryColor(cat)
                      : "bg-muted/50 text-muted-foreground border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="content">
              Contenido <span className="text-rose-500">*</span>
            </Label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              placeholder="Describe tu pregunta o tema en detalle..."
              className="w-full mt-2 min-h-[200px] p-3 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length}/2000 caracteres
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            disabled={!title.trim() && !content.trim()}
            className="w-full gap-2"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? "Ocultar" : "Ver"} Vista Previa
          </Button>

          {showPreview && (title.trim() || content.trim()) && (
            <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(category)}`}>
                  {category}
                </span>
                <span className="text-xs text-muted-foreground">Vista Previa</span>
              </div>
              <h3 className="text-lg font-semibold">{title || "Sin titulo"}</h3>
              <p className="text-sm whitespace-pre-wrap">{content || "Sin contenido"}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Tema creado exitosamente!</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-6 border-t">
          <Button variant="outline" onClick={handleClose} disabled={submitting} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || success} className="flex-1">
            {submitting ? "Creando..." : "Crear Tema"}
          </Button>
        </div>
      </div>
    </div>
  );
}
