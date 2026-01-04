"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Megaphone,
  Search,
  Pin,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { type Announcement } from "@/lib/mock-course-data";
import { Button } from "@/components/ui/button";

interface StudentAnnouncementsViewerProps {
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

export function StudentAnnouncementsViewer({ courseId }: StudentAnnouncementsViewerProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

  const filteredAnnouncements = sortedAnnouncements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const getPriorityIcon = (priority: Announcement["priority"]) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-5 w-5 text-rose-600" />;
      case "important":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      default:
        return <Megaphone className="h-5 w-5 text-primary" />;
    }
  };

  const getPriorityColor = (priority: Announcement["priority"]) => {
    switch (priority) {
      case "urgent":
        return "border-rose-500 bg-rose-50 dark:bg-rose-900/10";
      case "important":
        return "border-amber-500 bg-amber-50 dark:bg-amber-900/10";
      default:
        return "";
    }
  };

  const getPriorityBadge = (priority: Announcement["priority"]) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
            Urgente
          </span>
        );
      case "important":
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Importante
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha no disponible";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha no disponible";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Hoy";
    } else if (diffDays === 1) {
      return "Ayer";
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  };

  const isLongContent = (content: string) => content.length > 200;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            Anuncios del Curso
          </h2>
        </div>
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="h-6 w-6" />
          Anuncios del Curso
        </h2>
        <p className="text-muted-foreground mt-1">{filteredAnnouncements.length} anuncios</p>
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

      {/* Announcements List */}
      <div className="space-y-3">
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Megaphone className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay anuncios</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No se encontraron anuncios con ese criterio"
                  : "El profesor no ha publicado anuncios aún"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => {
            const isExpanded = expandedIds.has(announcement.id);
            const shouldTruncate = isLongContent(announcement.content) && !isExpanded;

            return (
              <Card
                key={announcement.id}
                className={`transition-all hover:shadow-md ${getPriorityColor(announcement.priority)} ${
                  announcement.isPinned ? "border-l-4" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getPriorityIcon(announcement.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {announcement.isPinned && (
                                <Pin className="h-4 w-4 text-primary" />
                              )}
                              {getPriorityBadge(announcement.priority)}
                            </div>
                            <h3 className="text-lg font-semibold">{announcement.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <span>{announcement.author}</span>
                          <span>•</span>
                          <span>{formatDate(announcement.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="pl-8">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {shouldTruncate
                          ? announcement.content.substring(0, 200) + "..."
                          : announcement.content}
                      </p>
                      {isLongContent(announcement.content) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(announcement.id)}
                          className="mt-2 gap-1 text-primary hover:text-primary"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Ver menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Ver más
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
