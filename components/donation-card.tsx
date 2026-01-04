"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, CheckCircle, Clock, XCircle, ExternalLink } from "lucide-react";
import { useState } from "react";

type DonationStatus = "pending" | "approved" | "rejected" | "cancelled" | "refunded";

interface DonationCardProps {
  donation: {
    id: string;
    amount: number;
    description?: string;
    status?: DonationStatus;
    mercadoPagoStatus?: string;
    init_point?: string;
    sandbox_init_point?: string;
    mercadoPagoPreferenceId?: string;
    mercadoPagoPaymentId?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  onVerify?: (id: string) => void;
}

export function DonationCard({ donation, onVerify }: DonationCardProps) {
  const [verifying, setVerifying] = useState(false);

  const getStatusIcon = () => {
    switch (donation.status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "rejected":
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = () => {
    switch (donation.status) {
      case "approved":
        return "Completada";
      case "pending":
        return "Pendiente";
      case "rejected":
      case "cancelled":
        return "Cancelada";
      case "refunded":
        return "Reembolsada";
      default:
        return "Pendiente";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const paymentUrl = donation.init_point || donation.sandbox_init_point;

  const handleVerify = async () => {
    if (!onVerify) return;
    setVerifying(true);
    try {
      await onVerify(donation.id);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              ${donation.amount.toLocaleString("es-CL")}
              {getStatusIcon()}
            </CardTitle>
            <CardDescription className="mt-1">
              Estado: {getStatusLabel()}
              {donation.mercadoPagoStatus && (
                <span className="block text-xs text-muted-foreground mt-1">
                  Mercado Pago: {donation.mercadoPagoStatus}
                </span>
              )}
            </CardDescription>
            {donation.createdAt && (
              <CardDescription className="text-xs mt-1">
                Creada el {formatDate(donation.createdAt)}
              </CardDescription>
            )}
            {donation.updatedAt && donation.updatedAt !== donation.createdAt && (
              <CardDescription className="text-xs">
                Actualizada el {formatDate(donation.updatedAt)}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {donation.description && (
          <p className="text-sm text-muted-foreground">{donation.description}</p>
        )}

        <div className="flex gap-2">
          {paymentUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(paymentUrl, "_blank", "noopener,noreferrer")}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ver Pago
            </Button>
          )}
          {onVerify && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerify}
              disabled={verifying}
              className="flex items-center gap-2"
            >
              {verifying ? "Verificando..." : "Verificar Estado"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

