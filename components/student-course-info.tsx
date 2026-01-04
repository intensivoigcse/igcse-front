"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Clock, Calendar, Monitor, MapPin, Wifi, Tag } from "lucide-react";

interface Course {
  id: string;
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

interface StudentCourseInfoProps {
  course: Course;
  enrollmentAcceptedAt?: string | null;
}

export function StudentCourseInfo({ course, enrollmentAcceptedAt }: StudentCourseInfoProps) {
  const getLevelLabel = () => {
    switch (course.level) {
      case "primero":
        return "1° Medio";
      case "segundo":
        return "2° Medio";
      case "tercero":
        return "3° Medio";
      case "cuarto_medio":
        return "4° Medio";
      default:
        return course.level || "";
    }
  };

  const getModalityIcon = () => {
    switch (course.modality) {
      case "online":
        return <Wifi className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case "presencial":
        return <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case "hybrid":
        return <Monitor className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Wifi className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    }
  };

  const getModalityLabel = () => {
    switch (course.modality) {
      case "online":
        return "Online";
      case "presencial":
        return "Presencial";
      case "hybrid":
        return "Híbrido";
      default:
        return "Online";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const acceptedOn = formatDateTime(enrollmentAcceptedAt);

  // Generate gradient colors for hero section
  const getGradientFromString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 45) % 360;
    const color1 = `hsl(${hue1}, 65%, 60%)`;
    const color2 = `hsl(${hue2}, 60%, 50%)`;
    return { color1, color2 };
  };

  const { color1, color2 } = getGradientFromString(course.title);
  const firstLetter = course.title.charAt(0).toUpperCase();

  return (
    <div className="p-6 space-y-6">
      {/* Hero Section with Image/Gradient */}
      <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-xl">
        {course.image_url ? (
          <>
            <img
              src={course.image_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center relative"
            style={{
              background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
            }}
          >
            <span className="text-8xl font-bold text-white/90 select-none z-10">
              {firstLetter}
            </span>
            <div 
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20"
              style={{ backgroundColor: 'white' }}
            />
            <div 
              className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full opacity-15"
              style={{ backgroundColor: 'white' }}
            />
          </div>
        )}
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {course.category && (
              <span className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold border border-white/30">
                {course.category}
              </span>
            )}
            {course.level && (
              <span className="text-xs px-3 py-1 rounded-full font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                {getLevelLabel()}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold drop-shadow-lg">
            {course.title}
          </h1>
        </div>
      </div>

      {/* Enrollment Status Card */}
      <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                Inscripción Activa
              </p>
              {acceptedOn && (
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Aceptado el {acceptedOn}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {course.duration_hours && (
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duración</p>
                  <p className="text-lg font-bold">{course.duration_hours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {course.modality && (
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  {getModalityIcon()}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Modalidad</p>
                  <p className="text-lg font-bold">{getModalityLabel()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {course.max_students && (
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Capacidad</p>
                  <p className="text-lg font-bold">{course.max_students}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {(course.start_date || course.end_date) && (
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fechas</p>
                  <p className="text-sm font-bold">
                    {course.start_date ? formatDate(course.start_date)?.split(' ')[0] : 'TBD'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Description */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-xl">Descripción</h3>
            </div>
            <div 
              className="text-base leading-relaxed text-foreground prose prose-sm max-w-none prose-headings:font-bold prose-p:mb-4"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          </div>

          {/* Objectives */}
          {course.objectives && (
            <div className="space-y-3 pt-6 border-t">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">✓</span>
                </div>
                <h3 className="font-bold text-xl">Objetivos de Aprendizaje</h3>
              </div>
              <div 
                className="text-base leading-relaxed text-foreground prose prose-sm max-w-none prose-ul:list-disc prose-ul:ml-6 prose-li:mb-2"
                dangerouslySetInnerHTML={{ __html: course.objectives }}
              />
            </div>
          )}

          {/* Requirements */}
          {course.requirements && (
            <div className="space-y-3 pt-6 border-t">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">!</span>
                </div>
                <h3 className="font-bold text-xl">Requisitos Previos</h3>
              </div>
              <div 
                className="text-base leading-relaxed text-foreground prose prose-sm max-w-none prose-ul:list-disc prose-ul:ml-6 prose-li:mb-2"
                dangerouslySetInnerHTML={{ __html: course.requirements }}
              />
            </div>
          )}

          {/* Additional Info Grid */}
          {((course.start_date || course.end_date) || course.schedule || course.tags) && (
            <div className="pt-6 border-t">
              <h3 className="font-bold text-xl mb-4">Detalles Adicionales</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Dates */}
                {(course.start_date || course.end_date) && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">Fechas del Curso</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        {course.start_date && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Inicio:</span>
                            <span className="font-medium">{formatDate(course.start_date)}</span>
                          </div>
                        )}
                        {course.end_date && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fin:</span>
                            <span className="font-medium">{formatDate(course.end_date)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Schedule */}
                {course.schedule && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">Horarios</h4>
                      </div>
                      <p className="text-sm leading-relaxed">{course.schedule}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Etiquetas</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-sm px-4 py-2 bg-primary/10 text-primary rounded-full font-medium border border-primary/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

