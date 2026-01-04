"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";

interface UploadMaterialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  currentFolderId: number | null;
  onUploadSuccess: () => void;
}

export function UploadMaterialDialog({
  isOpen,
  onClose,
  courseId,
  currentFolderId,
  onUploadSuccess,
}: UploadMaterialDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentVisible, setStudentVisible] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");
    setSuccess(false);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validar que sea PDF
    if (file.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF");
      setSelectedFile(null);
      return;
    }

    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("El archivo excede el límite de 10MB");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("studentVisible", String(studentVisible));
      if (currentFolderId !== null) {
        formData.append("folderId", String(currentFolderId));
      }

      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const res = await fetch(`/api/courses/${courseId}/materials/upload`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onUploadSuccess();
          handleClose();
        }, 1500);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al subir el archivo");
        setUploadProgress(0);
      }
    } catch (err) {
      setError("Error al subir el archivo. Por favor, intenta de nuevo.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setStudentVisible(true);
    setUploading(false);
    setUploadProgress(0);
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
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Material
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleClose}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* File Input */}
          <div>
            <Label htmlFor="file">Archivo PDF</Label>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                id="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar archivo PDF
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Máximo 10MB. Solo archivos PDF
            </p>
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="visible">Visible para estudiantes</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Los estudiantes podrán ver y descargar este archivo
              </p>
            </div>
            <input
              type="checkbox"
              id="visible"
              checked={studentVisible}
              onChange={(e) => setStudentVisible(e.target.checked)}
              disabled={uploading}
              className="h-4 w-4"
            />
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subiendo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">¡Archivo subido exitosamente!</span>
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
            disabled={uploading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading || success}
            className="flex-1"
          >
            {uploading ? "Subiendo..." : "Subir Archivo"}
          </Button>
        </div>
      </div>
    </div>
  );
}

