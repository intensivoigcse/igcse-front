"use client";

import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  UserCheck, 
  ClipboardCheck, 
  FileText, 
  DollarSign,
  MessageSquare 
} from "lucide-react";
import { AdminOverview } from "@/components/admin/admin-overview";
import { AdminUsersManager } from "@/components/admin/admin-users-manager";
import { AdminCoursesManager } from "@/components/admin/admin-courses-manager";
import { AdminInscriptionsManager } from "@/components/admin/admin-inscriptions-manager";
import { AdminAttendanceStats } from "@/components/admin/admin-attendance-stats";
import { AdminAssignmentsManager } from "@/components/admin/admin-assignments-manager";
import { AdminDonationsManager } from "@/components/admin/admin-donations-manager";
import { AdminContentManager } from "@/components/admin/admin-content-manager";

type TabType = 
  | "overview" 
  | "users" 
  | "courses" 
  | "inscriptions" 
  | "attendance" 
  | "assignments" 
  | "donations" 
  | "content";

const tabs = [
  { id: "overview" as TabType, label: "Resumen", icon: LayoutDashboard },
  { id: "users" as TabType, label: "Usuarios", icon: Users },
  { id: "courses" as TabType, label: "Cursos", icon: BookOpen },
  { id: "inscriptions" as TabType, label: "Inscripciones", icon: UserCheck },
  { id: "attendance" as TabType, label: "Asistencia", icon: ClipboardCheck },
  { id: "assignments" as TabType, label: "Tareas & Entregas", icon: FileText },
  { id: "donations" as TabType, label: "Donaciones", icon: DollarSign },
  { id: "content" as TabType, label: "Contenido", icon: MessageSquare },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverview />;
      case "users":
        return <AdminUsersManager />;
      case "courses":
        return <AdminCoursesManager />;
      case "inscriptions":
        return <AdminInscriptionsManager />;
      case "attendance":
        return <AdminAttendanceStats />;
      case "assignments":
        return <AdminAssignmentsManager />;
      case "donations":
        return <AdminDonationsManager />;
      case "content":
        return <AdminContentManager />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Gestión completa de la plataforma Intensivo IGCSE B&N
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 font-medium transition-all
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
        <div className="min-h-[500px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

