"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import {
  FolderOpen,
  FileText,
  ChevronRight,
  Home,
  Download,
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

interface MaterialsViewerProps {
  courseId: string;
}

interface BreadcrumbItem {
  id: number | null;
  name: string;
}

export function CourseMaterialsViewer({ courseId }: MaterialsViewerProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([
    { id: null, name: "Materiales" },
  ]);

  useEffect(() => {
    fetchMaterials();
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
        // Filtrar solo elementos visibles para estudiantes
        const visibleFolders = (data.folders || []).filter(
          (f: Folder) => f.studentVisible
        );
        const visibleDocuments = (data.documents || []).filter(
          (d: Document) => d.studentVisible
        );
        setFolders(visibleFolders);
        setDocuments(visibleDocuments);
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

  const handleDownload = (url: string, name: string) => {
    window.open(url, "_blank");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6" />
            Materiales del Curso
          </h2>
          <p className="text-muted-foreground mt-1">
            {documents.length} {documents.length === 1 ? "archivo disponible" : "archivos disponibles"}
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      {breadcrumb.length > 1 && (
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
      )}

      {loading ? (
        <LoadingSpinner text="Cargando materiales..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchMaterials} />
      ) : (
        <div className="space-y-4">
          {/* Folders */}
          {folders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Carpetas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {folders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => handleFolderClick(folder)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                          <FolderOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{folder.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(folder.createdAt)}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
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
              <h3 className="text-lg font-semibold mb-3">Archivos</h3>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{doc.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              PDF • {formatDate(doc.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc.signedFileUrl, doc.name)}
                          className="gap-2 flex-shrink-0"
                        >
                          <Download className="h-4 w-4" />
                          Descargar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {folders.length === 0 && documents.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay materiales disponibles</h3>
                <p className="text-muted-foreground">
                  El profesor aún no ha subido materiales para este curso
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

