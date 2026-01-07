"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { FileText } from "lucide-react";

export function AdminAssignmentsManager() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/assignments");
      if (res.ok) {
        const data = await res.json();
        setAssignments(Array.isArray(data) ? data : data.assignments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Cargando tareas..." />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tareas y Entregas</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Todas las Tareas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Total de tareas: {assignments.length}
          </p>
          <div className="space-y-2">
            {assignments.map((assignment: any) => (
              <div key={assignment.id} className="p-3 border rounded">
                <p className="font-medium">Tarea ID: {assignment.id}</p>
                <p className="text-sm text-muted-foreground">Curso ID: {assignment.course_id}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

