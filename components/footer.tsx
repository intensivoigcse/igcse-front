"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/logo.jpg"
                alt="Intensivo IGCSE B&N Logo"
                className="h-6 w-6 object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (img.src.includes("logo.jpg") && !img.src.includes("logo-copy")) {
                    img.src = "/logo-copy.jpg";
                  } else {
                    img.style.display = "none";
                  }
                }}
              />
              <span className="text-lg font-bold">Intensivo IGCSE B&N</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Curso teórico-práctico de preparación para iGCSE con tutores experimentados.
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">Contacto</h3>
            <div className="flex flex-col gap-2 text-sm">
              <a href="mailto:intensivoigcse@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                intensivoigcse@gmail.com
              </a>
              <a href="https://wa.me/56992263294" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                Tomás: +56 9 9226 3294
              </a>
              <a href="https://wa.me/56995458311" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                Matías: +56 9 9545 8311
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Intensivo IGCSE B&N. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

