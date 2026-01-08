"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ClipboardCheck } from "lucide-react";

export function AdminAttendanceStats() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : data.courses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Cargando estadísticas..." />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Estadísticas de Asistencia</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Asistencia por Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Estadísticas de asistencia disponibles. Implementar visualización detallada por curso.
          </p>
          <div className="mt-4 space-y-2">
            {courses.map((course) => (
              <div key={course.id} className="p-3 border rounded">
                <p className="font-medium">{course.title}</p>
                <p className="text-sm text-muted-foreground">Tasa de asistencia: N/A</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


