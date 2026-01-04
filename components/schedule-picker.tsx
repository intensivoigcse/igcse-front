"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleBlock {
  id: string;
  days: string[];
  startTime: string;
  endTime: string;
}

interface SchedulePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const DAYS = [
  { id: "lun", label: "L", fullLabel: "Lunes" },
  { id: "mar", label: "M", fullLabel: "Martes" },
  { id: "mie", label: "X", fullLabel: "Miércoles" },
  { id: "jue", label: "J", fullLabel: "Jueves" },
  { id: "vie", label: "V", fullLabel: "Viernes" },
  { id: "sab", label: "S", fullLabel: "Sábado" },
  { id: "dom", label: "D", fullLabel: "Domingo" },
];

const TIME_OPTIONS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
  "22:00",
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function parseScheduleString(scheduleStr: string): ScheduleBlock[] {
  if (!scheduleStr) return [];
  
  // Try to parse as JSON first (new format)
  try {
    const parsed = JSON.parse(scheduleStr);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Not JSON, try to parse legacy format
  }
  
  // Legacy format: "Lunes y Miércoles 18:00 - 20:00"
  // For backwards compatibility, create a single block from text
  if (scheduleStr.trim()) {
    return [{
      id: generateId(),
      days: [],
      startTime: "18:00",
      endTime: "20:00",
    }];
  }
  
  return [];
}

function formatScheduleToString(blocks: ScheduleBlock[]): string {
  if (blocks.length === 0) return "";
  
  const formattedBlocks = blocks
    .filter(block => block.days.length > 0 && block.startTime && block.endTime)
    .map(block => {
      const dayNames = block.days
        .map(dayId => DAYS.find(d => d.id === dayId)?.fullLabel || dayId)
        .join(", ");
      return `${dayNames}: ${block.startTime} - ${block.endTime}`;
    });
  
  return formattedBlocks.join(" | ");
}

export function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);

  useEffect(() => {
    const parsed = parseScheduleString(value);
    if (parsed.length === 0) {
      // Start with one empty block
      setBlocks([{
        id: generateId(),
        days: [],
        startTime: "",
        endTime: "",
      }]);
    } else {
      setBlocks(parsed);
    }
  }, []);

  const updateBlocks = (newBlocks: ScheduleBlock[]) => {
    setBlocks(newBlocks);
    onChange(formatScheduleToString(newBlocks));
  };

  const toggleDay = (blockId: string, dayId: string) => {
    const newBlocks = blocks.map(block => {
      if (block.id === blockId) {
        const newDays = block.days.includes(dayId)
          ? block.days.filter(d => d !== dayId)
          : [...block.days, dayId];
        return { ...block, days: newDays };
      }
      return block;
    });
    updateBlocks(newBlocks);
  };

  const updateTime = (blockId: string, field: "startTime" | "endTime", value: string) => {
    const newBlocks = blocks.map(block => {
      if (block.id === blockId) {
        return { ...block, [field]: value };
      }
      return block;
    });
    updateBlocks(newBlocks);
  };

  const addBlock = () => {
    const newBlocks = [...blocks, {
      id: generateId(),
      days: [],
      startTime: "",
      endTime: "",
    }];
    setBlocks(newBlocks);
  };

  const removeBlock = (blockId: string) => {
    if (blocks.length <= 1) {
      // Reset the only block instead of removing
      const newBlocks = [{
        id: generateId(),
        days: [],
        startTime: "",
        endTime: "",
      }];
      updateBlocks(newBlocks);
      return;
    }
    const newBlocks = blocks.filter(block => block.id !== blockId);
    updateBlocks(newBlocks);
  };

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <div
          key={block.id}
          className="p-4 rounded-lg border bg-card relative group"
        >
          {blocks.length > 1 && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeBlock(block.id)}
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Days selection */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-2">
              {index === 0 ? "Días de clase" : `Bloque ${index + 1}`}
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(block.id, day.id)}
                  className={cn(
                    "w-9 h-9 rounded-full text-sm font-medium transition-all",
                    "border-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    block.days.includes(day.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-muted hover:border-primary/50 hover:text-foreground"
                  )}
                  title={day.fullLabel}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time selection */}
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={block.startTime}
                onChange={(e) => updateTime(block.id, "startTime", e.target.value)}
                className={cn(
                  "h-9 px-3 rounded-md border bg-background text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <option value="">Inicio</option>
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <span className="text-muted-foreground">—</span>
              <select
                value={block.endTime}
                onChange={(e) => updateTime(block.id, "endTime", e.target.value)}
                className={cn(
                  "h-9 px-3 rounded-md border bg-background text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <option value="">Fin</option>
                {TIME_OPTIONS.filter(time => !block.startTime || time > block.startTime).map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Validation message */}
          {block.startTime && block.endTime && block.startTime >= block.endTime && (
            <p className="text-xs text-destructive mt-2">
              La hora de fin debe ser posterior a la hora de inicio
            </p>
          )}
        </div>
      ))}

      {/* Add block button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addBlock}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        Agregar otro horario
      </Button>

      {/* Preview */}
      {blocks.some(b => b.days.length > 0 && b.startTime && b.endTime) && (
        <div className="p-3 rounded-md bg-muted/50 border">
          <p className="text-xs text-muted-foreground mb-1">Vista previa:</p>
          <p className="text-sm font-medium">
            {formatScheduleToString(blocks)}
          </p>
        </div>
      )}
    </div>
  );
}

