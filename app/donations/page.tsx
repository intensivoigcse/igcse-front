"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DonationCard } from "@/components/donation-card";
import { CreateDonationDialog } from "@/components/create-donation-dialog";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Heart, Plus } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";

interface Donation {
  id: string;
  amount: number;
  description?: string;
  status?: "pending" | "approved" | "rejected" | "cancelled" | "refunded";
  mercadoPagoStatus?: string;
  init_point?: string;
  sandbox_init_point?: string;
  mercadoPagoPreferenceId?: string;
  mercadoPagoPaymentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RawDonation {
  status?: string;
  mercadoPagoStatus?: string;
  [key: string]: unknown;
}

interface BackendDonationResponse {
  id?: string | number;
  amount?: number | string;
  description?: string;
  status?: string;
  mercadoPagoStatus?: string;
  init_point?: string;
  sandbox_init_point?: string;
  mercadoPagoPreferenceId?: string;
  mercadoPagoPaymentId?: string;
  createdAt?: string;
  updatedAt?: string;
  paymentUrl?: string;
  [key: string]: unknown;
}

const normalizeDonation = (rawDonation: RawDonation): Donation => {
  const status = (rawDonation?.status || rawDonation?.mercadoPagoStatus || "pending").toLowerCase();
  let normalizedStatus: Donation["status"] = "pending";
  if (status === "approved" || status === "completed") normalizedStatus = "approved";
  else if (status === "rejected" || status === "cancelled") normalizedStatus = "rejected";
  else if (status === "refunded") normalizedStatus = "refunded";

  return {
    id: String(rawDonation?.id ?? ""),
    amount: Number(rawDonation?.amount ?? 0),
    description: (rawDonation?.description as string | undefined) ?? undefined,
    status: normalizedStatus,
    mercadoPagoStatus: (rawDonation?.mercadoPagoStatus ?? rawDonation?.status) as string | undefined,
    init_point: (rawDonation?.init_point ?? rawDonation?.paymentUrl) as string | undefined,
    sandbox_init_point: rawDonation?.sandbox_init_point as string | undefined,
    mercadoPagoPreferenceId: rawDonation?.mercadoPagoPreferenceId as string | undefined,
    mercadoPagoPaymentId: rawDonation?.mercadoPagoPaymentId as string | undefined,
    createdAt: rawDonation?.createdAt as string | undefined,
    updatedAt: rawDonation?.updatedAt as string | undefined,
  };
};

export default function DonationsPage() {
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchDonations();
  }, [router]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/donations");
      if (res.ok) {
        const data = await res.json();
        const items = data.donations || data || [];
    const normalized = Array.isArray(items)
      ? items.map(normalizeDonation).filter((donation) => donation.status === "approved")
      : [];
        setDonations(normalized);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al cargar las donaciones");
      }
    } catch (err) {
      setError("Error al cargar las donaciones. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDonationCreated = (newDonation: BackendDonationResponse) => {
    const normalized = normalizeDonation(newDonation as RawDonation);
    setDonations((prev) => (normalized.status === "approved" ? [normalized, ...prev] : prev));
    setIsCreateDialogOpen(false);
    // Refrescar para asegurar datos consistentes desde backend
    fetchDonations();
  };

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/donations/${id}/verify`);
      if (res.ok) {
        const data = await res.json();
        const updated = normalizeDonation(data.donation || data);
        setDonations((prev) =>
          prev.map((donation) => (donation.id === id ? updated : donation))
        );
        // También refrescar listado completo
        fetchDonations();
        alert("Estado de donación actualizado");
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Error al verificar la donación");
      }
    } catch (err) {
      alert("Error al verificar la donación. Por favor, intenta de nuevo.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Donaciones</h1>
            <p className="text-muted-foreground">
              Gestiona tus donaciones y apoya nuestra plataforma educativa
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Donación
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner text="Cargando donaciones..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchDonations} />
        ) : donations.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No hay donaciones"
            description="Crea tu primera donación para apoyar nuestra plataforma educativa"
            actionLabel="Crear Donación"
            onAction={() => setIsCreateDialogOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                onVerify={handleVerify}
              />
            ))}
          </div>
        )}

        <CreateDonationDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onDonationCreated={handleDonationCreated}
        />
      </main>
    </div>
  );
}

