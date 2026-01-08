// Mock data for course management - "Álgebra para Primero Medio"

export interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentDate: string;
  progress: number;
  lastActive: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: "homework" | "quiz" | "project" | "exam";
  dueDate: string;
  points: number;
  status: "published" | "draft";
  submissions: number;
  totalStudents: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "normal" | "important" | "urgent";
  isPinned: boolean;
  createdAt: string;
  author: string;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  replies: ForumReply[];
  views: number;
}

export interface ForumReply {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: "enrollment" | "assignment" | "announcement" | "forum";
  description: string;
  timestamp: string;
  user?: string;
}

// Mock Students Data
export const mockStudents: Student[] = [
  {
    id: "std-1",
    name: "María González",
    email: "maria.gonzalez@estudiante.cl",
    enrollmentDate: "2024-03-01",
    progress: 85,
    lastActive: "2024-11-08"
  },
  {
    id: "std-2",
    name: "Juan Pérez",
    email: "juan.perez@estudiante.cl",
    enrollmentDate: "2024-03-02",
    progress: 72,
    lastActive: "2024-11-07"
  },
  {
    id: "std-3",
    name: "Sofía Ramírez",
    email: "sofia.ramirez@estudiante.cl",
    enrollmentDate: "2024-03-01",
    progress: 91,
    lastActive: "2024-11-09"
  },
  {
    id: "std-4",
    name: "Diego Torres",
    email: "diego.torres@estudiante.cl",
    enrollmentDate: "2024-03-03",
    progress: 68,
    lastActive: "2024-11-06"
  },
  {
    id: "std-5",
    name: "Valentina Silva",
    email: "valentina.silva@estudiante.cl",
    enrollmentDate: "2024-03-02",
    progress: 88,
    lastActive: "2024-11-09"
  },
  {
    id: "std-6",
    name: "Matías Fernández",
    email: "matias.fernandez@estudiante.cl",
    enrollmentDate: "2024-03-04",
    progress: 76,
    lastActive: "2024-11-08"
  },
  {
    id: "std-7",
    name: "Isidora Muñoz",
    email: "isidora.munoz@estudiante.cl",
    enrollmentDate: "2024-03-01",
    progress: 94,
    lastActive: "2024-11-09"
  },
  {
    id: "std-8",
    name: "Benjamín Vargas",
    email: "benjamin.vargas@estudiante.cl",
    enrollmentDate: "2024-03-05",
    progress: 65,
    lastActive: "2024-11-05"
  },
  {
    id: "std-9",
    name: "Catalina Rojas",
    email: "catalina.rojas@estudiante.cl",
    enrollmentDate: "2024-03-03",
    progress: 82,
    lastActive: "2024-11-08"
  },
  {
    id: "std-10",
    name: "Tomás Soto",
    email: "tomas.soto@estudiante.cl",
    enrollmentDate: "2024-03-02",
    progress: 79,
    lastActive: "2024-11-07"
  },
  {
    id: "std-11",
    name: "Martina Castro",
    email: "martina.castro@estudiante.cl",
    enrollmentDate: "2024-03-06",
    progress: 87,
    lastActive: "2024-11-09"
  },
  {
    id: "std-12",
    name: "Lucas Morales",
    email: "lucas.morales@estudiante.cl",
    enrollmentDate: "2024-03-04",
    progress: 71,
    lastActive: "2024-11-06"
  },
  {
    id: "std-13",
    name: "Florencia Díaz",
    email: "florencia.diaz@estudiante.cl",
    enrollmentDate: "2024-03-01",
    progress: 90,
    lastActive: "2024-11-09"
  },
  {
    id: "std-14",
    name: "Agustín Herrera",
    email: "agustin.herrera@estudiante.cl",
    enrollmentDate: "2024-03-07",
    progress: 73,
    lastActive: "2024-11-08"
  },
  {
    id: "std-15",
    name: "Emilia Campos",
    email: "emilia.campos@estudiante.cl",
    enrollmentDate: "2024-03-02",
    progress: 84,
    lastActive: "2024-11-09"
  },
  {
    id: "std-16",
    name: "Sebastián Vega",
    email: "sebastian.vega@estudiante.cl",
    enrollmentDate: "2024-03-05",
    progress: 77,
    lastActive: "2024-11-07"
  },
  {
    id: "std-17",
    name: "Amanda Ortiz",
    email: "amanda.ortiz@estudiante.cl",
    enrollmentDate: "2024-03-03",
    progress: 89,
    lastActive: "2024-11-09"
  },
  {
    id: "std-18",
    name: "Vicente Parra",
    email: "vicente.parra@estudiante.cl",
    enrollmentDate: "2024-03-08",
    progress: 70,
    lastActive: "2024-11-06"
  }
];

// Mock Assignments Data
export const mockAssignments: Assignment[] = [
  {
    id: "asg-1",
    title: "Ecuaciones Lineales - Ejercicios Básicos",
    description: "Resolver 15 ecuaciones lineales de una variable. Mostrar todo el desarrollo paso a paso.",
    type: "homework",
    dueDate: "2024-11-15",
    points: 20,
    status: "published",
    submissions: 15,
    totalStudents: 18
  },
  {
    id: "asg-2",
    title: "Quiz: Propiedades de los Números Reales",
    description: "Evaluación de 10 preguntas sobre propiedades asociativa, conmutativa y distributiva.",
    type: "quiz",
    dueDate: "2024-11-12",
    points: 15,
    status: "published",
    submissions: 18,
    totalStudents: 18
  },
  {
    id: "asg-3",
    title: "Proyecto: Aplicaciones del Álgebra en la Vida Real",
    description: "Investigar y presentar tres casos donde el álgebra se usa en situaciones cotidianas. Incluir ejemplos con ecuaciones.",
    type: "project",
    dueDate: "2024-11-25",
    points: 40,
    status: "published",
    submissions: 8,
    totalStudents: 18
  },
  {
    id: "asg-4",
    title: "Sistemas de Ecuaciones - Método de Sustitución",
    description: "Resolver 8 sistemas de ecuaciones usando el método de sustitución.",
    type: "homework",
    dueDate: "2024-11-20",
    points: 25,
    status: "published",
    submissions: 12,
    totalStudents: 18
  },
  {
    id: "asg-5",
    title: "Factorización de Polinomios",
    description: "Factorizar 12 expresiones algebraicas usando diferentes técnicas (factor común, trinomios, diferencia de cuadrados).",
    type: "homework",
    dueDate: "2024-11-18",
    points: 20,
    status: "draft",
    submissions: 0,
    totalStudents: 18
  },
  {
    id: "asg-6",
    title: "Examen Parcial: Unidad 1 y 2",
    description: "Evaluación comprehensiva de ecuaciones lineales, sistemas y propiedades algebraicas.",
    type: "exam",
    dueDate: "2024-11-30",
    points: 50,
    status: "draft",
    submissions: 0,
    totalStudents: 18
  },
  {
    id: "asg-7",
    title: "Problemas de Aplicación: Edad y Distancia",
    description: "Resolver 6 problemas de aplicación relacionados con edad, distancia y tiempo usando ecuaciones.",
    type: "homework",
    dueDate: "2024-11-22",
    points: 20,
    status: "published",
    submissions: 10,
    totalStudents: 18
  }
];

// Mock Announcements Data
export const mockAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    title: "¡Bienvenidos al curso de Álgebra!",
    content: "Estimados estudiantes, les doy la bienvenida a este curso de Álgebra para Primero Medio. Espero que disfruten el aprendizaje y no duden en hacer preguntas.",
    priority: "normal",
    isPinned: true,
    createdAt: "2024-03-01",
    author: "Prof. Ana María López"
  },
  {
    id: "ann-2",
    title: "Cambio de horario - Clase del viernes",
    content: "La clase del viernes 15 de noviembre se adelantará a las 10:00 AM en lugar de las 14:00 PM. Por favor tomen nota.",
    priority: "important",
    isPinned: true,
    createdAt: "2024-11-05",
    author: "Prof. Ana María López"
  },
  {
    id: "ann-3",
    title: "Recursos adicionales disponibles",
    content: "He subido videos tutoriales sobre ecuaciones lineales en la sección de materiales. Los pueden revisar en cualquier momento para reforzar los conceptos.",
    priority: "normal",
    isPinned: false,
    createdAt: "2024-11-03",
    author: "Prof. Ana María López"
  },
  {
    id: "ann-4",
    title: "IMPORTANTE: Examen Parcial - 30 de Noviembre",
    content: "El examen parcial cubrirá todas las unidades vistas hasta la fecha. Repasen ecuaciones lineales, sistemas de ecuaciones y factorización. Tendrán 90 minutos para completarlo.",
    priority: "urgent",
    isPinned: true,
    createdAt: "2024-11-07",
    author: "Prof. Ana María López"
  },
  {
    id: "ann-5",
    title: "Sesión de consultas extraordinaria",
    content: "El miércoles 13 de noviembre tendré una sesión de consultas de 16:00 a 18:00 en la sala 205 para resolver dudas sobre sistemas de ecuaciones.",
    priority: "normal",
    isPinned: false,
    createdAt: "2024-11-08",
    author: "Prof. Ana María López"
  },
  {
    id: "ann-6",
    title: "Felicitaciones por el progreso",
    content: "Quiero felicitarlos por el excelente desempeño en el último quiz. El promedio del curso fue de 85%, sigan así!",
    priority: "normal",
    isPinned: false,
    createdAt: "2024-11-06",
    author: "Prof. Ana María López"
  },
  {
    id: "ann-7",
    title: "Material complementario: Khan Academy",
    content: "Les recomiendo los videos de Khan Academy sobre álgebra. Son un excelente complemento para el curso y están en español.",
    priority: "normal",
    isPinned: false,
    createdAt: "2024-11-02",
    author: "Prof. Ana María López"
  },
  {
    id: "ann-8",
    title: "Extensión de plazo: Proyecto de aplicaciones",
    content: "Debido a las consultas recibidas, extenderé el plazo del proyecto hasta el 28 de noviembre. Aprovechen el tiempo extra para mejorar sus trabajos.",
    priority: "important",
    isPinned: false,
    createdAt: "2024-11-09",
    author: "Prof. Ana María López"
  }
];

// Mock Forum Threads Data
export const mockForumThreads: ForumThread[] = [
  {
    id: "thread-1",
    title: "¿Cómo identificar qué método usar en sistemas de ecuaciones?",
    content: "Hola, tengo dudas sobre cuándo usar sustitución vs eliminación en sistemas de ecuaciones. ¿Alguien me puede ayudar?",
    author: "María González",
    category: "Dudas",
    isPinned: false,
    isLocked: false,
    createdAt: "2024-11-07",
    views: 23,
    replies: [
      {
        id: "reply-1-1",
        content: "Yo uso sustitución cuando una variable ya está despejada o es fácil de despejar. Es más directo en esos casos.",
        author: "Sofía Ramírez",
        createdAt: "2024-11-07"
      },
      {
        id: "reply-1-2",
        content: "El método de eliminación es mejor cuando los coeficientes son múltiplos entre sí. Por ejemplo, si tienes 2x y 4x en las ecuaciones.",
        author: "Juan Pérez",
        createdAt: "2024-11-07"
      },
      {
        id: "reply-1-3",
        content: "Excelentes respuestas. En general, ambos métodos funcionan siempre, pero como mencionan, algunos son más eficientes según el caso. Con práctica aprenderán a identificar cuál conviene más.",
        author: "Prof. Ana María López",
        createdAt: "2024-11-08"
      }
    ]
  },
  {
    id: "thread-2",
    title: "Recursos recomendados para practicar factorización",
    content: "¿Conocen páginas web o apps donde pueda practicar más ejercicios de factorización? Quiero reforzar antes del examen.",
    author: "Diego Torres",
    category: "Recursos",
    isPinned: true,
    isLocked: false,
    createdAt: "2024-11-06",
    views: 31,
    replies: [
      {
        id: "reply-2-1",
        content: "Khan Academy tiene muchos ejercicios interactivos de factorización. Te los recomiendo mucho!",
        author: "Isidora Muñoz",
        createdAt: "2024-11-06"
      },
      {
        id: "reply-2-2",
        content: "Yo uso Photomath para verificar mis respuestas y ver el paso a paso. Es muy útil.",
        author: "Valentina Silva",
        createdAt: "2024-11-06"
      },
      {
        id: "reply-2-3",
        content: "También pueden revisar los ejercicios del libro guía, páginas 145-160. Tienen la solución al final.",
        author: "Prof. Ana María López",
        createdAt: "2024-11-07"
      }
    ]
  },
  {
    id: "thread-3",
    title: "Error en ejercicio 7 de la tarea",
    content: "Creo que hay un error en el ejercicio 7 de la tarea de ecuaciones lineales. El resultado que obtengo no coincide con ninguna opción.",
    author: "Matías Fernández",
    category: "Dudas",
    isPinned: false,
    isLocked: false,
    createdAt: "2024-11-08",
    views: 18,
    replies: [
      {
        id: "reply-3-1",
        content: "Yo también tuve problemas con ese. ¿Qué resultado te dio?",
        author: "Lucas Morales",
        createdAt: "2024-11-08"
      },
      {
        id: "reply-3-2",
        content: "Revisé el ejercicio 7 y tienen razón, había un error en el enunciado. Ya lo corregí. La ecuación correcta es 3x - 5 = 16. Disculpen la confusión.",
        author: "Prof. Ana María López",
        createdAt: "2024-11-08"
      }
    ]
  },
  {
    id: "thread-4",
    title: "Guía de estudio para el examen parcial",
    content: "¿Alguien está preparando una guía de estudio colaborativa para el examen? Podríamos trabajar juntos.",
    author: "Catalina Rojas",
    category: "Estudio",
    isPinned: true,
    isLocked: false,
    createdAt: "2024-11-09",
    views: 15,
    replies: [
      {
        id: "reply-4-1",
        content: "Me sumo! Podríamos hacer un Google Doc compartido con resúmenes de cada tema.",
        author: "Florencia Díaz",
        createdAt: "2024-11-09"
      },
      {
        id: "reply-4-2",
        content: "Buena idea! Yo puedo aportar con los resúmenes de sistemas de ecuaciones.",
        author: "Martina Castro",
        createdAt: "2024-11-09"
      },
      {
        id: "reply-4-3",
        content: "Excelente iniciativa. El trabajo colaborativo es muy valioso. Si necesitan que revise algo, me avisan.",
        author: "Prof. Ana María López",
        createdAt: "2024-11-09"
      }
    ]
  },
  {
    id: "thread-5",
    title: "Consulta sobre el proyecto final",
    content: "Para el proyecto de aplicaciones del álgebra, ¿podemos trabajar en parejas o debe ser individual?",
    author: "Tomás Soto",
    category: "Proyectos",
    isPinned: false,
    isLocked: true,
    createdAt: "2024-11-04",
    views: 27,
    replies: [
      {
        id: "reply-5-1",
        content: "El proyecto es individual, pero pueden discutir ideas entre ustedes. La entrega y presentación debe ser personal.",
        author: "Prof. Ana María López",
        createdAt: "2024-11-04"
      }
    ]
  }
];

// Mock Activity Feed Data
export const mockActivities: Activity[] = [
  {
    id: "act-1",
    type: "enrollment",
    description: "Vicente Parra se inscribió en el curso",
    timestamp: "2024-11-08T10:30:00",
    user: "Vicente Parra"
  },
  {
    id: "act-2",
    type: "assignment",
    description: "15 estudiantes entregaron la tarea de Ecuaciones Lineales",
    timestamp: "2024-11-08T09:15:00"
  },
  {
    id: "act-3",
    type: "forum",
    description: "Nueva discusión: Guía de estudio para el examen parcial",
    timestamp: "2024-11-09T14:20:00",
    user: "Catalina Rojas"
  },
  {
    id: "act-4",
    type: "announcement",
    description: "Nuevo anuncio: Extensión de plazo del proyecto",
    timestamp: "2024-11-09T08:00:00",
    user: "Prof. Ana María López"
  },
  {
    id: "act-5",
    type: "assignment",
    description: "Nueva tarea publicada: Problemas de Aplicación",
    timestamp: "2024-11-08T16:45:00"
  },
  {
    id: "act-6",
    type: "forum",
    description: "Prof. Ana María López respondió en el foro",
    timestamp: "2024-11-08T11:30:00",
    user: "Prof. Ana María López"
  },
  {
    id: "act-7",
    type: "enrollment",
    description: "Agustín Herrera se inscribió en el curso",
    timestamp: "2024-11-07T13:20:00",
    user: "Agustín Herrera"
  },
  {
    id: "act-8",
    type: "announcement",
    description: "Nuevo anuncio: IMPORTANTE - Examen Parcial",
    timestamp: "2024-11-07T10:00:00",
    user: "Prof. Ana María López"
  }
];

// Helper function to get course statistics
export const getCourseStats = () => {
  const totalStudents = mockStudents.length;
  const publishedAssignments = mockAssignments.filter(a => a.status === "published").length;
  const totalAnnouncements = mockAnnouncements.length;
  const activeThreads = mockForumThreads.filter(t => !t.isLocked).length;
  const averageProgress = Math.round(
    mockStudents.reduce((sum, s) => sum + s.progress, 0) / totalStudents
  );
  
  return {
    totalStudents,
    publishedAssignments,
    totalAnnouncements,
    activeThreads,
    averageProgress
  };
};

// Backend Assignment interface (from API)
export interface BackendAssignment {
  assignment_id: number;
  course_id: number;
  title: string;
  description?: string;
  maxScore?: number;
  due_date: string;
  createdAt?: string;
  updatedAt?: string;
}

// Normalize backend assignment to frontend Assignment format
export function normalizeAssignment(backend: BackendAssignment): Assignment {
  return {
    id: backend.assignment_id.toString(),
    title: backend.title,
    description: backend.description || "",
    type: "homework", // Default value, not in API
    dueDate: backend.due_date,
    points: backend.maxScore || 100,
    status: "published", // Default value, not in API
    submissions: 0, // Default value, not in API
    totalStudents: 0, // Default value, not in API
  };
}

// Convert frontend Assignment to backend format for API requests
export function assignmentToBackendFormat(
  assignment: Partial<Assignment>,
  courseId: string | number
): Partial<BackendAssignment> {
  const backend: Partial<BackendAssignment> = {
    course_id: typeof courseId === "string" ? parseInt(courseId) : courseId,
    title: assignment.title,
  };

  if (assignment.description !== undefined) {
    backend.description = assignment.description;
  }

  if (assignment.points !== undefined) {
    backend.maxScore = assignment.points;
  }

  if (assignment.dueDate) {
    // Convert to ISO string format
    // If dueDate is in YYYY-MM-DD format (from input type="date"), create date at local midnight
    // then convert to ISO string
    const dateStr = assignment.dueDate;
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Format YYYY-MM-DD from input type="date"
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      backend.due_date = date.toISOString();
    } else {
      // Already in ISO format or other format
      const date = new Date(dateStr);
      backend.due_date = date.toISOString();
    }
  }

  return backend;
}

