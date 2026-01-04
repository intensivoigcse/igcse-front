"use client";

import { Info, FolderOpen, FileText, Megaphone, MessageSquare, X, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export type StudentSectionType = "info" | "materials" | "assignments" | "announcements" | "forums" | "attendance";

interface StudentCourseSidebarProps {
  activeSection: StudentSectionType;
  onSectionChange: (section: StudentSectionType) => void;
  courseTitle: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const sections = [
  {
    id: "info" as StudentSectionType,
    label: "Información",
    icon: Info,
    description: "Detalles del curso"
  },
  {
    id: "materials" as StudentSectionType,
    label: "Materiales",
    icon: FolderOpen,
    description: "Guías y documentos"
  },
  {
    id: "assignments" as StudentSectionType,
    label: "Tareas",
    icon: FileText,
    description: "Entregas pendientes"
  },
  {
    id: "announcements" as StudentSectionType,
    label: "Anuncios",
    icon: Megaphone,
    description: "Novedades del curso"
  },
  {
    id: "forums" as StudentSectionType,
    label: "Foros",
    icon: MessageSquare,
    description: "Discusiones y dudas"
  },
  {
    id: "attendance" as StudentSectionType,
    label: "Asistencia",
    icon: ClipboardCheck,
    description: "Mi registro de asistencia"
  }
];

export function StudentCourseSidebar({
  activeSection,
  onSectionChange,
  courseTitle,
  isOpen = true,
  onClose
}: StudentCourseSidebarProps) {
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
        <div className="p-6 border-b border-border bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">
                Mi Curso
              </h2>
              <h3 className="text-lg font-bold line-clamp-2 leading-tight">
                {courseTitle}
              </h3>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden -mt-1 -mr-2 h-8 w-8"
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
                  <div className="text-sm font-semibold">
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
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium">Inscripción Activa</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

