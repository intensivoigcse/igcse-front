"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Download,
  Trash2,
  Eye
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentDate: string;
  enrollmentId: string;
  enrollmentStatus: string;
  progress: number;
  lastActive: string;
}

interface StudentsManagerProps {
  courseId: string;
}

export function CourseStudentsManager({ courseId }: StudentsManagerProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/courses/${courseId}/students`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Error al cargar los estudiantes");
      }
    } catch (err) {
      setError("Error al cargar los estudiantes. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveStudent = async (enrollmentId: string, studentId: string) => {
    if (!confirm("¿Estás seguro de que deseas remover a este estudiante del curso?")) return;

    try {
      const res = await fetch(`/api/inscriptions/${enrollmentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setStudents(students.filter(s => s.id !== studentId));
        setSelectedStudent(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Error al remover el estudiante");
      }
    } catch (err) {
      alert("Error al remover el estudiante. Por favor, intenta de nuevo.");
    }
  };

  const handleExportStudents = () => {
    const csv = [
      ["Nombre", "Email", "Fecha de Inscripción", "Progreso", "Última Actividad"],
      ...students.map(s => [
        s.name,
        s.email,
        new Date(s.enrollmentDate).toLocaleDateString('es-ES'),
        `${s.progress}%`,
        new Date(s.lastActive).toLocaleDateString('es-ES')
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `estudiantes-${courseId}.csv`;
    a.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (progress >= 60) return "text-blue-600 dark:text-blue-400";
    if (progress >= 40) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Estudiantes
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredStudents.length} de {students.length} estudiantes
          </p>
        </div>
        <Button onClick={handleExportStudents} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Lista
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar estudiantes por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando estudiantes..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchStudents} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students List */}
          <div className="lg:col-span-2 space-y-3">
            {filteredStudents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? "No se encontraron estudiantes con ese criterio de búsqueda" 
                    : "No hay estudiantes activamente inscritos en este curso"}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Solo se muestran estudiantes con inscripción activa
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredStudents.map((student) => (
              <Card
                key={student.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedStudent?.id === student.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedStudent(student)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-primary">
                          {student.name.charAt(0)}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{student.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Inscrito: {formatDate(student.enrollmentDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    {/*
                    <div className="text-right flex-shrink-0">
                      <div className={`text-2xl font-bold ${getProgressColor(student.progress)}`}>
                        {student.progress}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Progreso</p>
                      <div className="w-20 bg-muted rounded-full h-2 mt-2">
                        <div
                          className={`h-full rounded-full ${
                            student.progress >= 80
                              ? "bg-emerald-500"
                              : student.progress >= 60
                              ? "bg-blue-500"
                              : student.progress >= 40
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                    </div> Progress */}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Student Detail Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            {selectedStudent ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalle del Estudiante</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar & Name */}
                  <div className="text-center">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl font-bold text-primary">
                        {selectedStudent.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="font-bold text-xl">{selectedStudent.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 break-all">
                      {selectedStudent.email}
                    </p>
                    {selectedStudent.enrollmentStatus === 'active' && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          Inscrito Activo
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="space-y-4">
                    {/* Stats
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Progreso del Curso</span>
                      </div>
                      <div className={`text-3xl font-bold ${getProgressColor(selectedStudent.progress)}`}>
                        {selectedStudent.progress}%
                      </div>
                      <div className="w-full bg-background rounded-full h-2 mt-3">
                        <div
                          className={`h-full rounded-full ${
                            selectedStudent.progress >= 80
                              ? "bg-emerald-500"
                              : selectedStudent.progress >= 60
                              ? "bg-blue-500"
                              : selectedStudent.progress >= 40
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${selectedStudent.progress}%` }}
                        />
                      </div>
                    </div> */}

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Fecha de inscripción:</span>
                        <span className="font-medium">{formatDate(selectedStudent.enrollmentDate)}</span>
                      </div>
                      {/*
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Última actividad:</span>
                        <span className="font-medium">{formatDate(selectedStudent.lastActive)}</span>
                      </div>   Stats */}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4">
                    {/* <Button variant="outline" className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      Ver Progreso Detallado
                    </Button>*/}
                    
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                      onClick={() => handleRemoveStudent(selectedStudent.enrollmentId, selectedStudent.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover del Curso
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Selecciona un estudiante para ver más detalles
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

