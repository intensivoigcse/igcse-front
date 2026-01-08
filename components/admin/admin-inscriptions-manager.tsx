"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { UserCheck, Check, X } from "lucide-react";

interface Inscription {
  id: number;
  userId: number;
  courseId: number;
  enrollment_status: string;
  paymentStatus?: string;
  createdAt: string;
  user?: { name: string; email: string };
  course?: { title: string };
}

export function AdminInscriptionsManager() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inscriptions");
      if (res.ok) {
        const data = await res.json();
        const inscriptionsArray = Array.isArray(data) ? data : data.inscriptions || [];
        setInscriptions(inscriptionsArray);
      }
    } catch (err) {
      setError("Error al cargar inscripciones");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/inscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollment_status: status }),
      });
      if (res.ok) fetchInscriptions();
    } catch (err) {
      alert("Error al actualizar inscripción");
    }
  };

  const filteredInscriptions = statusFilter === "all" 
    ? inscriptions 
    : inscriptions.filter((i) => i.enrollment_status === statusFilter);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800",
      active: "bg-green-100 text-green-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      dropped: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) return <LoadingSpinner text="Cargando..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchInscriptions} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestión de Inscripciones</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border px-3"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="active">Activas</option>
          <option value="rejected">Rechazadas</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inscripciones ({filteredInscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInscriptions.map((inscription) => (
              <div key={inscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{inscription.user?.name || `Usuario ${inscription.userId}`}</p>
                  <p className="text-sm text-muted-foreground">{inscription.course?.title || `Curso ${inscription.courseId}`}</p>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${getStatusBadge(inscription.enrollment_status)}`}>
                    {inscription.enrollment_status}
                  </span>
                </div>
                {inscription.enrollment_status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdateStatus(inscription.id, "active")}>
                      <Check className="h-4 w-4 mr-1" /> Aprobar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(inscription.id, "rejected")}>
                      <X className="h-4 w-4 mr-1" /> Rechazar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


