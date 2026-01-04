"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { X, Calendar, Clock, ChevronDown } from "lucide-react";

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    title: string;
    description?: string;
    sessionDate: string;
    startTime?: string;
    endTime?: string;
  }) => void;
  initialData?: {
    title: string;
    description?: string;
    sessionDate: string;
    startTime?: string;
    endTime?: string;
  };
}

// Generate hour options (7am - 10pm)
const HOURS = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 7;
  return {
    value: hour.toString().padStart(2, "0"),
    label: hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`,
  };
});

// Generate minute options (00, 15, 30, 45)
const MINUTES = [
  { value: "00", label: "00" },
  { value: "15", label: "15" },
  { value: "30", label: "30" },
  { value: "45", label: "45" },
];

// Quick time presets
const TIME_PRESETS = [
  { label: "Mañana (8:00 - 10:00)", start: "08:00", end: "10:00" },
  { label: "Media Mañana (10:00 - 12:00)", start: "10:00", end: "12:00" },
  { label: "Tarde (14:00 - 16:00)", start: "14:00", end: "16:00" },
  { label: "Noche (18:00 - 20:00)", start: "18:00", end: "20:00" },
];

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label: string;
}

function TimePicker({ value, onChange, disabled, label }: TimePickerProps) {
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      setHour(h || "");
      setMinute(m || "00");
    } else {
      setHour("");
      setMinute("");
    }
  }, [value]);

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    if (newHour && minute) {
      onChange(`${newHour}:${minute}`);
    } else if (newHour) {
      setMinute("00");
      onChange(`${newHour}:00`);
    }
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    if (hour && newMinute) {
      onChange(`${hour}:${newMinute}`);
    }
  };

  const handleClear = () => {
    setHour("");
    setMinute("");
    onChange("");
  };

  const formatDisplayTime = () => {
    if (!hour) return "";
    const h = parseInt(hour);
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayHour}:${minute || "00"} ${period}`;
  };

  return (
    <div className="relative">
      <FieldLabel>{label}</FieldLabel>
      
      {/* Display Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2.5 
          border rounded-lg bg-background text-left
          transition-all duration-200
          ${isOpen ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className={hour ? "text-foreground" : "text-muted-foreground"}>
            {formatDisplayTime() || "Seleccionar hora"}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Picker Panel */}
          <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-popover border rounded-lg shadow-lg p-3 space-y-3">
            {/* Hour and Minute Selectors */}
            <div className="flex gap-2">
              {/* Hour */}
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Hora</p>
                <div className="grid grid-cols-4 gap-1 max-h-[140px] overflow-y-auto pr-1">
                  {HOURS.map((h) => (
                    <button
                      key={h.value}
                      type="button"
                      onClick={() => handleHourChange(h.value)}
                      className={`
                        px-2 py-1.5 text-xs rounded-md transition-colors
                        ${hour === h.value 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                        }
                      `}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minute */}
              <div className="w-20">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Min</p>
                <div className="grid grid-cols-1 gap-1">
                  {MINUTES.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => handleMinuteChange(m.value)}
                      disabled={!hour}
                      className={`
                        px-2 py-1.5 text-xs rounded-md transition-colors
                        ${minute === m.value && hour
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                        }
                        ${!hour ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      :{m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-2 border-t">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs"
              >
                Limpiar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs"
              >
                Aceptar
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function CreateSessionDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: CreateSessionDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setSessionDate(initialData.sessionDate);
        setStartTime(initialData.startTime || "");
        setEndTime(initialData.endTime || "");
      } else {
        const today = new Date().toISOString().split("T")[0];
        setTitle("");
        setDescription("");
        setSessionDate(today);
        setStartTime("");
        setEndTime("");
      }
    }
  }, [open, initialData]);

  const handlePresetClick = (preset: typeof TIME_PRESETS[0]) => {
    setStartTime(preset.start);
    setEndTime(preset.end);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !sessionDate) {
      alert("El titulo y la fecha son requeridos");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        sessionDate,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-card z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {initialData ? "Editar Sesion" : "Nueva Sesion de Clase"}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field>
              <FieldLabel htmlFor="title">Titulo de la Sesion *</FieldLabel>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Clase 1 - Introduccion"
                maxLength={200}
                required
                disabled={saving}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Descripcion (opcional)</FieldLabel>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Temas a tratar en esta sesion..."
                className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                disabled={saving}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="sessionDate">Fecha *</FieldLabel>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="sessionDate"
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  required
                  disabled={saving}
                  className="pl-10"
                />
              </div>
            </Field>

            {/* Time Presets */}
            <div>
              <p className="text-sm font-medium mb-2">Horarios Rapidos</p>
              <div className="grid grid-cols-2 gap-2">
                {TIME_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    disabled={saving}
                    className={`
                      px-3 py-2 text-xs rounded-lg border transition-all
                      ${startTime === preset.start && endTime === preset.end
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 hover:bg-muted hover:border-primary/50"
                      }
                    `}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Time Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <TimePicker
                value={startTime}
                onChange={setStartTime}
                disabled={saving}
                label="Hora Inicio"
              />
              <TimePicker
                value={endTime}
                onChange={setEndTime}
                disabled={saving}
                label="Hora Fin"
              />
            </div>

            {/* Time Display */}
            {startTime && endTime && (
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Duracion: {calculateDuration(startTime, endTime)}
                </span>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : initialData ? "Guardar Cambios" : "Crear Sesion"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function calculateDuration(start: string, end: string): string {
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  
  const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  
  if (totalMinutes < 0) {
    return "Hora invalida";
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes} minutos`;
  } else if (minutes === 0) {
    return `${hours} ${hours === 1 ? "hora" : "horas"}`;
  } else {
    return `${hours}h ${minutes}min`;
  }
}
