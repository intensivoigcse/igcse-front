"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Users, Monitor, MapPin, Wifi, ArrowRight } from "lucide-react";

interface CourseCardProps {
  course: {
    id?: string;
    title: string;
    description: string;
    category?: string;
    level?: string;
    tags?: string[];
    duration_hours?: number;
    max_students?: number;
    modality?: string;
    image_url?: string;
    status?: string;
  };
}

// Generate a consistent color based on a string with softer, more modern palette
const getGradientFromString = (str: string) => {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate two complementary colors with softer saturation for modern look
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 45) % 360; // Slightly closer for smoother gradient
  
  const color1 = `hsl(${hue1}, 65%, 60%)`;
  const color2 = `hsl(${hue2}, 60%, 50%)`;
  
  return { color1, color2 };
};

export function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/courses/${course.id}`);
  };

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
        return <Wifi className="h-4 w-4" />;
      case "presencial":
        return <MapPin className="h-4 w-4" />;
      case "hybrid":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Wifi className="h-4 w-4" />;
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

  const getLevelColor = () => {
    switch (course.level) {
      case "primero":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800";
      case "segundo":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800";
      case "tercero":
        return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border border-violet-200 dark:border-violet-800";
      case "cuarto_medio":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-200 dark:border-gray-800";
    }
  };

  const isDraft = course.status === "draft";
  const { color1, color2 } = getGradientFromString(course.title);
  const firstLetter = course.title.charAt(0).toUpperCase();

  return (
    <Card
      className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden relative border-border/50 dark:border-border/30 bg-card/50 dark:bg-card/80 backdrop-blur-sm"
      onClick={handleClick}
    >
      {/* Image/Gradient Header - Taller and more prominent */}
      {course.image_url ? (
        <div className="h-[180px] w-full overflow-hidden bg-muted relative">
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      ) : (
        <div 
          className="h-[180px] w-full flex items-center justify-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
          }}
        >
          <span className="text-8xl font-bold text-white/90 select-none group-hover:scale-110 transition-transform duration-500">
            {firstLetter}
          </span>
          {/* Enhanced decorative elements */}
          <div 
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 group-hover:scale-110 transition-transform duration-500"
            style={{ backgroundColor: 'white' }}
          />
          <div 
            className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-15 group-hover:scale-110 transition-transform duration-500"
            style={{ backgroundColor: 'white' }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full opacity-10"
            style={{ backgroundColor: 'white' }}
          />
        </div>
      )}

      {/* Status Badges */}
      {isDraft && (
        <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg backdrop-blur-sm">
          Borrador
        </div>
      )}

      <CardHeader className="pb-4 pt-5 px-5">
        <div className="space-y-3">
          {/* Category and Level Pills - More refined */}
          <div className="flex items-center gap-2 flex-wrap">
            {course.category && (
              <span className="text-xs px-3 py-1.5 rounded-full bg-primary/15 text-primary font-semibold border border-primary/20 dark:bg-primary/10 dark:border-primary/30">
                {course.category}
              </span>
            )}
            {course.level && (
              <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${getLevelColor()}`}>
                {getLevelLabel()}
              </span>
            )}
          </div>

          {/* Title - Larger and more prominent */}
          <CardTitle className="line-clamp-2 text-xl font-bold leading-tight group-hover:text-primary transition-colors">
            {course.title}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-5 pb-5">
        {/* Description - Better typography */}
        <CardDescription className="line-clamp-3 text-sm leading-relaxed">
          {course.description}
        </CardDescription>

        {/* Info Pills - Horizontal layout with better spacing */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {course.duration_hours && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">{course.duration_hours}h</span>
            </div>
          )}
          {course.modality && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
              {getModalityIcon()}
              <span className="font-medium">{getModalityLabel()}</span>
            </div>
          )}
          {course.max_students && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium">{course.max_students} est.</span>
            </div>
          )}
        </div>

        {/* Tags - More refined */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {course.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2.5 py-1 bg-muted/70 dark:bg-muted/50 rounded-md text-muted-foreground font-medium"
              >
                {tag}
              </span>
            ))}
            {course.tags.length > 3 && (
              <span className="text-xs px-2.5 py-1 text-muted-foreground font-medium">
                +{course.tags.length - 3} más
              </span>
            )}
          </div>
        )}

        {/* Hover indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity pt-2">
          <span>Ver curso</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </CardContent>
    </Card>
  );
}
