"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, FileText, Image, File, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import type { Assignment } from "@/lib/mock-course-data";

interface SubmitAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
  onSubmitSuccess: () => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
}

export function SubmitAssignmentDialog({
  isOpen,
  onClose,
  assignment,
  onSubmitSuccess,
}: SubmitAssignmentDialogProps) {
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setError("");

    // Validar máximo 5 archivos
    if (files.length + selectedFiles.length > 5) {
      setError("Máximo 5 archivos permitidos");
      return;
    }

    // Validar archivos
    for (const file of selectedFiles) {
      // Validar tipo (PDFs, imágenes, documentos)
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError("Solo se permiten PDFs, imágenes (JPG, PNG) y documentos Word");
        return;
      }

      // Validar tamaño (10MB máximo por archivo)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`El archivo "${file.name}" excede el límite de 10MB`);
        return;
      }
    }

    // Agregar archivos con preview si son imágenes
    const newFiles: UploadedFile[] = selectedFiles.map((file) => {
      if (file.type.startsWith("image/")) {
        const preview = URL.createObjectURL(file);
        return { file, preview };
      }
      return { file };
    });

    setFiles([...files, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!comment.trim() && files.length === 0) {
      setError("Debes agregar un comentario o subir al menos un archivo");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      
      // Agregar archivos
      files.forEach((uploadedFile) => {
        formData.append("files", uploadedFile.file);
      });
      
      // Agregar assignmentId (convertir de string a number)
      formData.append("assignmentId", assignment.id);
      
      // Agregar comentarios si existen
      if (comment.trim()) {
        formData.append("comments", comment.trim());
      }

      const res = await fetch("/api/submissions/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al enviar la tarea. Por favor, intenta de nuevo.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSubmitSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      setError("Error al enviar la tarea. Por favor, intenta de nuevo.");
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Limpiar previews
    files.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setComment("");
    setFiles([]);
    setSubmitting(false);
    setError("");
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return Image;
    if (file.type === "application/pdf") return FileText;
    return File;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card flex items-center justify-between p-6 border-b z-10">
          <div>
            <h2 className="text-xl font-bold">Entregar Tarea</h2>
            <p className="text-sm text-muted-foreground mt-1">{assignment.title}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleClose} disabled={submitting}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Assignment Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm">{assignment.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>Puntos: {assignment.points}</span>
              <span>•</span>
              <span>
                Vence: {new Date(assignment.dueDate).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>

          {/* Comment/Response */}
          <div>
            <Label htmlFor="comment">Comentarios o Respuesta</Label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
              placeholder="Escribe tus comentarios o respuesta aquí..."
              className="w-full mt-2 min-h-[120px] p-3 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* File Upload */}
          <div>
            <Label>Archivos Adjuntos</Label>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileSelect}
                disabled={submitting}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting}
              >
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar archivos
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              PDFs, imágenes, documentos Word (máx. 5 archivos, 10MB por archivo)
            </p>
          </div>

          {/* Files Preview */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Archivos seleccionados ({files.length})</Label>
              {files.map((uploadedFile, index) => {
                const FileIcon = getFileIcon(uploadedFile.file);
                return (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg group">
                    {uploadedFile.preview ? (
                      <img
                        src={uploadedFile.preview}
                        alt={uploadedFile.file.name}
                        className="h-12 w-12 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{uploadedFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveFile(index)}
                      disabled={submitting}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">¡Tarea entregada exitosamente!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t">
          <Button variant="outline" onClick={handleClose} disabled={submitting} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || success} className="flex-1">
            {submitting ? "Enviando..." : "Entregar Tarea"}
          </Button>
        </div>
      </div>
    </div>
  );
}
