"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Search,
  Plus,
  Pin,
  Lock,
  Eye,
  MessageCircle,
  RefreshCw,
} from "lucide-react";

export interface ForumThread {
  id: string | number;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  createdAt: string;
  user?: {
    id: string | number;
    name: string;
    email?: string;
  };
  author?: string; // Fallback for mock data
  replies?: Array<{
    id: string | number;
    content: string;
    createdAt: string;
    user?: { id: string | number; name: string };
    author?: string;
  }>;
  _count?: {
    replies: number;
  };
}

interface StudentForumsViewerProps {
  courseId: string;
  onCreateThreadClick: () => void;
  onThreadClick: (thread: ForumThread) => void;
  refreshKey?: number; // Increment to trigger refresh
}

const CATEGORIES = ["Dudas", "Recursos", "Estudio", "Proyectos", "General"];

export function StudentForumsViewer({
  courseId,
  onCreateThreadClick,
  onThreadClick,
  refreshKey = 0,
}: StudentForumsViewerProps) {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    fetchThreads();
  }, [courseId, refreshKey]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      setError("");
      
      let url = `/api/forums/course/${courseId}`;
      const params = new URLSearchParams();
      if (filterCategory !== "all") {
        params.append("category", filterCategory);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setThreads(data || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al cargar los foros");
      }
    } catch (err) {
      console.error("Error fetching forums:", err);
      setError("Error al cargar los foros");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when filter changes
  useEffect(() => {
    if (!loading) {
      fetchThreads();
    }
  }, [filterCategory]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        fetchThreads();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Sort: pinned first, then by date (in case backend doesn't sort)
  const sortedThreads = [...threads].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
        month: "short",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Dudas: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      Recursos: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      Estudio: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      Proyectos: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      General: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const getReplyCount = (thread: ForumThread) => {
    return thread._count?.replies ?? thread.replies?.length ?? 0;
  };

  const getAuthorName = (thread: ForumThread) => {
    return thread.user?.name || thread.author || "Anónimo";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Foros de Discusión
            </h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Foros de Discusión
          </h2>
          <p className="text-muted-foreground mt-1">{sortedThreads.length} temas</p>
        </div>
        <Button onClick={onCreateThreadClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Tema
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar en foros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={filterCategory === "all" ? "default" : "outline"}
            onClick={() => setFilterCategory("all")}
            size="sm"
            className="whitespace-nowrap"
          >
            Todas
          </Button>
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={filterCategory === category ? "default" : "outline"}
              onClick={() => setFilterCategory(category)}
              size="sm"
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchThreads} variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Threads List */}
      {!error && (
        <div className="space-y-3">
          {sortedThreads.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay temas de discusión</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterCategory !== "all"
                    ? "No se encontraron temas con ese criterio"
                    : "Sé el primero en crear un tema"}
                </p>
                <Button onClick={onCreateThreadClick} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Primer Tema
                </Button>
              </CardContent>
            </Card>
          ) : (
            sortedThreads.map((thread) => (
              <Card
                key={thread.id}
                className="cursor-pointer hover:shadow-md transition-all group"
                onClick={() => onThreadClick(thread)}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Title and Badges */}
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {thread.isPinned && (
                              <Pin className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                            {thread.isLocked && (
                              <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getCategoryColor(
                                thread.category
                              )}`}
                            >
                              {thread.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {thread.title}
                          </h3>
                        </div>
                      </div>

                      {/* Preview */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {thread.content}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span>{getAuthorName(thread)}</span>
                        <span>•</span>
                        <span>{formatDate(thread.createdAt)}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>
                            {getReplyCount(thread)}{" "}
                            {getReplyCount(thread) === 1 ? "respuesta" : "respuestas"}
                          </span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{thread.views} vistas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
