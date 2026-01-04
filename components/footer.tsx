import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">APPaso</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Plataforma educativa para gestionar cursos y aprendizaje de manera eficiente.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">Enlaces</h3>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Inicio
              </Link>
              <Link href="/courses" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Cursos
              </Link>
              <Link href="/donations" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Donaciones
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">Contacto</h3>
            <p className="text-muted-foreground text-sm">
              ¿Tienes preguntas? Contáctanos a través de nuestro soporte.
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} APPaso. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

