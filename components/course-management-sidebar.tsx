"use client";

import { LayoutDashboard, Users, FileText, Megaphone, MessageSquare, FolderOpen, X, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SectionType = "overview" | "students" | "materials" | "assignments" | "announcements" | "forums" | "attendance";

interface CourseSidebarProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  courseTitle: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const sections = [
  {
    id: "overview" as SectionType,
    label: "Resumen",
    icon: LayoutDashboard,
    description: "Vista general del curso"
  },
  {
    id: "students" as SectionType,
    label: "Estudiantes",
    icon: Users,
    description: "Gestionar estudiantes"
  },
  {
    id: "materials" as SectionType,
    label: "Materiales",
    icon: FolderOpen,
    description: "Guías y documentos"
  },
  {
    id: "assignments" as SectionType,
    label: "Tareas",
    icon: FileText,
    description: "Crear y gestionar tareas"
  },
  {
    id: "announcements" as SectionType,
    label: "Anuncios",
    icon: Megaphone,
    description: "Publicar anuncios"
  },
  {
    id: "forums" as SectionType,
    label: "Foros",
    icon: MessageSquare,
    description: "Gestionar discusiones"
  },
  {
    id: "attendance" as SectionType,
    label: "Asistencia",
    icon: ClipboardCheck,
    description: "Control de asistencia"
  }
];

export function CourseManagementSidebar({
  activeSection,
  onSectionChange,
  courseTitle,
  isOpen = true,
  onClose
}: CourseSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen lg:h-[calc(100vh-4rem)]
          w-72 bg-card border-r border-border
          z-50 lg:z-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Gestión de Curso
              </h2>
              <h3 className="text-lg font-bold line-clamp-2 leading-tight">
                {courseTitle}
              </h3>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                className="lg:hidden -mt-1 -mr-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => {
                  onSectionChange(section.id);
                  if (onClose) onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                  }
                  group
                `}
              >
                <Icon
                  className={`
                    h-5 w-5 shrink-0
                    ${isActive ? "" : "group-hover:scale-110"}
                    transition-transform duration-200
                  `}
                />
                <div className="flex-1 text-left">
                  <div className={`text-sm font-semibold ${isActive ? "" : ""}`}>
                    {section.label}
                  </div>
                  <div
                    className={`
                      text-xs mt-0.5
                      ${
                        isActive
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground/70"
                      }
                    `}
                  >
                    {section.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-1 h-8 bg-primary-foreground/30 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Gestiona todos los aspectos de tu curso desde este panel.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

