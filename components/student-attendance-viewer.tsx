"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  FileText,
  Send,
} from "lucide-react";
import { SubmitJustificationDialog } from "./submit-justification-dialog";

interface AttendanceRecord {
  sessionId: string | number;
  recordId: string | number;
  title: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  justification?: {
    id: string | number;
    reason: string;
    status: "pending" | "approved" | "rejected";
    professorNotes?: string;
  };
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

interface MyAttendanceData {
  sessions: AttendanceRecord[];
  stats: AttendanceStats;
}

interface StudentAttendanceViewerProps {
  courseId: string;
}

export function StudentAttendanceViewer({ courseId }: StudentAttendanceViewerProps) {
  const [data, setData] = useState<MyAttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [justificationDialogOpen, setJustificationDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    fetchMyAttendance();
  }, [courseId]);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/attendance/course/${courseId}/my`);
      if (res.ok) {
        const responseData = await res.json();
        setData(responseData);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al cargar tu asistencia");
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError("Error al cargar tu asistencia");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenJustification = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setJustificationDialogOpen(true);
  };

  const handleSubmitJustification = async (reason: string) => {
    if (!selectedRecord) return;

    try {
      const res = await fetch(`/api/attendance/record/${selectedRecord.recordId}/justification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al enviar justificacion");
      }

      setJustificationDialogOpen(false);
      setSelectedRecord(null);
      await fetchMyAttendance();
    } catch (err) {
      throw err; // Re-throw to be handled by the dialog
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "present":
        return {
          label: "Presente",
          icon: CheckCircle,
          color: "text-emerald-600",
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
        };
      case "absent":
        return {
          label: "Ausente",
          icon: XCircle,
          color: "text-rose-600",
          bg: "bg-rose-100 dark:bg-rose-900/30",
        };
      case "late":
        return {
          label: "Tardanza",
          icon: Clock,
          color: "text-amber-600",
          bg: "bg-amber-100 dark:bg-amber-900/30",
        };
      case "excused":
        return {
          label: "Justificado",
          icon: AlertCircle,
          color: "text-blue-600",
          bg: "bg-blue-100 dark:bg-blue-900/30",
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          color: "text-muted-foreground",
          bg: "bg-muted",
        };
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return "text-emerald-600";
    if (rate >= 60) return "text-amber-600";
    return "text-rose-600";
  };

  const canSubmitJustification = (record: AttendanceRecord) => {
    return (record.status === "absent" || record.status === "late") && !record.justification;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            Mi Asistencia
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6" />
          Mi Asistencia
        </h2>
        <p className="text-muted-foreground mt-1">
          Tu registro de asistencia en este curso
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchMyAttendance} variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {data && !error && (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="col-span-2 md:col-span-1 border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`h-5 w-5 ${getAttendanceColor(data.stats.attendanceRate)}`} />
                  <div>
                    <p className={`text-2xl font-bold ${getAttendanceColor(data.stats.attendanceRate)}`}>
                      {data.stats.attendanceRate.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Asistencia</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-2xl font-bold">{data.stats.present}</p>
                    <p className="text-xs text-muted-foreground">Presentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-rose-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-rose-600" />
                  <div>
                    <p className="text-2xl font-bold">{data.stats.absent}</p>
                    <p className="text-xs text-muted-foreground">Ausentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-2xl font-bold">{data.stats.late}</p>
                    <p className="text-xs text-muted-foreground">Tardanzas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{data.stats.excused}</p>
                    <p className="text-xs text-muted-foreground">Justificados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sessions List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Historial de Sesiones ({data.sessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.sessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay sesiones de asistencia registradas
                </p>
              ) : (
                <div className="space-y-3">
                  {data.sessions.map((record) => {
                    const statusConfig = getStatusConfig(record.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={record.sessionId}
                        className={`p-4 rounded-lg ${statusConfig.bg} border`}
                      >
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full bg-background ${statusConfig.color}`}>
                              <StatusIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold">{record.title}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(record.date)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                            
                            {canSubmitJustification(record) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenJustification(record)}
                                className="gap-1"
                              >
                                <Send className="h-3.5 w-3.5" />
                                Justificar
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Justification Info */}
                        {record.justification && (
                          <div className="mt-3 p-3 rounded bg-background/80 border">
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">Justificación</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    record.justification.status === "pending"
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                      : record.justification.status === "approved"
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                      : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                  }`}>
                                    {record.justification.status === "pending" ? "En revisión" :
                                     record.justification.status === "approved" ? "Aprobada" : "Rechazada"}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{record.justification.reason}</p>
                                {record.justification.professorNotes && (
                                  <p className="text-sm text-muted-foreground mt-1 italic">
                                    Nota del profesor: {record.justification.professorNotes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Justification Dialog */}
      <SubmitJustificationDialog
        open={justificationDialogOpen}
        onOpenChange={setJustificationDialogOpen}
        onSubmit={handleSubmitJustification}
        sessionTitle={selectedRecord?.title || ""}
        sessionDate={selectedRecord?.date || ""}
      />
    </div>
  );
}

