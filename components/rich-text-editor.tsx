"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minLength?: number;
  disabled?: boolean;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minLength,
  disabled,
  className
}: RichTextEditorProps) {
  const [charCount, setCharCount] = useState(value.length);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCharCount(newValue.length);
    onChange(newValue);
  };

  const showCharCount = minLength && minLength > 0;
  const isValid = !minLength || charCount >= minLength;

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y",
          className
        )}
      />
      {showCharCount && (
        <div className={cn(
          "text-xs text-right",
          isValid ? "text-muted-foreground" : "text-destructive"
        )}>
          {charCount} / {minLength} caracteres {isValid ? "✓" : "(mínimo requerido)"}
        </div>
      )}
    </div>
  );
}

