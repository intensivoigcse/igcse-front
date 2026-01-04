"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Edit,
  Trash2,
  Pin,
  Lock,
  Eye,
  MessageCircle,
  User,
  RefreshCw,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { ForumThreadDialog } from "./forum-thread-dialog";
import { ForumThreadView } from "./forum-thread-view";

interface ForumReply {
  id: string | number;
  content: string;
  createdAt: string;
  user?: {
    id: string | number;
    name: string;
  };
  author?: string;
}

interface ForumThread {
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
  author?: string;
  replies?: ForumReply[];
  _count?: {
    replies: number;
  };
}

interface ForumsManagerProps {
  courseId: string;
  refreshKey?: number; // Increment to trigger refresh
  professorId?: string | number; // ID del profesor del curso
}

const CATEGORIES = ["Dudas", "Recursos", "Estudio", "Proyectos", "General"];

export function CourseForumsManager({ courseId, refreshKey = 0, professorId }: ForumsManagerProps) {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [viewingThread, setViewingThread] = useState<ForumThread | null>(null); // Para ver detalle completo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingThread, setEditingThread] = useState<ForumThread | undefined>();

  useEffect(() => {
    fetchThreads();
  }, [courseId, refreshKey]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      setError("");
      
      let url = `/api/forums/course/${courseId}`;
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        fetchThreads();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Sort: pinned first, then by date
  const sortedThreads = [...threads].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredThreads = sortedThreads.filter(thread =>
    thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateThread = () => {
    setEditingThread(undefined);
    setDialogOpen(true);
  };

  const handleEditThread = (thread: ForumThread) => {
    setEditingThread(thread);
    setDialogOpen(true);
  };

  const handleSaveThread = async (threadData: Partial<ForumThread>) => {
    try {
      if (editingThread) {
        // Update existing
        const res = await fetch(`/api/forums/thread/${editingThread.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: threadData.title,
            content: threadData.content,
            category: threadData.category,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Error al actualizar hilo");
        }

        await fetchThreads();
        if (selectedThread?.id === editingThread.id) {
          const updatedThread = await res.json();
          setSelectedThread(updatedThread);
        }
      } else {
        // Create new
        const res = await fetch("/api/forums/thread", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: parseInt(courseId),
            title: threadData.title,
            content: threadData.content,
            category: threadData.category || "General",
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Error al crear hilo");
        }

        await fetchThreads();
      }
      
      setDialogOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar hilo");
    }
  };

  const handleDeleteThread = async (threadId: string | number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este hilo? Se eliminarán también todas las respuestas.")) return;

    try {
      const res = await fetch(`/api/forums/thread/${threadId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al eliminar hilo");
      }

      setThreads(threads.filter(t => t.id !== threadId));
      if (selectedThread?.id === threadId) {
        setSelectedThread(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar hilo");
    }
  };

  const handleTogglePin = async (threadId: string | number) => {
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return;

    try {
      const res = await fetch(`/api/forums/thread/${threadId}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !thread.isPinned }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al fijar/desfijar hilo");
      }

      setThreads(threads.map(t =>
        t.id === threadId ? { ...t, isPinned: !t.isPinned } : t
      ));
      if (selectedThread?.id === threadId) {
        setSelectedThread({ ...selectedThread, isPinned: !selectedThread.isPinned });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al fijar/desfijar hilo");
    }
  };

  const handleToggleLock = async (threadId: string | number) => {
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return;

    try {
      const res = await fetch(`/api/forums/thread/${threadId}/lock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: !thread.isLocked }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al bloquear/desbloquear hilo");
      }

      setThreads(threads.map(t =>
        t.id === threadId ? { ...t, isLocked: !t.isLocked } : t
      ));
      if (selectedThread?.id === threadId) {
        setSelectedThread({ ...selectedThread, isLocked: !selectedThread.isLocked });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al bloquear/desbloquear hilo");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getAuthorName = (thread: ForumThread) => {
    return thread.user?.name || thread.author || "Anónimo";
  };

  const getReplyCount = (thread: ForumThread) => {
    return thread._count?.replies ?? thread.replies?.length ?? 0;
  };

  const handleViewThread = (thread: ForumThread) => {
    setViewingThread(thread);
  };

  const handleBackToList = () => {
    setViewingThread(null);
    // Refrescar lista al volver por si hubo cambios (ej: nuevas respuestas)
    fetchThreads();
  };

  const handleThreadUpdated = (updatedThread: ForumThread) => {
    // Actualizar el hilo en la lista local
    setThreads(threads.map(t => 
      t.id === updatedThread.id ? updatedThread : t
    ));
    setViewingThread(updatedThread);
  };

  if (loading && threads.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="h-8 w-8" />
              Foros de Discusión
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Vista de detalle del hilo
  if (viewingThread) {
    return (
      <div className="p-6">
        <ForumThreadView
          thread={viewingThread}
          onBack={handleBackToList}
          onThreadUpdated={handleThreadUpdated}
          professorId={professorId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Foros de Discusión
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredThreads.length} de {threads.length} hilos
          </p>
        </div>
        <Button onClick={handleCreateThread} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Hilo
        </Button>
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

      {/* Search */}
      {!error && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar en foros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Threads List */}
            <div className="lg:col-span-2 space-y-3">
              {filteredThreads.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? "No se encontraron hilos" : "No hay hilos de discusión"}
                    </p>
                    {!searchTerm && (
                      <Button onClick={handleCreateThread} className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Crear Primer Hilo
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredThreads.map((thread) => (
                  <Card
                    key={thread.id}
                    className={`cursor-pointer hover:shadow-md transition-all ${
                      selectedThread?.id === thread.id ? "ring-2 ring-primary" : ""
                    } ${thread.isPinned ? "border-primary/50" : ""}`}
                    onClick={() => setSelectedThread(thread)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          {/* Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-primary/15 text-primary border border-primary/20">
                              {thread.category}
                            </span>
                            {thread.isPinned && (
                              <span className="text-xs px-2 py-1 rounded-full font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                <Pin className="h-3 w-3 inline" />
                              </span>
                            )}
                            {thread.isLocked && (
                              <span className="text-xs px-2 py-1 rounded-full font-semibold bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                                <Lock className="h-3 w-3 inline" />
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="font-semibold text-lg leading-tight">
                            {thread.title}
                          </h3>

                          {/* Meta */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {getAuthorName(thread)}
                            </span>
                            <span>•</span>
                            <span>{formatDate(thread.createdAt)}</span>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {thread.views} vistas
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {getReplyCount(thread)} respuestas
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Thread Detail Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                {selectedThread ? (
                  <Card>
                    <CardHeader className="border-b">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">Detalles del Hilo</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePin(selectedThread.id)}
                            className={`h-8 w-8 p-0 ${selectedThread.isPinned ? "text-primary" : ""}`}
                            title={selectedThread.isPinned ? "Desfijar" : "Fijar"}
                          >
                            <Pin className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleLock(selectedThread.id)}
                            className={`h-8 w-8 p-0 ${selectedThread.isLocked ? "text-amber-600" : ""}`}
                            title={selectedThread.isLocked ? "Desbloquear" : "Bloquear"}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      {/* Title & Content */}
                      <div>
                        <h3 className="font-bold text-lg mb-2">{selectedThread.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
                          {selectedThread.content}
                        </p>
                      </div>

                      {/* Author */}
                      <div className="text-sm">
                        <span className="text-muted-foreground">Por: </span>
                        <span className="font-medium">{getAuthorName(selectedThread)}</span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 py-3 border-y">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{selectedThread.views}</div>
                          <div className="text-xs text-muted-foreground">Vistas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{getReplyCount(selectedThread)}</div>
                          <div className="text-xs text-muted-foreground">Respuestas</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-4">
                        <Button
                          className="w-full gap-2"
                          onClick={() => handleViewThread(selectedThread)}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Ver Hilo Completo
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => handleEditThread(selectedThread)}
                        >
                          <Edit className="h-4 w-4" />
                          Editar Hilo
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                          onClick={() => handleDeleteThread(selectedThread.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar Hilo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Selecciona un hilo para ver más detalles
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Thread Dialog */}
      <ForumThreadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveThread}
        initialData={editingThread}
        categories={CATEGORIES}
      />
    </div>
  );
}
