"use client";

import { useState } from "react";
import { FolderOpen, FileText, Megaphone, MessageSquare } from "lucide-react";
import { CourseMaterialsViewer } from "@/components/course-materials-viewer";
import { StudentAssignmentsViewer } from "@/components/student-assignments-viewer";
import { StudentAnnouncementsViewer } from "@/components/student-announcements-viewer";
import { StudentForumsViewer, type ForumThread } from "@/components/student-forums-viewer";
import { ForumThreadView } from "@/components/forum-thread-view";
import type { Assignment } from "@/lib/mock-course-data";

interface StudentCourseTabsProps {
  courseId: string;
  onSubmitAssignment?: (assignment: Assignment) => void;
  onCreateThread?: () => void;
  submissionRefreshKey?: number;
}

type TabType = "materials" | "assignments" | "announcements" | "forums";

const tabs = [
  {
    id: "materials" as TabType,
    label: "Materiales",
    icon: FolderOpen,
  },
  {
    id: "assignments" as TabType,
    label: "Tareas",
    icon: FileText,
  },
  {
    id: "announcements" as TabType,
    label: "Anuncios",
    icon: Megaphone,
  },
  {
    id: "forums" as TabType,
    label: "Foros",
    icon: MessageSquare,
  },
];

export function StudentCourseTabs({
  courseId,
  onSubmitAssignment,
  onCreateThread,
  submissionRefreshKey,
}: StudentCourseTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("materials");
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);

  const handleThreadClick = (thread: ForumThread) => {
    setSelectedThread(thread);
  };

  const handleBackToForums = () => {
    setSelectedThread(null);
  };

  const renderTabContent = () => {
    // If viewing a specific forum thread
    if (activeTab === "forums" && selectedThread) {
      return <ForumThreadView thread={selectedThread} onBack={handleBackToForums} />;
    }

    switch (activeTab) {
      case "materials":
        return <CourseMaterialsViewer courseId={courseId} />;
      case "assignments":
        return (
          <StudentAssignmentsViewer
            key={activeTab}
            courseId={courseId}
            onSubmitClick={onSubmitAssignment || (() => {})}
            submissionRefreshKey={submissionRefreshKey}
          />
        );
      case "announcements":
        return <StudentAnnouncementsViewer courseId={courseId} />;
      case "forums":
        return (
          <StudentForumsViewer
            courseId={courseId}
            onCreateThreadClick={onCreateThread || (() => {})}
            onThreadClick={handleThreadClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Header */}
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 font-medium transition-all
                  border-b-2 whitespace-nowrap
                  ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
}
