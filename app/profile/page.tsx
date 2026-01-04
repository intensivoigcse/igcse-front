"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { User, Mail, GraduationCap } from "lucide-react";
import { isAuthenticated, getUserRole } from "@/lib/auth";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        const profileData = data.profile || data.user || data;
        setProfile(profileData);
        setName(profileData.name || "");
        setEmail(profileData.email || "");
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al cargar el perfil");
      }
    } catch (err) {
      setError("Error al cargar el perfil. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/users/${profile?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user || data);
        alert("Perfil actualizado correctamente");
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al actualizar el perfil");
      }
    } catch (err) {
      setError("Error al actualizar el perfil. Por favor, intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = getUserRole() === "professor" ? "Profesor" : "Estudiante";

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

          {loading ? (
            <LoadingSpinner text="Cargando perfil..." />
          ) : error && !profile ? (
            <ErrorMessage message={error} onRetry={fetchProfile} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <FieldGroup>
                    <Field>
                      <FieldLabel>Rol</FieldLabel>
                      <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
                        getUserRole() === "professor" 
                          ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" 
                          : "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
                      }`}>
                        <div className={`p-2 rounded-full ${
                          getUserRole() === "professor"
                            ? "bg-blue-100 dark:bg-blue-900/40"
                            : "bg-purple-100 dark:bg-purple-900/40"
                        }`}>
                          <GraduationCap className={`h-5 w-5 ${
                            getUserRole() === "professor"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-purple-600 dark:text-purple-400"
                          }`} />
                        </div>
                        <div>
                          <p className={`font-semibold text-lg ${
                            getUserRole() === "professor"
                              ? "text-blue-900 dark:text-blue-100"
                              : "text-purple-900 dark:text-purple-100"
                          }`}>
                            {roleLabel}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getUserRole() === "professor" 
                              ? "Puedes crear y gestionar cursos" 
                              : "Puedes inscribirte en cursos y aprender"}
                          </p>
                        </div>
                      </div>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="name">Nombre</FieldLabel>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </Field>

                    <Field>
                      <Button type="submit" disabled={saving}>
                        {saving ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

