"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Megaphone, 
  Search, 
  Plus, 
  Edit,
  Trash2,
  Pin,
  AlertCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { type Announcement } from "@/lib/mock-course-data";
import { AnnouncementDialog } from "./announcement-dialog";

interface AnnouncementsManagerProps {
  courseId: string;
}

// Backend announcement format (handles both snake_case and camelCase)
interface BackendAnnouncement {
  announcement_id?: number;
  id?: number;
  course_id?: number;
  courseId?: number;
  author_id?: number;
  authorId?: number;
  author_name?: string;
  authorName?: string;
  title: string;
  content: string;
  priority: "normal" | "important" | "urgent";
  is_pinned?: boolean;
  isPinned?: boolean;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  author?: {
    name?: string;
    id?: number;
  };
}

// Normalize backend format to frontend format
function normalizeAnnouncement(backend: BackendAnnouncement): Announcement {
  // Handle author name from different possible formats
  const authorName = backend.author_name || 
                     backend.authorName || 
                     backend.author?.name || 
                     "Profesor";
  
  // Handle created date from different possible formats
  const createdAt = backend.created_at || backend.createdAt || "";
  
  return {
    id: (backend.announcement_id || backend.id || 0).toString(),
    title: backend.title,
    content: backend.content,
    priority: backend.priority,
    isPinned: backend.is_pinned ?? backend.isPinned ?? false,
    createdAt: createdAt,
    author: authorName,
  };
}

export function CourseAnnouncementsManager({ courseId }: AnnouncementsManagerProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | undefined>();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/announcements/course/${courseId}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al cargar anuncios");
      }
      
      const data = await res.json();
      const backendAnnouncements: BackendAnnouncement[] = data.announcements || [];
      setAnnouncements(backendAnnouncements.map(normalizeAnnouncement));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar anuncios");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Sort: pinned first, then by date (backend already does this, but ensure consistency)
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredAnnouncements = sortedAnnouncements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAnnouncement = () => {
    setEditingAnnouncement(undefined);
    setDialogOpen(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setDialogOpen(true);
  };

  const handleSaveAnnouncement = async (announcementData: Partial<Announcement>) => {
    try {
      setActionLoading("save");
      
      if (editingAnnouncement) {
        // Update existing
        const res = await fetch(`/api/announcements/${editingAnnouncement.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: announcementData.title,
            content: announcementData.content,
            priority: announcementData.priority,
            is_pinned: announcementData.isPinned,
          }),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Error al actualizar anuncio");
        }
        
        const data = await res.json();
        const updated = normalizeAnnouncement(data.announcement);
        setAnnouncements(announcements.map(a => 
          a.id === editingAnnouncement.id ? updated : a
        ));
      } else {
        // Create new
        const res = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            course_id: parseInt(courseId),
            title: announcementData.title,
            content: announcementData.content,
            priority: announcementData.priority || "normal",
            is_pinned: announcementData.isPinned || false,
          }),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Error al crear anuncio");
        }
        
        const data = await res.json();
        const newAnnouncement = normalizeAnnouncement(data.announcement);
        setAnnouncements([newAnnouncement, ...announcements]);
      }
      
      setDialogOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar anuncio");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este anuncio?")) return;
    
    try {
      setActionLoading(announcementId);
      const res = await fetch(`/api/announcements/${announcementId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al eliminar anuncio");
      }
      
      setAnnouncements(announcements.filter(a => a.id !== announcementId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar anuncio");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePin = async (announcementId: string) => {
    try {
      setActionLoading(announcementId);
      const res = await fetch(`/api/announcements/${announcementId}/pin`, {
        method: "PATCH",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al cambiar estado de fijado");
      }
      
      const data = await res.json();
      const updated = normalizeAnnouncement(data.announcement);
      setAnnouncements(announcements.map(a =>
        a.id === announcementId ? updated : a
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al cambiar estado de fijado");
    } finally {
      setActionLoading(null);
    }
  };

  const getPriorityIcon = (priority: Announcement["priority"]) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4" />;
      case "important":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Announcement["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      case "important":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    }
  };

  const getPriorityLabel = (priority: Announcement["priority"]) => {
    const labels = {
      normal: "Normal",
      important: "Importante",
      urgent: "Urgente"
    };
    return labels[priority];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha no disponible";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha no disponible";
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-rose-500 mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchAnnouncements}>Reintentar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-8 w-8" />
            Anuncios
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredAnnouncements.length} de {announcements.length} anuncios
          </p>
        </div>
        <Button onClick={handleCreateAnnouncement} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Anuncio
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar anuncios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Announcements Timeline */}
      {filteredAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "No se encontraron anuncios" : "No hay anuncios publicados"}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateAnnouncement} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Crear Primer Anuncio
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`hover:shadow-md transition-all ${
                announcement.isPinned ? "border-primary/50 shadow-sm" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${getPriorityColor(announcement.priority)}`}>
                        <span className="inline-flex items-center gap-1">
                          {getPriorityIcon(announcement.priority)}
                          {getPriorityLabel(announcement.priority)}
                        </span>
                      </span>
                      {announcement.isPinned && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-primary/15 text-primary border border-primary/20">
                          <span className="inline-flex items-center gap-1">
                            <Pin className="h-3 w-3" />
                            Fijado
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <CardTitle className="text-xl leading-tight">
                      {announcement.title}
                    </CardTitle>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Por {announcement.author}</span>
                      <span>•</span>
                      <span>{formatDate(announcement.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleTogglePin(announcement.id)}
                      className={announcement.isPinned ? "text-primary" : ""}
                      disabled={actionLoading === announcement.id}
                    >
                      {actionLoading === announcement.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Pin className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEditAnnouncement(announcement)}
                      disabled={actionLoading === announcement.id}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                      disabled={actionLoading === announcement.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Announcement Dialog */}
      <AnnouncementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveAnnouncement}
        initialData={editingAnnouncement}
      />
    </div>
  );
}
