"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, User, Trash2, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { EnrollmentStatusBadge } from "./enrollment-status-badge";
import { useState } from "react";
import { ManageInscriptionDialog } from "./manage-inscription-dialog";

interface InscriptionCardProps {
  inscription: {
    id: string;
    courseId: string;
    enrollment_status?: "pending" | "accepted" | "rejected";
    message?: string;
    acceptedAt?: string;
    updatedAt?: string;
    course?: {
      id: string;
      title: string;
      description: string;
    };
    student?: {
      id: string;
      name: string;
      email: string;
    };
  };
  isTeacher?: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, status: "accepted" | "rejected", message?: string) => Promise<void>;
}

export function InscriptionCard({ inscription, isTeacher, onDelete, onUpdate }: InscriptionCardProps) {
  const router = useRouter();
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  const formatDateTime = (dateString?: string) => {
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

  const handleViewCourse = () => {
    router.push(`/courses/${inscription.courseId}`);
  };

  const handleManage = () => {
    setIsManageDialogOpen(true);
  };

  const handleUpdate = async (id: string, status: "accepted" | "rejected", message?: string) => {
    if (onUpdate) {
      await onUpdate(id, status, message);
    }
  };

  const enrollmentStatus = inscription.enrollment_status || "pending";
  const isPending = enrollmentStatus === "pending";
  const acceptedOn = formatDateTime(inscription.acceptedAt || inscription.updatedAt);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              {isTeacher ? <User className="h-6 w-6 text-primary" /> : <BookOpen className="h-6 w-6 text-primary" />}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">
                  {isTeacher
                    ? inscription.student?.name || "Estudiante"
                    : inscription.course?.title || "Curso"}
                </CardTitle>
                <EnrollmentStatusBadge status={enrollmentStatus} />
              </div>
              {isTeacher && inscription.student?.email && (
                <CardDescription className="mt-1">
                  {inscription.student.email}
                </CardDescription>
              )}
              {!isTeacher && inscription.course?.description && (
                <CardDescription className="mt-1 line-clamp-2">
                  {inscription.course.description}
                </CardDescription>
              )}
              {!isTeacher && inscription.message && (
                <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                  <p className="text-muted-foreground text-xs">Mensaje del profesor:</p>
                  <p className="mt-1">{inscription.message}</p>
                </div>
              )}
              {enrollmentStatus === "accepted" && acceptedOn && (
                <p className="text-xs text-muted-foreground mt-2">
                  Aceptada el {acceptedOn}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {!isTeacher && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewCourse}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Ver Curso
              </Button>
            )}
            {isTeacher && isPending && onUpdate && (
              <Button
                variant="default"
                size="sm"
                onClick={handleManage}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Gestionar
              </Button>
            )}
            {onDelete && isPending && !isTeacher && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(inscription.id)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Retirar Solicitud
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isTeacher && onUpdate && (
        <ManageInscriptionDialog
          open={isManageDialogOpen}
          onOpenChange={setIsManageDialogOpen}
          inscription={inscription}
          onUpdate={handleUpdate}
        />
      )}
    </>
  );
}

