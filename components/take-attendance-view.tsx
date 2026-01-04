"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  RefreshCw,
  User,
  FileText,
} from "lucide-react";

export interface AttendanceRecord {
  id: string | number;
  userId: string | number;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
  user?: {
    id: string | number;
    name: string;
    email: string;
  };
  justification?: {
    id: string | number;
    reason: string;
    status: "pending" | "approved" | "rejected";
    professorNotes?: string;
  };
}

export interface AttendanceSession {
  id: string | number;
  title: string;
  description?: string;
  sessionDate: string;
  startTime?: string;
  endTime?: string;
  records?: AttendanceRecord[];
}

interface TakeAttendanceViewProps {
  session: AttendanceSession;
  onBack: () => void;
}

type AttendanceStatus = "present" | "absent" | "late" | "excused";

export function TakeAttendanceView({ session, onBack }: TakeAttendanceViewProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSessionDetails();
  }, [session.id]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/attendance/session/${session.id}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al cargar la asistencia");
      }
    } catch (err) {
      console.error("Error fetching session details:", err);
      setError("Error al cargar la asistencia");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (recordId: string | number, newStatus: AttendanceStatus) => {
    setRecords(records.map(r =>
      r.id === recordId ? { ...r, status: newStatus } : r
    ));
    setHasChanges(true);
  };

  const handleNotesChange = (recordId: string | number, notes: string) => {
    setRecords(records.map(r =>
      r.id === recordId ? { ...r, notes } : r
    ));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);

      const res = await fetch(`/api/attendance/session/${session.id}/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: records.map(r => ({
            userId: r.userId,
            status: r.status,
            notes: r.notes || undefined,
          })),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al guardar asistencia");
      }

      setHasChanges(false);
      alert("Asistencia guardada correctamente");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar asistencia");
    } finally {
      setSaving(false);
    }
  };

  const handleReviewJustification = async (justificationId: string | number, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/attendance/justification/${justificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al revisar justificacion");
      }

      await fetchSessionDetails();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al revisar justificacion");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return null;
    return time.slice(0, 5);
  };

  const getStatusConfig = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return {
          label: "Presente",
          icon: CheckCircle,
          color: "text-emerald-600",
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
          border: "border-emerald-500",
        };
      case "absent":
        return {
          label: "Ausente",
          icon: XCircle,
          color: "text-rose-600",
          bg: "bg-rose-100 dark:bg-rose-900/30",
          border: "border-rose-500",
        };
      case "late":
        return {
          label: "Tardanza",
          icon: Clock,
          color: "text-amber-600",
          bg: "bg-amber-100 dark:bg-amber-900/30",
          border: "border-amber-500",
        };
      case "excused":
        return {
          label: "Justificado",
          icon: AlertCircle,
          color: "text-blue-600",
          bg: "bg-blue-100 dark:bg-blue-900/30",
          border: "border-blue-500",
        };
    }
  };

  const statusOptions: AttendanceStatus[] = ["present", "absent", "late", "excused"];

  // Summary counts
  const presentCount = records.filter(r => r.status === "present").length;
  const absentCount = records.filter(r => r.status === "absent").length;
  const lateCount = records.filter(r => r.status === "late").length;
  const excusedCount = records.filter(r => r.status === "excused").length;
  const pendingJustifications = records.filter(r => r.justification?.status === "pending").length;

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-4 -ml-4">
            <ArrowLeft className="h-4 w-4" />
            Volver a Sesiones
          </Button>
          <h1 className="text-2xl font-bold">{session.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(session.sessionDate)}
            </span>
            {session.startTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTime(session.startTime)}
                {session.endTime && ` - ${formatTime(session.endTime)}`}
              </span>
            )}
          </div>
        </div>

        <Button onClick={handleSaveAll} disabled={!hasChanges || saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar Asistencia"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold">{presentCount}</p>
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
                <p className="text-2xl font-bold">{absentCount}</p>
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
                <p className="text-2xl font-bold">{lateCount}</p>
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
                <p className="text-2xl font-bold">{excusedCount}</p>
                <p className="text-xs text-muted-foreground">Justificados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {pendingJustifications > 0 && (
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{pendingJustifications}</p>
                  <p className="text-xs text-muted-foreground">Por revisar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchSessionDetails} variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Students List */}
      {!error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Lista de Estudiantes ({records.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay estudiantes inscritos en este curso
              </p>
            ) : (
              <div className="space-y-3">
                {records.map((record) => {
                  const statusConfig = getStatusConfig(record.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={record.id}
                      className={`p-4 rounded-lg border-2 transition-colors ${statusConfig.bg} ${statusConfig.border}`}
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        {/* Student Info */}
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold">{record.user?.name || "Estudiante"}</p>
                            <p className="text-sm text-muted-foreground">{record.user?.email}</p>
                          </div>
                        </div>

                        {/* Status Buttons */}
                        <div className="flex gap-2">
                          {statusOptions.map((status) => {
                            const config = getStatusConfig(status);
                            const Icon = config.icon;
                            const isActive = record.status === status;

                            return (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(record.id, status)}
                                className={`
                                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                                  transition-all border-2
                                  ${isActive
                                    ? `${config.bg} ${config.color} ${config.border}`
                                    : "bg-background border-transparent hover:bg-muted"
                                  }
                                `}
                              >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{config.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Justification */}
                      {record.justification && (
                        <div className="mt-3 p-3 rounded bg-background/50 border">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5" />
                                Justificación
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                  record.justification.status === "pending"
                                    ? "bg-amber-100 text-amber-700"
                                    : record.justification.status === "approved"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-rose-100 text-rose-700"
                                }`}>
                                  {record.justification.status === "pending" ? "Pendiente" :
                                   record.justification.status === "approved" ? "Aprobada" : "Rechazada"}
                                </span>
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {record.justification.reason}
                              </p>
                            </div>
                            {record.justification.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReviewJustification(record.justification!.id, "approved")}
                                  className="text-emerald-600 hover:text-emerald-700"
                                >
                                  Aprobar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReviewJustification(record.justification!.id, "rejected")}
                                  className="text-rose-600 hover:text-rose-700"
                                >
                                  Rechazar
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div className="mt-3">
                        <input
                          type="text"
                          value={record.notes || ""}
                          onChange={(e) => handleNotesChange(record.id, e.target.value)}
                          placeholder="Agregar nota (opcional)..."
                          className="w-full px-3 py-1.5 text-sm border rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

