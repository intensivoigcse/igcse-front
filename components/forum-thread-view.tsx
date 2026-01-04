"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MessageSquare,
  Pin,
  Lock,
  User,
  Send,
  RefreshCw,
  Trash2,
  Edit,
  GraduationCap,
} from "lucide-react";
import { getUserFromToken } from "@/lib/auth";

export interface ForumReply {
  id: string | number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string | number;
    name: string;
    email?: string;
  };
  author?: string; // Fallback
}

export interface ForumThread {
  id: string | number;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string | number;
    name: string;
    email?: string;
  };
  author?: string; // Fallback
  replies?: ForumReply[];
  _count?: {
    replies: number;
  };
}

interface ForumThreadViewProps {
  thread: ForumThread;
  onBack: () => void;
  onThreadUpdated?: (thread: ForumThread) => void;
  professorId?: string | number; // ID del profesor del curso
}

export function ForumThreadView({ thread: initialThread, onBack, onThreadUpdated, professorId }: ForumThreadViewProps) {
  const [thread, setThread] = useState<ForumThread>(initialThread);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState<string | number | null>(null);
  const [editContent, setEditContent] = useState("");
  
  const currentUser = getUserFromToken();

  // Fetch full thread details on mount
  useEffect(() => {
    fetchThread();
  }, [initialThread.id]);

  const fetchThread = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/forums/thread/${initialThread.id}`);
      if (res.ok) {
        const data = await res.json();
        setThread(data);
        if (onThreadUpdated) {
          onThreadUpdated(data);
        }
      }
    } catch (err) {
      console.error("Error fetching thread:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || thread.isLocked) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/forums/thread/${thread.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: replyContent }),
      });

      if (res.ok) {
        setReplyContent("");
        // Refresh thread to get new reply
        await fetchThread();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Error al publicar respuesta");
      }
    } catch (err) {
      alert("Error al publicar respuesta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReply = async (replyId: string | number) => {
    if (!editContent.trim()) return;

    try {
      const res = await fetch(`/api/forums/reply/${replyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (res.ok) {
        setEditingReplyId(null);
        setEditContent("");
        await fetchThread();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Error al editar respuesta");
      }
    } catch (err) {
      alert("Error al editar respuesta");
    }
  };

  const handleDeleteReply = async (replyId: string | number) => {
    if (!confirm("¿Estás seguro de eliminar esta respuesta?")) return;

    try {
      const res = await fetch(`/api/forums/reply/${replyId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchThread();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Error al eliminar respuesta");
      }
    } catch (err) {
      alert("Error al eliminar respuesta");
    }
  };

  const startEditReply = (reply: ForumReply) => {
    setEditingReplyId(reply.id);
    setEditContent(reply.content);
  };

  const cancelEditReply = () => {
    setEditingReplyId(null);
    setEditContent("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getAuthorName = (item: { user?: { name: string }; author?: string }) => {
    return item.user?.name || item.author || "Anónimo";
  };

  const isProfessor = (item: { user?: { id: string | number } }) => {
    if (!professorId || !item.user?.id) return false;
    return String(item.user.id) === String(professorId);
  };

  const isReplyOwner = (reply: ForumReply) => {
    if (!currentUser?.id) return false;
    return String(reply.user?.id) === String(currentUser.id);
  };

  const replies = thread.replies || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Volver a foros
        </Button>
        <div className="flex items-center gap-2 mb-2">
          {thread.isPinned && <Pin className="h-4 w-4 text-primary" />}
          {thread.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
              thread.category
            )}`}
          >
            {thread.category}
          </span>
        </div>
        <h1 className="text-3xl font-bold">{thread.title}</h1>
      </div>

      {/* Original Post */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{getAuthorName(thread)}</p>
                  {isProfessor(thread) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <GraduationCap className="h-3 w-3" />
                      Profesor
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(thread.createdAt)}</p>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{thread.content}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Respuestas ({replies.length})
          </h2>
          {loading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {replies.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {thread.isLocked
                  ? "Este tema está cerrado y no acepta nuevas respuestas"
                  : "Sé el primero en responder"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {replies.map((reply) => (
              <Card key={reply.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{getAuthorName(reply)}</p>
                            {isProfessor(reply) && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                <GraduationCap className="h-2.5 w-2.5" />
                                Profesor
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(reply.createdAt)}
                            {reply.updatedAt && reply.updatedAt !== reply.createdAt && (
                              <span className="ml-2">(editado)</span>
                            )}
                          </p>
                        </div>
                        {isReplyOwner(reply) && !thread.isLocked && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditReply(reply)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReply(reply.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {editingReplyId === reply.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full min-h-[80px] p-2 text-sm border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEditReply(reply.id)}>
                              Guardar
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEditReply}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reply Form */}
      {!thread.isLocked && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Agregar Respuesta</h3>
            <div className="space-y-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                disabled={submitting}
                placeholder="Escribe tu respuesta aquí..."
                className="w-full min-h-[120px] p-3 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || submitting}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Publicando..." : "Publicar Respuesta"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {thread.isLocked && (
        <Card className="border-muted-foreground/30 bg-muted/30">
          <CardContent className="p-6 text-center">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Este tema está cerrado y no acepta nuevas respuestas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
