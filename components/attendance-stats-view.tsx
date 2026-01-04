"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  User,
} from "lucide-react";

interface StudentStats {
  userId: string | number;
  name: string;
  email?: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

interface CourseStats {
  totalSessions: number;
  averageAttendance: number;
  studentStats: StudentStats[];
}

interface AttendanceStatsViewProps {
  courseId: string;
  onBack: () => void;
}

export function AttendanceStatsView({ courseId, onBack }: AttendanceStatsViewProps) {
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, [courseId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/attendance/course/${courseId}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al cargar las estadísticas");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Error al cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return "text-emerald-600";
    if (rate >= 60) return "text-amber-600";
    return "text-rose-600";
  };

  const getAttendanceBg = (rate: number) => {
    if (rate >= 80) return "bg-emerald-100 dark:bg-emerald-900/30";
    if (rate >= 60) return "bg-amber-100 dark:bg-amber-900/30";
    return "bg-rose-100 dark:bg-rose-900/30";
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={onBack} className="gap-2 mb-4 -ml-4">
          <ArrowLeft className="h-4 w-4" />
          Volver a Sesiones
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-7 w-7" />
          Estadísticas de Asistencia
        </h1>
        <p className="text-muted-foreground mt-1">
          Resumen general del curso
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchStats} variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {stats && !error && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sesiones</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalSessions}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Asistencia Promedio</p>
                    <p className={`text-3xl font-bold mt-1 ${getAttendanceColor(stats.averageAttendance)}`}>
                      {stats.averageAttendance.toFixed(1)}%
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Estudiantes</p>
                    <p className="text-3xl font-bold mt-1">{stats.studentStats.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Asistencia por Estudiante
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.studentStats.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos de asistencia disponibles
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Estudiante</th>
                        <th className="text-center py-3 px-2 font-semibold">
                          <span className="flex items-center justify-center gap-1">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span className="hidden sm:inline">Presentes</span>
                          </span>
                        </th>
                        <th className="text-center py-3 px-2 font-semibold">
                          <span className="flex items-center justify-center gap-1">
                            <XCircle className="h-4 w-4 text-rose-600" />
                            <span className="hidden sm:inline">Ausentes</span>
                          </span>
                        </th>
                        <th className="text-center py-3 px-2 font-semibold">
                          <span className="flex items-center justify-center gap-1">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span className="hidden sm:inline">Tardanzas</span>
                          </span>
                        </th>
                        <th className="text-center py-3 px-2 font-semibold">
                          <span className="flex items-center justify-center gap-1">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <span className="hidden sm:inline">Justif.</span>
                          </span>
                        </th>
                        <th className="text-center py-3 px-4 font-semibold">% Asistencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.studentStats
                        .sort((a, b) => b.attendanceRate - a.attendanceRate)
                        .map((student) => (
                          <tr key={student.userId} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{student.name}</p>
                                {student.email && (
                                  <p className="text-sm text-muted-foreground">{student.email}</p>
                                )}
                              </div>
                            </td>
                            <td className="text-center py-3 px-2">
                              <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                                {student.present}
                              </span>
                            </td>
                            <td className="text-center py-3 px-2">
                              <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-medium">
                                {student.absent}
                              </span>
                            </td>
                            <td className="text-center py-3 px-2">
                              <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                                {student.late}
                              </span>
                            </td>
                            <td className="text-center py-3 px-2">
                              <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
                                {student.excused}
                              </span>
                            </td>
                            <td className="text-center py-3 px-4">
                              <span className={`inline-flex items-center justify-center min-w-[4rem] px-3 py-1 rounded-full font-bold ${getAttendanceBg(student.attendanceRate)} ${getAttendanceColor(student.attendanceRate)}`}>
                                {student.attendanceRate.toFixed(0)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

