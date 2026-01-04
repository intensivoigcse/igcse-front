import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Users, Heart, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="grid min-h-[80vh] grid-cols-1 lg:grid-cols-2">
        <div className="flex min-h-[80vh] flex-col items-center justify-center gap-8 p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold">Bienvenido a APPaso</h1>
            <p className="text-muted-foreground max-w-md text-lg">
              Plataforma educativa para gestionar cursos y aprendizaje de manera eficiente
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Crear Cuenta
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-muted relative hidden lg:block">
          <img
            src="/appaso.svg"
            alt="APPaso Logo"
            className="absolute inset-0 m-auto h-3/4 w-3/4 object-contain dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Características Principales</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubre todo lo que APPaso tiene para ofrecerte
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Gestión de Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Crea y gestiona tus cursos de manera sencilla. Organiza el contenido y sigue el progreso de tus estudiantes.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Inscripciones</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Inscríbete en los cursos que te interesen o gestiona las inscripciones de tus estudiantes.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Comunidad</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Conecta con profesores y estudiantes. Aprende y comparte conocimiento en un ambiente colaborativo.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Donaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Apoya nuestra plataforma educativa con donaciones. Tu contribución ayuda a mejorar la educación.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a nuestra comunidad educativa y comienza a aprender o enseñar hoy mismo
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Crear Cuenta Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explorar Cursos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
