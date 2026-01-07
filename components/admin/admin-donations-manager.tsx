"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DollarSign } from "lucide-react";

export function AdminDonationsManager() {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/donations");
      if (res.ok) {
        const data = await res.json();
        setDonations(Array.isArray(data) ? data : data.donations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) return <LoadingSpinner text="Cargando donaciones..." />;

  const total = donations.filter((d) => d.status === "approved").reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestión de Donaciones</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Total Recaudado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">${total.toLocaleString("es-CL")}</p>
          <p className="text-muted-foreground">{donations.length} donaciones totales</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Donaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {donations.map((donation: any) => (
              <div key={donation.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">${donation.amount?.toLocaleString("es-CL")}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(donation.createdAt).toLocaleDateString("es-CL")}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(donation.status)}`}>
                  {donation.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

