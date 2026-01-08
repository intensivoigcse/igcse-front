"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Target, 
  Users, 
  GraduationCap, 
  FileText, 
  Calendar,
  DollarSign,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare
} from "lucide-react";

type TabType = "descripcion" | "programa" | "metodologia" | "profesores" | "recursos" | "valor" | "contacto";

const tabs = [
  { id: "descripcion" as TabType, label: "Descripción", icon: BookOpen },
  { id: "programa" as TabType, label: "Programa", icon: Target },
  { id: "metodologia" as TabType, label: "Metodología", icon: GraduationCap },
  { id: "profesores" as TabType, label: "Profesores", icon: Users },
  { id: "recursos" as TabType, label: "Recursos", icon: FileText },
  { id: "valor" as TabType, label: "Valor y Pagos", icon: DollarSign },
  { id: "contacto" as TabType, label: "Contacto", icon: Phone },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("descripcion");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  const scrollToTabs = () => {
    const tabsSection = document.getElementById("tabs-section");
    tabsSection?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!logoRef.current) return;
      
      const rect = logoRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      
      // Limitar la distancia máxima (60px)
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 80;
      
      if (distance > maxDistance) {
        const angle = Math.atan2(deltaY, deltaX);
        setMousePosition({
          x: Math.cos(angle) * maxDistance,
          y: Math.sin(angle) * maxDistance,
        });
      } else {
        setMousePosition({ x: deltaX, y: deltaY });
      }
    };

    if (isHovering) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    } else {
      // Resetear posición cuando no está hover
      setMousePosition({ x: 0, y: 0 });
    }
  }, [isHovering]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "descripcion":
  return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Descripción del Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  El curso es teórico-práctico, donde nuestros tutores, experimentados en materia iGCSE, 
                  transmitirán los contenidos listados a continuación además de las técnicas de memoria y de 
                  aplicación a los distintos formatos de pregunta impartidos por Cambridge.
                </p>
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <h3 className="font-semibold mb-2 text-primary">Enfoque del Programa</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Preparación integral para exámenes iGCSE de Cambridge</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Técnicas de memoria y aplicación práctica</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Formato de preguntas según estándares Cambridge</span>
                    </li>
                  </ul>
          </div>
              </CardContent>
            </Card>
          </div>
        );

      case "programa":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  Metas de Aprendizaje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">A. Contenidos Teóricos</h3>
                  <p className="text-muted-foreground mb-4">
                    Las asignaturas de Biología (0610), Química (0620), Física (0625) y Matemáticas (0580), 
                    como están descritas en sus respectivos syllabus de Cambridge (enviados por separado), por completo.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Biología (0610)", "Química (0620)", "Física (0625)", "Matemáticas (0580)"].map((subject) => (
                      <div key={subject} className="bg-muted p-3 rounded-lg text-center text-sm font-medium">
                        {subject}
        </div>
                    ))}
        </div>
      </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">B. Contenidos Prácticos</h3>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">1. Aplicación de los contenidos a las pruebas</h4>
                      <p className="text-sm text-muted-foreground">
                        Muchos alumnos pierden puntos y bajan sus notas a pesar de saber lo que les preguntan. 
                        Les enseñaremos a usar y expresar la información que les entregamos en el contexto de una evaluación.
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">2. Métodos de estudio</h4>
                      <p className="text-sm text-muted-foreground">
                        Buscamos equipar a nuestros alumnos con la mayor cantidad de herramientas para enfrentar 
                        una jornada de estudio en solitario, que sepan dónde enfocar su tiempo para maximizar 
                        su aprendizaje y sus resultados.
          </p>
        </div>
                  </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  Estructura General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    A. Sesiones Presenciales
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    2 sesiones a la semana, divididas en:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                      <h4 className="font-semibold mb-2">Sesión 1</h4>
                      <p className="text-sm text-muted-foreground">Física y Matemáticas</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                      <h4 className="font-semibold mb-2">Sesión 2</h4>
                      <p className="text-sm text-muted-foreground">Química y Biología</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Cada una de las sesiones dura aproximadamente <strong>2 horas</strong>.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    B. Sesiones Online
                  </h3>
                  <p className="text-muted-foreground">
                    1 vez a la semana, posterior a las sesiones presenciales, se abrirá este espacio para 
                    resolver las dudas que tengan nuestros alumnos con respecto a la materia vista durante 
                    el transcurso de estas.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    C. Manejo de Tiempos
                  </h3>
                  <p className="text-muted-foreground">
                    Entendemos que nuestros alumnos pueden tener eventos extracurriculares deportivos o de otra 
                    naturaleza. Nuestro compromiso es manejar la planificación de las sesiones con anticipación 
                    para evitar cruces de horario, siempre comunicándonos con los apoderados a través de 
                    WhatsApp y/o email.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    D. Grupos
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Los grupos se definirán una vez que contemos con la confirmación de los alumnos inscritos. 
                    Para su conformación, se considerarán los siguientes criterios:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-1">Ubicación</h4>
                        <p className="text-sm text-muted-foreground">
                          Se priorizará agrupar a los alumnos que vivan cerca, con el fin de facilitar el transporte.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-1">Horarios</h4>
                        <p className="text-sm text-muted-foreground">
                          Los horarios también se definirán una vez confirmados los alumnos. Se enviará un formulario 
                          para recopilar la disponibilidad de cada participante, lo que permitirá organizar los horarios 
                          de manera óptima. Sin perjuicio de lo anterior, estaremos apuntando a clases después de las 
                          <strong> 18:00 hrs</strong> (horario en el que terminan las actividades extracurriculares del colegio) entre semana.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "metodologia":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Metodología de Enseñanza</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Enfoque en &ldquo;Key Words&rdquo;</h3>
                  <p className="text-muted-foreground mb-4">
                    Para reforzar los contenidos, se hará énfasis en los <strong>&ldquo;key words&rdquo;</strong>. 
                    El motivo de esto, es que son estas las palabras que otorgan puntaje en las pruebas escritas.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Proceso de Aprendizaje</h3>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">1. Trabajo en Grupo</h4>
                      <p className="text-sm text-muted-foreground">
                        En base a las clases, responderemos preguntas como grupo, tratando de abordar los distintos 
                        formatos y analizando las diversas formas en las que la misma materia puede ser preguntada.
                      </p>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">2. Guías de Estudio</h4>
                      <p className="text-sm text-muted-foreground">
                        Luego de esto cada alumno recibirá una corta guía para completar antes de la siguiente clase. 
                        Esta guía será corregida entre pares, para lo que usarán las pautas oficiales de las preguntas, 
                        consiguiendo así familiarizarse con el proceso de corrección, entregándoles la ventaja de 
                        entender lo que se les pide saber.
                      </p>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">3. Proactividad y Resolución de Dudas</h4>
                      <p className="text-sm text-muted-foreground">
                        El objetivo de las presentaciones será, siempre, abordar la materia de la forma más efectiva 
                        posible. Será fundamental la proactividad de nuestros alumnos en el estudio personal para poder 
                        despejar todas las dudas que puedan tener durante la clase e, incluso, posterior a estas. 
                        Para enfrentar este último punto, usaremos nuestra sesión online separada de las demás clases, 
                        donde despejaremos dudas y daremos por cerrados los temas uno a uno.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
              </div>
        );

      case "profesores":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Nuestro Equipo de Tutores
                </CardTitle>
            </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Ya contamos con un equipo de tutores cuya asignación final dependerá de los horarios que se 
                  coordinen con los alumnos. Todos los tutores son exalumnos del colegio, lo que garantiza que 
                  tienen experiencia directa tanto con la prueba como con las estrategias necesarias para 
                  enfrentarla de manera efectiva.
                </p>
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <h3 className="font-semibold mb-2 text-primary">Ventajas de Nuestros Tutores</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Exalumnos del colegio con experiencia directa en las pruebas iGCSE</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Conocimiento profundo de las estrategias necesarias para enfrentar los exámenes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Experiencia práctica con los formatos de pregunta de Cambridge</span>
                    </li>
                  </ul>
                </div>
            </CardContent>
          </Card>
          </div>
        );

      case "recursos":
        return (
          <div className="space-y-6">
          <Card>
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Recursos del Programa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Esperamos entregar a los alumnos las siguientes herramientas:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-5 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">A. Guías de Contenido</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Entregada semanalmente. En ellas se encontrará la materia que desde nuestra experiencia 
                      creemos que es lo más importante que sepan los alumnos.
                    </p>
                  </div>

                  <div className="bg-muted/50 p-5 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">B. Guía de Ejercicios</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Entregada semanalmente. Resuelta por los alumnos en su tiempo libre. Contará con la 
                      sesión online para resolver dudas.
                    </p>
                  </div>

                  <div className="bg-muted/50 p-5 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">C. Calendario</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Calendario con los contenidos que se verán cada semana.
                    </p>
                  </div>

                  <div className="bg-muted/50 p-5 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">D. Proyectores</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Esperamos poder contar con estos dispositivos para facilitar el trabajo de los tutores.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
              </div>
        );

      case "valor":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <DollarSign className="h-6 w-6" />
                  Valor del Programa
                </CardTitle>
            </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-primary/10 p-6 rounded-lg border-2 border-primary">
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-primary mb-2">$60.000 CLP</p>
                    <p className="text-muted-foreground">por semana</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Desglose del Valor</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">Valor por hora de clase</span>
                      <span className="font-semibold">$12.500 CLP</span>
                    </div>
                    <div className="text-sm text-muted-foreground italic pl-3">
                      Para contextualizar, una clase particular cuesta $25.000 CLP la hora. Si bien la clase 
                      particular es personal, el programa incluye material desarrollado por nuestro equipo y un 
                      plan estructurado a mediano plazo con los contenidos a cubrir.
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Composición Semanal</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span>4 horas presenciales (4 × $12.500)</span>
                      <span className="font-semibold">$50.000 CLP</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span>1 hora online ($5.000/hora)</span>
                      <span className="font-semibold">$5.000 CLP</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span>Materiales del curso</span>
                      <span className="font-semibold">$5.000 CLP</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border border-primary/20 mt-4">
                      <span className="font-semibold">Total semanal</span>
                      <span className="font-bold text-lg text-primary">$60.000 CLP</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Opción de Módulos Individuales</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Los alumnos que requieren solo de un módulo (sólo biología y química o solo matemáticas y física) 
                    podrán hacerlo, valorizado de igual manera.
                  </p>
                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <p className="text-center">
                      <span className="font-bold text-lg text-primary">$35.000 CLP</span>
                      <span className="text-muted-foreground"> por semana (módulo individual)</span>
                    </p>
                  </div>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Sistema de Pagos</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">
                  Antes del inicio del programa, se enviará un calendario preliminar con las semanas en las que 
                  se impartirán clases. El pago correspondiente a las clases de un mes, se solicitará al final 
                  del mes anterior.
                </p>
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <h4 className="font-semibold mb-2 text-primary">Ejemplo</h4>
                  <p className="text-sm text-muted-foreground">
                    El pago de las clases de septiembre se solicitará a fines de agosto.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "contacto":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Phone className="h-6 w-6" />
                  Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Ante cualquier duda o sugerencia por favor ponerse en contacto con nosotros.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <a
                    href="https://wa.me/56992263294"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-50 dark:bg-green-950/20 p-6 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h3 className="font-semibold">Tomás</h3>
                    </div>
                    <p className="text-green-700 dark:text-green-300 font-medium">
                      +56 9 9226 3294
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Click para abrir WhatsApp
                    </p>
                  </a>

                  <a
                    href="https://wa.me/56995458311"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-50 dark:bg-green-950/20 p-6 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h3 className="font-semibold">Matías</h3>
                    </div>
                    <p className="text-green-700 dark:text-green-300 font-medium">
                      +56 9 9545 8311
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Click para abrir WhatsApp
                    </p>
                  </a>
                </div>

                <a
                  href="mailto:intensivoigcse@gmail.com"
                  className="bg-primary/5 p-6 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors block"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Email</h3>
                  </div>
                  <p className="text-primary font-medium">
                    intensivoigcse@gmail.com
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click para enviar un email
                  </p>
                </a>
            </CardContent>
          </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <section className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div 
              ref={logoRef}
              className="relative transition-transform duration-300 ease-out"
              style={{
                transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
              }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <img
                src="/logo.jpg"
                alt="Intensivo IGCSE B&N Logo"
                className="w-48 h-48 md:w-64 md:h-64 object-contain transition-transform duration-300 ease-out"
                style={{ 
                  maxWidth: "100%", 
                  height: "auto",
                  transform: isHovering ? "scale(1.1)" : "scale(1)",
                }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (img.src.includes("logo.jpg") && !img.src.includes("logo-copy")) {
                    img.src = "/logo-copy.jpg";
                  } else {
                    console.error("Logo image failed to load");
                    img.style.display = "none";
                  }
                }}
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Intensivo IGCSE B&N
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Preparación iGCSE - Curso teórico-práctico con tutores experimentados
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                Inscribirse
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-lg px-8"
              onClick={scrollToTabs}
            >
              Ver Programa
            </Button>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section id="tabs-section" className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Tabs Navigation */}
        <div className="border-b mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-medium transition-all
                    border-b-2 whitespace-nowrap
                    ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-muted py-16 mt-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-muted-foreground mb-8">
            Únete a nuestro programa de preparación iGCSE y alcanza tus metas académicas
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Inscribirse Ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
