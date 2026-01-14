"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CourseDetailCard } from "@/components/course-detail-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";
import { isAuthenticated, isTeacher, getUserFromToken } from "@/lib/auth";
import { CreateCourseDialog } from "@/components/create-course-dialog";
import { CourseManagementSidebar, type SectionType } from "@/components/course-management-sidebar";
import { CourseManagementOverview } from "@/components/course-management-overview";
import { CourseStudentsManager } from "@/components/course-students-manager";
import { CourseMaterialsManager } from "@/components/course-materials-manager";
import { CourseAssignmentsManager } from "@/components/course-assignments-manager";
import { CourseAnnouncementsManager } from "@/components/course-announcements-manager";
import { CourseForumsManager } from "@/components/course-forums-manager";
import { UploadMaterialDialog } from "@/components/upload-material-dialog";
import { CreateFolderDialog } from "@/components/create-folder-dialog";
import { SubmitAssignmentDialog } from "@/components/submit-assignment-dialog";
import { CreateForumThreadDialog } from "@/components/create-forum-thread-dialog";
import { StudentCourseSidebar, type StudentSectionType } from "@/components/student-course-sidebar";
import { StudentCourseInfo } from "@/components/student-course-info";
import { CourseMaterialsViewer } from "@/components/course-materials-viewer";
import { StudentAssignmentsViewer } from "@/components/student-assignments-viewer";
import { StudentAnnouncementsViewer } from "@/components/student-announcements-viewer";
import { StudentForumsViewer } from "@/components/student-forums-viewer";
import { ForumThreadView, type ForumThread } from "@/components/forum-thread-view";
import { CourseAttendanceManager } from "@/components/course-attendance-manager";
import { StudentAttendanceViewer } from "@/components/student-attendance-viewer";
import { DeleteCourseDialog } from "@/components/delete-course-dialog";
import type { Assignment } from "@/lib/mock-course-data";

interface Course {
  id: string;
  title: string;
  description: string;
  professor_id?: string | number;
  objectives?: string;
  requirements?: string;
  category?: string;
  level?: string;
  tags?: string[];
  duration_hours?: number;
  start_date?: string;
  end_date?: string;
  max_students?: number;
  modality?: string;
  schedule?: string;
  image_url?: string;
  status?: string;
  students?: Array<{ id: string; name: string; email: string }>;
}

interface Inscription {
  id: string;
  courseId: string;
  userId?: string | number;
  enrollment_status?: "pending" | "accepted" | "rejected";
  message?: string;
  course?: Course;
  updatedAt?: string;
  acceptedAt?: string;
}

const normalizeEnrollmentStatus = (status?: string | null) => {
  switch (status) {
    case "accepted":
    case "active":
      return "accepted";
    case "rejected":
    case "dropped":
    case "expired":
      return "rejected";
    case "pending":
    default:
      return "pending";
  }
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<"pending" | "accepted" | "rejected" | null>(null);
  const [enrollmentMessage, setEnrollmentMessage] = useState<string | null>(null);
  const [inscriptionId, setInscriptionId] = useState<string | null>(null);
  const [enrollmentAcceptedAt, setEnrollmentAcceptedAt] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Teacher management state
  const [activeSection, setActiveSection] = useState<SectionType>("overview");
  const userIsTeacher = isTeacher();
  
  // Materials management state
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [materialsKey, setMaterialsKey] = useState(0);
  const [currentFolderIdForUpload, setCurrentFolderIdForUpload] = useState<number | null>(null);
  
  // Student assignment and forum state
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isSubmitAssignmentOpen, setIsSubmitAssignmentOpen] = useState(false);
  const [isCreateThreadOpen, setIsCreateThreadOpen] = useState(false);
  const [submissionRefreshKey, setSubmissionRefreshKey] = useState(0);
  const [forumsRefreshKey, setForumsRefreshKey] = useState(0);
  
  // Student sidebar state (for accepted students)
  const [studentActiveSection, setStudentActiveSection] = useState<StudentSectionType>("info");
  const [selectedForumThread, setSelectedForumThread] = useState<ForumThread | null>(null);
  const [isStudentMobileSidebarOpen, setIsStudentMobileSidebarOpen] = useState(false);

  useEffect(() => {
    
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchCourse();
    if (!isTeacher()) {
      checkEnrollment();
    }
  }, [ courseId, router]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data.course || data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al cargar el curso");
      }
    } catch (err) {
      setError("Error al cargar el curso. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      // Obtener el userId del usuario actual para filtrar correctamente
      const currentUser = getUserFromToken();
      const currentUserId = currentUser?.id;
      
      // Usar endpoint /inscriptions que devuelve todas las inscripciones (incluyendo pending)
      // El endpoint /inscriptions/courses solo devuelve inscripciones 'active'
      const res = await fetch("/api/inscriptions");
      if (res.ok) {
        const data = await res.json();
        const inscriptions: Inscription[] = data.inscriptions || data || [];
        const courseIdNum = Number(courseId);
        
        // Buscar inscripción para este curso Y este usuario específico
        const enrollment = inscriptions.find((ins) => {
          const matchesCourse = 
            Number(ins.courseId) === courseIdNum || 
            (ins.course?.id && Number(ins.course.id) === courseIdNum);
          
          // Si tenemos userId, también verificar que sea del usuario actual
          const matchesUser = currentUserId 
            ? String(ins.userId) === String(currentUserId)
            : true; // Si no tenemos userId, solo filtrar por curso
          
          return matchesCourse && matchesUser;
        });
        
        if (enrollment) {
          setIsEnrolled(true);
          setInscriptionId(enrollment.id);
          const normalizedStatus = normalizeEnrollmentStatus(enrollment.enrollment_status);
          setEnrollmentStatus(normalizedStatus || null);
          setEnrollmentMessage(enrollment.message || null);
          if (normalizedStatus === "accepted") {
            setEnrollmentAcceptedAt(enrollment.updatedAt || enrollment.acceptedAt || null);
          } else {
            setEnrollmentAcceptedAt(null);
          }
        } else {
          setIsEnrolled(false);
          setInscriptionId(null);
          setEnrollmentStatus(null);
          setEnrollmentMessage(null);
          setEnrollmentAcceptedAt(null);
        }
      }
    } catch (err) {
      console.error("Error checking enrollment:", err);
    }
  };

  const handleEnroll = async () => {
    try {
      const res = await fetch("/api/inscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      if (res.ok) {
        const data = await res.json();
        // Establecer el estado directamente con los datos de la respuesta
        // NO llamar a checkEnrollment() porque el endpoint /inscriptions/courses
        // solo devuelve inscripciones 'active', no 'pending'
        setIsEnrolled(true);
        setInscriptionId(data.inscription?.id || data.id || data.inscriptionId);
        setEnrollmentStatus("pending");
        setEnrollmentMessage(null);
        setEnrollmentAcceptedAt(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Error al inscribirse en el curso");
      }
    } catch (err) {
      alert("Error al inscribirse. Por favor, intenta de nuevo.");
    }
  };

  const handleUnenroll = async () => {
    if (!inscriptionId) return;

    try {
      const res = await fetch(`/api/inscriptions/${inscriptionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIsEnrolled(false);
        setInscriptionId(null);
        setEnrollmentStatus(null);
        setEnrollmentMessage(null);
        setEnrollmentAcceptedAt(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Error al cancelar la inscripción");
      }
    } catch (err) {
      alert("Error al cancelar la inscripción. Por favor, intenta de nuevo.");
    }
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDeleteCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Error al eliminar el curso");
      }

      // Redirect to dashboard after successful deletion
      router.push("/dashboard");
    } catch (err) {
      // Re-throw error to be handled by the dialog
      throw err;
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCourseUpdated = (updatedCourse: Partial<Course> & { title: string; description: string }) => {
    // Ensure the course has an id before updating
    if (updatedCourse.id || course?.id) {
      setCourse({ ...course!, ...updatedCourse, id: updatedCourse.id || course!.id });
    }
    setIsEditDialogOpen(false);
  };

  const handleMaterialsRefresh = () => {
    setMaterialsKey((prev) => prev + 1);
  };

  const handleSubmitAssignmentClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmitAssignmentOpen(true);
  };

  const handleSubmitAssignmentSuccess = () => {
    setIsSubmitAssignmentOpen(false);
    setSelectedAssignment(null);
    // Forzar recarga de submissions incrementando el refresh key
    setSubmissionRefreshKey((prev) => prev + 1);
  };

  const handleCreateThreadSuccess = () => {
    setIsCreateThreadOpen(false);
    // Refrescar datos de foros incrementando el refreshKey
    setForumsRefreshKey((prev) => prev + 1);
  };

  const handleForumThreadClick = (thread: ForumThread) => {
    setSelectedForumThread(thread);
  };

  const handleBackToForums = () => {
    setSelectedForumThread(null);
  };

  // Render content for accepted students
  const renderStudentContent = () => {
    // If viewing a specific forum thread
    if (studentActiveSection === "forums" && selectedForumThread) {
      return (
        <div className="p-6">
          <ForumThreadView 
            thread={selectedForumThread} 
            onBack={handleBackToForums} 
            professorId={course?.professor_id}
          />
        </div>
      );
    }

    switch (studentActiveSection) {
      case "info":
        return (
          <StudentCourseInfo 
            course={course!} 
            enrollmentAcceptedAt={enrollmentAcceptedAt}
          />
        );
      case "materials":
        return (
          <div className="p-6">
            <CourseMaterialsViewer courseId={courseId} />
          </div>
        );
      case "assignments":
        return (
          <div className="p-6">
            <StudentAssignmentsViewer
              courseId={courseId}
              onSubmitClick={handleSubmitAssignmentClick}
              submissionRefreshKey={submissionRefreshKey}
            />
          </div>
        );
      case "announcements":
        return (
          <div className="p-6">
            <StudentAnnouncementsViewer courseId={courseId} />
          </div>
        );
      case "forums":
        return (
          <div className="p-6">
            <StudentForumsViewer
              courseId={courseId}
              onCreateThreadClick={() => setIsCreateThreadOpen(true)}
              onThreadClick={handleForumThreadClick}
              refreshKey={forumsRefreshKey}
            />
          </div>
        );
      case "attendance":
        return (
          <div className="p-6">
            <StudentAttendanceViewer courseId={courseId} />
          </div>
        );
      default:
        return null;
    }
  };

  const renderManagementContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <CourseManagementOverview
            courseId={courseId}
            onCreateAssignment={() => setActiveSection("assignments")}
            onCreateAnnouncement={() => setActiveSection("announcements")}
            onSectionChange={(section) => setActiveSection(section)}
            onDeleteCourse={handleDeleteClick}
          />
        );
      case "students":
        return <CourseStudentsManager courseId={courseId} />;
      case "materials":
        return (
          <CourseMaterialsManager
            key={materialsKey}
            courseId={courseId}
            onUploadClick={(currentFolderId) => {
              setCurrentFolderIdForUpload(currentFolderId);
              setIsUploadDialogOpen(true);
            }}
            onCreateFolderClick={() => setIsCreateFolderDialogOpen(true)}
          />
        );
      case "assignments":
        return <CourseAssignmentsManager courseId={courseId} />;
      case "announcements":
        return <CourseAnnouncementsManager courseId={courseId} />;
      case "forums":
        return <CourseForumsManager courseId={courseId} refreshKey={forumsRefreshKey} professorId={course?.professor_id} />;
      case "attendance":
        return <CourseAttendanceManager courseId={courseId} />;
      default:
        return null;
    }
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <LoadingSpinner text="Cargando curso..." />
        </main>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <ErrorMessage message={error || "Curso no encontrado"} onRetry={fetchCourse} />
        </main>
      </div>
    );
  }

  // Student view - different views based on enrollment status
  if (!userIsTeacher) {
    // Accepted students get the new sidebar layout
    if (enrollmentStatus === "accepted") {
      return (
        <div className="min-h-screen bg-background">
          {/* Header with back button and mobile menu */}
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="container mx-auto px-4 py-3 flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              
              <div className="flex-1" />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsStudentMobileSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main layout with sidebar and content */}
          <div className="flex">
            {/* Student Sidebar */}
            <StudentCourseSidebar
              activeSection={studentActiveSection}
              onSectionChange={setStudentActiveSection}
              courseTitle={course.title}
              isOpen={isStudentMobileSidebarOpen}
              onClose={() => setIsStudentMobileSidebarOpen(false)}
            />

            {/* Main content */}
            <main className="flex-1 min-w-0 bg-muted/30">
              {renderStudentContent()}
            </main>
          </div>

          {/* Student assignment submission dialog */}
          {selectedAssignment && (
            <SubmitAssignmentDialog
              isOpen={isSubmitAssignmentOpen}
              onClose={() => setIsSubmitAssignmentOpen(false)}
              assignment={selectedAssignment}
              onSubmitSuccess={handleSubmitAssignmentSuccess}
            />
          )}

          {/* Student forum thread creation dialog */}
          <CreateForumThreadDialog
            isOpen={isCreateThreadOpen}
            onClose={() => setIsCreateThreadOpen(false)}
            courseId={courseId}
            onCreateSuccess={handleCreateThreadSuccess}
          />
        </div>
      );
    }

    // Not enrolled or pending - show enrollment view with CourseDetailCard
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>

          <CourseDetailCard
            course={course}
            isEnrolled={isEnrolled}
            enrollmentStatus={enrollmentStatus}
            enrollmentMessage={enrollmentMessage}
            enrollmentAcceptedAt={enrollmentAcceptedAt}
            onEnroll={handleEnroll}
            onUnenroll={handleUnenroll}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />

          {/* Mensaje informativo si está inscrito pero no aceptado */}
          {isEnrolled && enrollmentStatus === "pending" && (
            <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                Inscripción Pendiente
              </h3>
              <p className="text-amber-800 dark:text-amber-200">
                Tu solicitud de inscripción está siendo revisada por el profesor. Una vez que sea aceptada, 
                podrás acceder a todos los materiales, tareas, anuncios y foros del curso.
              </p>
            </div>
          )}

          {/* Mensaje si no está inscrito */}
          {!isEnrolled && (
            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Accede al Contenido del Curso
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                Para acceder a los materiales, tareas, anuncios y foros del curso, primero debes inscribirte 
                haciendo clic en el botón &quot;Inscribirse&quot; arriba.
              </p>
            </div>
          )}

          {isEditDialogOpen && (
            <CreateCourseDialog
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              onCourseCreated={handleCourseUpdated}
              initialData={course}
            />
          )}
        </main>
      </div>
    );
  }

  // Teacher view - show management interface
  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button and mobile menu */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          
          <div className="flex-1" />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main layout with sidebar and content */}
      <div className="flex">
        {/* Sidebar */}
        <CourseManagementSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          courseTitle={course.title}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 min-w-0 bg-muted/30">
          {renderManagementContent()}
        </main>
      </div>

      {/* Edit course dialog */}
      {isEditDialogOpen && (
        <CreateCourseDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onCourseCreated={handleCourseUpdated}
          initialData={course}
        />
      )}

      {/* Upload material dialog */}
      <UploadMaterialDialog
        isOpen={isUploadDialogOpen}
        onClose={() => {
          setIsUploadDialogOpen(false);
          setCurrentFolderIdForUpload(null);
        }}
        courseId={courseId}
        currentFolderId={currentFolderIdForUpload}
        onUploadSuccess={handleMaterialsRefresh}
      />

      {/* Delete course dialog */}
      {userIsTeacher && course && (
        <DeleteCourseDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          courseTitle={course.title}
          onDelete={handleDeleteCourse}
        />
      )}

      {/* Create folder dialog */}
      <CreateFolderDialog
        isOpen={isCreateFolderDialogOpen}
        onClose={() => setIsCreateFolderDialogOpen(false)}
        courseId={courseId}
        currentFolderId={null}
        onCreateSuccess={handleMaterialsRefresh}
      />
    </div>
  );
}

