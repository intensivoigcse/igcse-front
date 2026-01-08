"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { RichTextEditor } from "@/components/rich-text-editor";
import { X, ChevronLeft, ChevronRight, Save, Eye } from "lucide-react";
import { SchedulePicker } from "@/components/schedule-picker";

interface Course {
  id?: string;
  title: string;
  description: string;
  objectives?: string;
  requirements?: string;
  category?: string;
  level?: string;
  tags?: string[];
  duration_hours?: number;
  start_date?: string;
  end_date?: string;
  max_students?: number;
  modality?: string;
  schedule?: string;
  image_url?: string;
  status?: string;
}

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseCreated: (course: Course) => void;
  initialData?: Course;
}

const TABS = [
  { id: "basic", label: "Información Básica" },
  { id: "content", label: "Objetivos y Requisitos" },
  { id: "config", label: "Configuración" },
  { id: "preview", label: "Vista Previa" },
];

const CATEGORIES = [
  "Biología (0610)",
  "Química (0620)",
  "Física (0625)",
  "Matemáticas (0580)",
];

export function CreateCourseDialog({
  open,
  onOpenChange,
  onCourseCreated,
  initialData,
}: CreateCourseDialogProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [requirements, setRequirements] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("1o medio");
  const [tags, setTags] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxStudents, setMaxStudents] = useState("");
  const [modality, setModality] = useState("online");
  const [schedule, setSchedule] = useState("");
  const [status, setStatus] = useState("draft");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setObjectives(initialData.objectives || "");
      setRequirements(initialData.requirements || "");
      setCategory(initialData.category || "");
      setLevel(initialData.level || "1o medio");
      setTags(initialData.tags?.join(", ") || "");
      setDurationHours(initialData.duration_hours?.toString() || "");
      setStartDate(initialData.start_date ? initialData.start_date.split('T')[0] : "");
      setEndDate(initialData.end_date ? initialData.end_date.split('T')[0] : "");
      setMaxStudents(initialData.max_students?.toString() || "");
      setModality(initialData.modality || "online");
      setSchedule(initialData.schedule || "");
      setStatus(initialData.status || "draft");
    } else {
      resetForm();
    }
    setCurrentTab(0);
  }, [initialData, open]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setObjectives("");
    setRequirements("");
    setCategory("");
    setLevel("1o medio");
    setTags("");
    setDurationHours("");
    setStartDate("");
    setEndDate("");
    setMaxStudents("");
    setModality("online");
    setSchedule("");
    setStatus("draft");
  };

  const validateCurrentTab = (): boolean => {
    setError("");
    switch (currentTab) {
      case 0: // Basic - CAMPOS OBLIGATORIOS
        if (!title || title.length < 5) {
          setError("El título debe tener al menos 5 caracteres");
          return false;
        }
        if (!description || description.length < 50) {
          setError("La descripción debe tener al menos 50 caracteres");
          return false;
        }
        if (!category) {
          setError("La categoría es obligatoria");
          return false;
        }
        if (!level) {
          setError("El nivel es obligatorio");
          return false;
        }
        break;
      case 2: // Config
        if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
          setError("La fecha de fin debe ser posterior a la fecha de inicio");
          return false;
        }
        if (maxStudents && parseInt(maxStudents) <= 0) {
          setError("La capacidad máxima debe ser mayor a 0");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentTab()) {
      setCurrentTab((prev) => Math.min(prev + 1, TABS.length - 1));
    }
  };

  const handlePrev = () => {
    setError("");
    setCurrentTab((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (publishNow: boolean = false) => {
    if (!validateCurrentTab()) return;

    setLoading(true);
    setError("");

    try {
      const url = initialData ? `/api/courses/${initialData.id}` : "/api/courses";
      const method = initialData ? "PATCH" : "POST";

      const tagsArray = tags.split(",").map((t) => t.trim()).filter((t) => t);

      const courseData = {
        title,
        description,
        objectives: objectives || null,
        requirements: requirements || null,
        category,
        level,
        tags: tagsArray,
        duration_hours: durationHours ? parseInt(durationHours) : null,
        start_date: startDate || null,
        end_date: endDate || null,
        max_students: maxStudents ? parseInt(maxStudents) : null,
        modality,
        schedule: schedule || null,
        status: publishNow ? "published" : status,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error creating/updating course:", data);
        const errorMessage = data.error || data.message || `Error al ${initialData ? "actualizar" : "crear"} el curso`;
        setError(`${errorMessage} (Status: ${res.status})`);
        return;
      }

      console.log("Course created/updated successfully:", data);
      onCourseCreated(data.course || data);
      resetForm();
      onOpenChange(false);
    } catch (err) {
      console.error("Exception creating/updating course:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error inesperado";
      setError(`${errorMessage}. Por favor, intenta de nuevo.`);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "1o medio": return "1° Medio";
      case "2o medio": return "2° Medio";
      case "3o medio": return "3° Medio";
      case "4o medio": return "4° Medio";
      default: return level;
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 0: // Basic Info - TODOS OBLIGATORIOS (excepto tags)
        return (
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="title">Título del Curso *</FieldLabel>
              <Input
                id="title"
                type="text"
                placeholder="Ej: Introducción al Álgebra"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo 5 caracteres
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Descripción *</FieldLabel>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Describe el contenido del curso..."
                minLength={50}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo 50 caracteres
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Categoría *</FieldLabel>
              <Select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Selecciona una categoría</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="level">Nivel *</FieldLabel>
              <Select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                required
              >
                <option value="1o medio">1° Medio</option>
                <option value="2o medio">2° Medio</option>
                <option value="3o medio">3° Medio</option>
                <option value="4o medio">4° Medio</option>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="tags">Etiquetas (separadas por comas)</FieldLabel>
              <Input
                id="tags"
                type="text"
                placeholder="álgebra, ecuaciones, matemáticas"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </Field>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>*</strong> Campos obligatorios. Debes completar todos los campos marcados antes de continuar.
              </p>
            </div>
          </div>
        );

      case 1: // Objectives & Requirements (OPCIONALES)
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">
                Estos campos son opcionales pero ayudan a los estudiantes a entender mejor el curso.
              </p>
            </div>

            <Field>
              <FieldLabel htmlFor="objectives">Objetivos de Aprendizaje</FieldLabel>
              <RichTextEditor
                value={objectives}
                onChange={setObjectives}
                placeholder="¿Qué aprenderán los estudiantes?&#10;- Objetivo 1&#10;- Objetivo 2&#10;- Objetivo 3"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="requirements">Requisitos Previos</FieldLabel>
              <RichTextEditor
                value={requirements}
                onChange={setRequirements}
                placeholder="¿Qué conocimientos previos necesitan los estudiantes?&#10;- Requisito 1&#10;- Requisito 2"
              />
            </Field>
          </div>
        );

      case 2: // Configuration (OPCIONAL)
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">
                Información adicional sobre el curso. Todos estos campos son opcionales.
              </p>
            </div>

            <Field>
              <FieldLabel htmlFor="duration">Duración Estimada (horas)</FieldLabel>
              <Input
                id="duration"
                type="number"
                placeholder="40"
                value={durationHours}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= 0 && e.target.value != ""){
                    alert("El valor no puede ser 0 o menor");

                  }else {
                    setDurationHours(e.target.value);
                  }
                }}
                min="1"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="startDate">Fecha de Inicio</FieldLabel>
                <DatePicker
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="endDate">Fecha de Fin</FieldLabel>
                <DatePicker
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="maxStudents">Capacidad Máxima de Estudiantes</FieldLabel>
              <Input
                id="maxStudents"
                type="number"
                placeholder="Dejar vacío para ilimitado"
                value={maxStudents}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= 0 && e.target.value !== ""){
                    alert("El valor no puede ser 0 o menor");
                  } else {
                    setMaxStudents(e.target.value);
                  }
                }}
                min="1"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="modality">Modalidad</FieldLabel>
              <Select
                id="modality"
                value={modality}
                onChange={(e) => setModality(e.target.value)}
              >
                <option value="online">Online</option>
                <option value="presencial">Presencial</option>
                <option value="hybrid">Híbrido</option>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="schedule">Horarios</FieldLabel>
              <SchedulePicker
                value={schedule}
                onChange={setSchedule}
              />
            </Field>
          </div>
        );

      case 3: // Preview
        return (
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Título</p>
                <p className="font-semibold">{title || "Sin título"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Categoría</p>
                <p>{category || "Sin categoría"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nivel</p>
                <p>{getLevelLabel(level)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Descripción</p>
                <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: description || "Sin descripción" }} />
              </div>
              {objectives && (
                <div>
                  <p className="text-xs text-muted-foreground">Objetivos</p>
                  <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: objectives }} />
                </div>
              )}
              {requirements && (
                <div>
                  <p className="text-xs text-muted-foreground">Requisitos</p>
                  <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: requirements }} />
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Modalidad</p>
                <p className="capitalize">{modality}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl my-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {initialData ? "Editar Curso" : "Crear Nuevo Curso"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {TABS.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (index < currentTab || validateCurrentTab()) {
                      setCurrentTab(index);
                    }
                  }}
                  className={`px-4 py-2 text-sm rounded-md transition-colors whitespace-nowrap ${
                    currentTab === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* Content */}
          <div className="mb-6">{renderTabContent()}</div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={currentTab === 0 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {currentTab === TABS.length - 1 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Guardando..." : "Guardar Borrador"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {loading ? "Publicando..." : "Publicar Curso"}
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={handleNext} disabled={loading}>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
