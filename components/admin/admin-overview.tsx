"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  BookOpen, 
  UserCheck, 
  DollarSign, 
  ClipboardCheck,
  AlertCircle 
} from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";

interface Stats {
  totalUsers: number;
  totalStudents: number;
  totalProfessors: number;
  totalCourses: number;
  totalInscriptions: number;
  pendingInscriptions: number;
  activeInscriptions: number;
  totalDonations: number;
  totalDonationsAmount: number;
  averageAttendance: number;
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch data from multiple endpoints
      const [usersRes, coursesRes, inscriptionsRes, donationsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/courses"),
        fetch("/api/inscriptions"),
        fetch("/api/donations"),
      ]);

      if (!usersRes.ok || !coursesRes.ok || !inscriptionsRes.ok || !donationsRes.ok) {
        throw new Error("Error al cargar las estadísticas");
      }

      const users = await usersRes.json();
      const courses = await coursesRes.json();
      const inscriptions = await inscriptionsRes.json();
      const donations = await donationsRes.json();

      const usersArray = Array.isArray(users) ? users : users.users || [];
      const coursesArray = Array.isArray(courses) ? courses : courses.courses || [];
      const inscriptionsArray = Array.isArray(inscriptions) ? inscriptions : inscriptions.inscriptions || [];
      const donationsArray = Array.isArray(donations) ? donations : donations.donations || [];

      const students = usersArray.filter((u: any) => u.role === "student");
      const professors = usersArray.filter((u: any) => u.role === "professor");
      const pending = inscriptionsArray.filter((i: any) => i.enrollment_status === "pending");
      const active = inscriptionsArray.filter((i: any) => i.enrollment_status === "active" || i.enrollment_status === "accepted");
      const approvedDonations = donationsArray.filter((d: any) => d.status === "approved");
      const totalAmount = approvedDonations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

      setStats({
        totalUsers: usersArray.length,
        totalStudents: students.length,
        totalProfessors: professors.length,
        totalCourses: coursesArray.length,
        totalInscriptions: inscriptionsArray.length,
        pendingInscriptions: pending.length,
        activeInscriptions: active.length,
        totalDonations: approvedDonations.length,
        totalDonationsAmount: totalAmount,
        averageAttendance: 0, // TODO: Calcular desde datos de asistencia
      });
    } catch (err) {
      setError("Error al cargar las estadísticas. Por favor, intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Cargando estadísticas..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchStats} />;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Alertas */}
      {stats.pendingInscriptions > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Hay <strong>{stats.pendingInscriptions}</strong> inscripciones pendientes de revisión
            </p>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Usuarios */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalStudents} estudiantes, {stats.totalProfessors} profesores
            </p>
          </CardContent>
        </Card>

        {/* Cursos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de cursos en la plataforma
            </p>
          </CardContent>
        </Card>

        {/* Inscripciones */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inscripciones</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeInscriptions} activas, {stats.pendingInscriptions} pendientes
            </p>
          </CardContent>
        </Card>

        {/* Donaciones */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Donaciones</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalDonationsAmount.toLocaleString("es-CL")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalDonations} donaciones aprobadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas Detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de Usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estudiantes</span>
                <span className="font-semibold">{stats.totalStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Profesores</span>
                <span className="font-semibold">{stats.totalProfessors}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-semibold">{stats.totalUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado de Inscripciones */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Inscripciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Activas</span>
                <span className="font-semibold text-green-600">{stats.activeInscriptions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pendientes</span>
                <span className="font-semibold text-amber-600">{stats.pendingInscriptions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-semibold">{stats.totalInscriptions}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

