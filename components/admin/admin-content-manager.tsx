"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { 
  MessageSquare, 
  Megaphone, 
  FolderOpen, 
  Search,
  Calendar,
  User,
  MessageCircle,
  Trash2,
  FileText,
  BookOpen,
  AlertCircle
} from "lucide-react";

type TabType = "forums" | "announcements" | "materials";

interface ForumThread {
  id: string | number;
  courseId: string | number;
  title: string;
  content: string;
  createdAt: string;
  userId: number;
  course?: { title: string; name: string };
  user?: { name: string; email: string };
  repliesCount?: number;
}

interface Announcement {
  id: string | number;
  courseId: string | number;
  title: string;
  content: string;
  createdAt: string;
  course?: { title: string; name: string };
}

interface Material {
  id: string | number;
  courseId: string | number;
  name: string;
  description?: string;
  fileUrl: string;
  folderId?: string | number;
  createdAt: string;
  course?: { title: string; name: string };
  folder?: { name: string };
}

export function AdminContentManager() {
  const [activeTab, setActiveTab] = useState<TabType>("forums");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para cada tipo de contenido
  const [forums, setForums] = useState<ForumThread[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    // Cargar todos los datos al inicio
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");

      // Cargar todos los datos en paralelo
      await Promise.all([
        fetchForums(),
        fetchAnnouncements(),
        fetchMaterials(),
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const fetchForums = async () => {
    try {
      // Obtener todos los cursos
      const coursesRes = await fetch("/api/courses");
      if (!coursesRes.ok) {
        console.error("Failed to fetch courses for forums");
        return;
      }
      
      const coursesData = await coursesRes.json();
      const courses = Array.isArray(coursesData) ? coursesData : coursesData.courses || [];
      console.log("Courses loaded for forums:", courses.length);

      // Obtener hilos de foro para cada curso
      const allThreads: ForumThread[] = [];
      
      await Promise.all(
        courses.map(async (course: { id: string; title?: string; name?: string }) => {
          try {
            const threadsRes = await fetch(`/api/forums/course/${course.id}`);
            if (threadsRes.ok) {
              const threadsData = await threadsRes.json();
              const threads = Array.isArray(threadsData) ? threadsData : threadsData.threads || [];
              console.log(`Forums for course ${course.id} (${course.title || course.name}):`, threads.length);
              
              // Agregar información del curso y cargar datos del usuario
              for (const thread of threads) {
                let userData = null;
                if (thread.userId) {
                  try {
                    const userRes = await fetch(`/api/users/${thread.userId}`);
                    if (userRes.ok) {
                      userData = await userRes.json();
                    }
                  } catch (err) {
                    console.error(`Error loading user ${thread.userId}:`, err);
                  }
                }

                // Contar respuestas
                let repliesCount = 0;
                try {
                  const repliesRes = await fetch(`/api/forums/thread/${thread.id}`);
                  if (repliesRes.ok) {
                    const threadData = await repliesRes.json();
                    repliesCount = threadData.replies?.length || 0;
                  }
                } catch (err) {
                  console.error(`Error loading replies for thread ${thread.id}:`, err);
                }

                allThreads.push({
                  ...thread,
                  id: thread.id || thread.thread_id || thread.forumThreadId,
                  course: { title: course.title || course.name, name: course.name },
                  user: userData,
                  repliesCount,
                });
              }
            }
          } catch (err) {
            console.error(`Error loading forums for course ${course.id}:`, err);
          }
        })
      );

      console.log("Total forum threads loaded:", allThreads.length);
      setForums(allThreads);
    } catch (err) {
      console.error("Error fetching forums:", err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      // Obtener todos los cursos
      const coursesRes = await fetch("/api/courses");
      if (!coursesRes.ok) {
        console.error("Failed to fetch courses for announcements");
        return;
      }
      
      const coursesData = await coursesRes.json();
      const courses = Array.isArray(coursesData) ? coursesData : coursesData.courses || [];
      console.log("Courses loaded for announcements:", courses.length);

      // Obtener anuncios para cada curso
      const allAnnouncements: Announcement[] = [];
      
      await Promise.all(
        courses.map(async (course: { id: string; title?: string; name?: string }) => {
          try {
            const announcementsRes = await fetch(`/api/announcements/course/${course.id}`);
            if (announcementsRes.ok) {
              const announcementsData = await announcementsRes.json();
              const courseAnnouncements = Array.isArray(announcementsData) 
                ? announcementsData 
                : announcementsData.announcements || [];
              console.log(`Announcements for course ${course.id} (${course.title || course.name}):`, courseAnnouncements.length);
              
              courseAnnouncements.forEach((announcement: { id?: string; announcement_id?: string; announcementId?: string; courseId?: string; course_id?: string; createdAt?: string; created_at?: string; publishedAt?: string; published_at?: string; title?: string; content?: string; description?: string; isPinned?: boolean; is_pinned?: boolean }, index: number) => {
                const announcementId = announcement.id || announcement.announcement_id || announcement.announcementId || `announcement-${course.id}-${index}`;
                const createdAt = announcement.createdAt || announcement.created_at || announcement.publishedAt || announcement.published_at || new Date().toISOString();
                
                console.log(`Announcement ${announcementId} date:`, createdAt);
                
                allAnnouncements.push({
                  ...announcement,
                  id: announcementId,
                  courseId: announcement.courseId || announcement.course_id || course.id,
                  title: announcement.title || 'Sin título',
                  content: announcement.content || announcement.description || '',
                  createdAt: createdAt,
                  course: { title: course.title || course.name || '', name: course.name || '' },
                });
              });
            }
          } catch (err) {
            console.error(`Error loading announcements for course ${course.id}:`, err);
          }
        })
      );

      // Ordenar por fecha (más recientes primero)
      allAnnouncements.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      console.log("Total announcements loaded:", allAnnouncements.length);
      setAnnouncements(allAnnouncements);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  const fetchMaterials = async () => {
    try {
      // Obtener todos los cursos
      const coursesRes = await fetch("/api/courses");
      if (!coursesRes.ok) {
        console.error("Failed to fetch courses for materials");
        return;
      }
      
      const coursesData = await coursesRes.json();
      const courses = Array.isArray(coursesData) ? coursesData : coursesData.courses || [];
      console.log("Courses loaded for materials:", courses.length);

      // Obtener materiales para cada curso
      const allMaterials: Material[] = [];
      
      await Promise.all(
        courses.map(async (course: { id: string; title?: string; name?: string }) => {
          try {
            const materialsRes = await fetch(`/api/courses/${course.id}/materials`);
            if (materialsRes.ok) {
              const materialsData = await materialsRes.json();
              console.log(`Materials data for course ${course.id}:`, materialsData);
              
              // El endpoint devuelve { folders: [], documents: [] }
              const rootDocuments = materialsData.documents || [];
              const folders = materialsData.folders || [];
              
              // Agregar documentos del nivel raíz
              rootDocuments.forEach((material: { id?: string; documentId?: string; document_id?: string; name?: string; fileName?: string; title?: string; description?: string; fileUrl?: string; signedFileUrl?: string; file_url?: string; url?: string; folderId?: string; folder_id?: string; folder?: { name: string }; createdAt?: string; created_at?: string }, index: number) => {
                const materialId = material.id || material.documentId || material.document_id || `doc-${course.id}-root-${index}`;
                
                allMaterials.push({
                  id: materialId,
                  courseId: course.id,
                  name: material.name || material.fileName || material.title || 'Documento sin nombre',
                  description: material.description,
                  fileUrl: material.fileUrl || material.signedFileUrl || material.url || '',
                  folderId: material.folderId || material.folder_id,
                  createdAt: material.createdAt || material.created_at || new Date().toISOString(),
                  course: { title: course.title || course.name || '', name: course.name || '' },
                  folder: material.folder,
                });
              });

              // Obtener documentos de cada carpeta
              for (const folder of folders) {
                try {
                  const folderId = folder.id || folder.folderId || folder.folder_id;
                  const folderName = folder.name || folder.folderName || 'Carpeta sin nombre';
                  
                  const folderRes = await fetch(`/api/folders/${folderId}`);
                  if (folderRes.ok) {
                    const folderData = await folderRes.json();
                    const folderDocuments = folderData.documents || [];
                    
                    console.log(`Documents in folder "${folderName}" (${folderId}):`, folderDocuments.length);
                    
                    folderDocuments.forEach((material: { id?: string; documentId?: string; document_id?: string; name?: string; fileName?: string; title?: string; description?: string; fileUrl?: string; signedFileUrl?: string; url?: string; createdAt?: string; created_at?: string }, index: number) => {
                      const materialId = material.id || material.documentId || material.document_id || `doc-${course.id}-${folderId}-${index}`;
                      
                      allMaterials.push({
                        id: materialId,
                        courseId: course.id,
                        name: material.name || material.fileName || material.title || 'Documento sin nombre',
                        description: material.description,
                        fileUrl: material.fileUrl || material.signedFileUrl || material.url || '',
                        folderId: folderId,
                        createdAt: material.createdAt || material.created_at || new Date().toISOString(),
                        course: { title: course.title || course.name || '', name: course.name || '' },
                        folder: { name: folderName },
                      });
                    });
                  }
                } catch (err) {
                  console.error(`Error loading folder documents:`, err);
                }
              }
              
              console.log(`Total materials for course ${course.id} (${course.title || course.name}):`, 
                rootDocuments.length + folders.length);
            } else {
              console.error(`Failed to fetch materials for course ${course.id}, status:`, materialsRes.status);
            }
          } catch (err) {
            console.error(`Error loading materials for course ${course.id}:`, err);
          }
        })
      );

      console.log("Total materials loaded:", allMaterials.length);
      setMaterials(allMaterials);
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  const handleDeleteForum = async (id: string | number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este hilo del foro?")) return;

    try {
      const res = await fetch(`/api/forums/thread/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setForums(forums.filter(f => f.id !== id));
        alert("Hilo eliminado exitosamente");
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Error al eliminar el hilo");
      }
    } catch (err) {
      alert("Error al eliminar el hilo");
    }
  };

  const handleDeleteAnnouncement = async (id: string | number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este anuncio?")) return;

    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAnnouncements(announcements.filter(a => a.id !== id));
        alert("Anuncio eliminado exitosamente");
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Error al eliminar el anuncio");
      }
    } catch (err) {
      alert("Error al eliminar el anuncio");
    }
  };

  const handleDeleteMaterial = async (id: string | number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este material?")) return;

    try {
      const res = await fetch(`/api/materials/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMaterials(materials.filter(m => m.id !== id));
        alert("Material eliminado exitosamente");
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Error al eliminar el material");
      }
    } catch (err) {
      alert("Error al eliminar el material");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Sin fecha";
    
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString);
      return "Fecha inválida";
    }
    
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Filtrar según búsqueda
  const filteredForums = forums.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMaterials = materials.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: "forums" as TabType, label: "Foros", icon: MessageSquare, count: forums.length },
    { id: "announcements" as TabType, label: "Anuncios", icon: Megaphone, count: announcements.length },
    { id: "materials" as TabType, label: "Materiales", icon: FolderOpen, count: materials.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestión de Contenido</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchTerm("");
              }}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <span className="ml-1 px-2 py-0.5 rounded-full bg-muted text-xs">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={`Buscar ${activeTab === "forums" ? "hilos" : activeTab === "announcements" ? "anuncios" : "materiales"}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contenido */}
      {loading ? (
        <LoadingSpinner text="Cargando..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchAllData} />
      ) : (
        <div>
          {/* FOROS */}
          {activeTab === "forums" && (
            <div className="space-y-3">
              {filteredForums.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay hilos de foro</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? "No se encontraron hilos con ese criterio" : "Aún no se han creado hilos en los foros"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredForums.map((forum, index) => (
                  <Card key={`forum-${forum.id}-${index}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg">{forum.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {forum.course?.title || `Curso ID: ${forum.courseId}`}
                            </p>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {truncateText(forum.content, 150)}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{forum.user?.name || `Usuario ${forum.userId}`}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(forum.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{forum.repliesCount || 0} respuestas</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteForum(forum.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* ANUNCIOS */}
          {activeTab === "announcements" && (
            <div className="space-y-3">
              {filteredAnnouncements.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Megaphone className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay anuncios</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? "No se encontraron anuncios con ese criterio" : "Aún no se han publicado anuncios"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredAnnouncements.map((announcement, index) => (
                  <Card key={`announcement-${announcement.id}-${index}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg">{announcement.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {announcement.course?.title || `Curso ID: ${announcement.courseId}`}
                            </p>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {truncateText(announcement.content, 200)}
                          </p>
                          
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(announcement.createdAt)}</span>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* MATERIALES */}
          {activeTab === "materials" && (
            <div className="space-y-3">
              {filteredMaterials.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay materiales</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? "No se encontraron materiales con ese criterio" : "Aún no se han subido materiales"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredMaterials.map((material, index) => (
                  <Card key={`material-${material.id}-${index}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{material.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {material.course?.title || `Curso ID: ${material.courseId}`}
                              </p>
                              {material.folder && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  📁 {material.folder.name}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {material.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 ml-14">
                              {material.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-14">
                            <Calendar className="h-3 w-3" />
                            <span>Subido: {formatDate(material.createdAt)}</span>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="text-destructive hover:text-destructive"
                          title="Eliminar material"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


