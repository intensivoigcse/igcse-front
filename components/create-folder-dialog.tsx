"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, FolderPlus, AlertCircle, CheckCircle2 } from "lucide-react";

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  currentFolderId: number | null;
  onCreateSuccess: () => void;
}

export function CreateFolderDialog({
  isOpen,
  onClose,
  courseId,
  currentFolderId,
  onCreateSuccess,
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [studentVisible, setStudentVisible] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    const trimmedName = folderName.trim();

    // Validaciones
    if (!trimmedName) {
      setError("El nombre de la carpeta es obligatorio");
      return;
    }

    if (trimmedName.length > 100) {
      setError("El nombre es demasiado largo (máximo 100 caracteres)");
      return;
    }

    // Validar caracteres especiales
    const invalidChars = /[<>:"/\\|?*]/g;
    if (invalidChars.test(trimmedName)) {
      setError('No se permiten los caracteres: < > : " / \\ | ? *');
      return;
    }

    setCreating(true);
    setError("");

    try {
      const res = await fetch(`/api/courses/${courseId}/materials/folder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          parentFolderId: currentFolderId,
          studentVisible,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onCreateSuccess();
          handleClose();
        }, 1000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al crear la carpeta");
      }
    } catch (err) {
      setError("Error al crear la carpeta. Por favor, intenta de nuevo.");
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setFolderName("");
    setStudentVisible(true);
    setCreating(false);
    setError("");
    setSuccess(false);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !creating && folderName.trim()) {
      handleCreate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Nueva Carpeta
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleClose}
            disabled={creating}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Folder Name Input */}
          <div>
            <Label htmlFor="folderName">Nombre de la carpeta</Label>
            <Input
              id="folderName"
              type="text"
              placeholder="Ej: Guías Semestre 1"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                setError("");
              }}
              onKeyPress={handleKeyPress}
              disabled={creating}
              maxLength={100}
              className="mt-2"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-1">
              Máximo 100 caracteres
            </p>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="folderVisible">Visible para estudiantes</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Los estudiantes podrán ver esta carpeta y su contenido
              </p>
            </div>
            <input
              type="checkbox"
              id="folderVisible"
              checked={studentVisible}
              onChange={(e) => setStudentVisible(e.target.checked)}
              disabled={creating}
              className="h-4 w-4"
            />
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">¡Carpeta creada exitosamente!</span>
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
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={creating}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!folderName.trim() || creating || success}
            className="flex-1"
          >
            {creating ? "Creando..." : "Crear Carpeta"}
          </Button>
        </div>
      </div>
    </div>
  );
}

