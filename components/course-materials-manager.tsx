"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import {
  FolderOpen,
  FileText,
  Upload,
  FolderPlus,
  ChevronRight,
  Home,
  Trash2,
  Eye,
  EyeOff,
  Download,
  MoreVertical,
} from "lucide-react";

interface Folder {
  id: number;
  name: string;
  courseId: number;
  parentFolderId: number | null;
  studentVisible: boolean;
  createdAt: string;
}

interface Document {
  id: number;
  name: string;
  fileUrl: string;
  signedFileUrl: string;
  courseId: number;
  folderId: number | null;
  studentVisible: boolean;
  createdAt: string;
}

interface MaterialsManagerProps {
  courseId: string;
  onUploadClick: (currentFolderId: number | null) => void;
  onCreateFolderClick: () => void;
}

interface BreadcrumbItem {
  id: number | null;
  name: string;
}

export function CourseMaterialsManager({
  courseId,
  onUploadClick,
  onCreateFolderClick,
}: MaterialsManagerProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([
    { id: null, name: "Raíz" },
  ]);

  useEffect(() => {
    fetchMaterials();
    console.log(currentFolderId);
  }, [courseId, currentFolderId]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError("");

      let url = `/api/courses/${courseId}/materials`;
      if (currentFolderId !== null) {
        url = `/api/folders/${currentFolderId}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFolders(data.folders || []);
        setDocuments(data.documents || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al cargar materiales");
      }
    } catch (err) {
      setError("Error al cargar materiales. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder: Folder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumb([...breadcrumb, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const item = breadcrumb[index];
    setCurrentFolderId(item.id);
    setBreadcrumb(breadcrumb.slice(0, index + 1));
  };

  const handleDeleteFolder = async (folderId: number, folderName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la carpeta "${folderName}" y todo su contenido?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFolders(folders.filter((f) => f.id !== folderId));
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Error al eliminar carpeta");
      }
    } catch (err) {
      alert("Error al eliminar carpeta. Por favor, intenta de nuevo.");
    }
  };

  const handleDeleteDocument = async (documentId: number, documentName: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${documentName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/materials/${documentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDocuments(documents.filter((d) => d.id !== documentId));
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Error al eliminar documento");
      }
    } catch (err) {
      alert("Error al eliminar documento. Por favor, intenta de nuevo.");
    }
  };

  const handleToggleVisibility = async (documentId: number, currentVisibility: boolean) => {
    try {
      const res = await fetch(`/api/materials/${documentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentVisible: !currentVisibility,
        }),
      });

      if (res.ok) {
        setDocuments(
          documents.map((d) =>
            d.id === documentId ? { ...d, studentVisible: !currentVisibility } : d
          )
        );
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Error al actualizar visibilidad");
      }
    } catch (err) {
      alert("Error al actualizar visibilidad. Por favor, intenta de nuevo.");
    }
  };

  const formatFileSize = (url: string) => {
    // Esto es una aproximación, en producción deberías obtener el tamaño real
    return "PDF";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderOpen className="h-8 w-8" />
            Materiales del Curso
          </h1>
          <p className="text-muted-foreground mt-1">
            {folders.filter((f) => f.studentVisible).length} carpetas, {documents.length} archivos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCreateFolderClick} variant="outline" className="gap-2">
            <FolderPlus className="h-4 w-4" />
            Nueva Carpeta
          </Button>
          <Button onClick={() => onUploadClick(currentFolderId)} className="gap-2">
            <Upload className="h-4 w-4" />
            Subir Archivo
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumb.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className={`flex items-center gap-1 hover:text-primary transition-colors ${
                index === breadcrumb.length - 1
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {index === 0 && <Home className="h-4 w-4" />}
              {item.name}
            </button>
          </div>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando materiales..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchMaterials} />
      ) : (
        <div className="space-y-4">
          {/* Folders */}
          {folders.filter((f) => f.studentVisible).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Carpetas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {folders.filter((f) => f.studentVisible).map((folder) => (
                  <Card
                    key={folder.id}
                    className="cursor-pointer hover:shadow-md transition-all group"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="flex items-center gap-3 flex-1 min-w-0"
                          onClick={() => handleFolderClick(folder)}
                        >
                          <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                            <FolderOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{folder.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {folder.studentVisible ? (
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" /> Visible
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <EyeOff className="h-3 w-3" /> Oculto
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id, folder.name);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-rose-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Archivos</h2>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-all group">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{doc.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(doc.fileUrl)} • {formatDate(doc.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleToggleVisibility(doc.id, doc.studentVisible)}
                            title={
                              doc.studentVisible
                                ? "Ocultar a estudiantes"
                                : "Mostrar a estudiantes"
                            }
                          >
                            {doc.studentVisible ? (
                              <Eye className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => window.open(doc.signedFileUrl, "_blank")}
                            title="Descargar"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeleteDocument(doc.id, doc.name)}
                            title="Eliminar"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4 text-rose-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {folders.filter((f) => f.studentVisible).length === 0 && documents.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay materiales</h3>
                <p className="text-muted-foreground mb-6">
                  Comienza subiendo archivos o creando carpetas para organizar tus materiales
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={onCreateFolderClick} variant="outline" className="gap-2">
                    <FolderPlus className="h-4 w-4" />
                    Nueva Carpeta
                  </Button>
                  <Button onClick={() => onUploadClick(currentFolderId)} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Subir Archivo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

