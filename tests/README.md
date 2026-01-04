# Tests E2E - APPaso

## Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar credenciales de prueba (IMPORTANTE)

Los tests que requieren autenticación necesitan credenciales de cuentas reales.

#### Cuentas de prueba ya configuradas

Las siguientes cuentas ya están creadas y configuradas:

| Rol | Email | Password |
|-----|-------|----------|
| Profesor | profesor.test@appaso.com | TestPassword123! |
| Estudiante | estudiante.test@appaso.com | TestPassword123! |

Las credenciales están en `tests/fixtures/auth.ts`


## Ejecutar Tests

### Todos los tests
```bash
npm run test
```

### Con interfaz visual
```bash
npm run test:ui
```

### Con navegador visible
```bash
npm run test:headed
```

### Ver reporte
```bash
npm run test:report
```

### Solo un archivo de tests
```bash
npx playwright test auth.spec.ts
```

### Solo un test específico
```bash
npx playwright test -g "login exitoso"
```

## Estructura de Tests

```
tests/
├── auth.spec.ts          # Login y Signup
├── dashboard.spec.ts     # Dashboard por rol
├── courses.spec.ts       # Gestión de cursos (profesor)
├── enrollment.spec.ts    # Inscripciones (estudiante)
├── assignments.spec.ts   # Entrega de tareas
└── fixtures/
    └── auth.ts           # Helpers de autenticación
```

## Cobertura de Tests

### Autenticación (11 tests)
- Formulario de login
- Login exitoso/fallido
- Validaciones de signup
- Protección de rutas

### Dashboard (10 tests)
- Vista de profesor vs estudiante
- Navegación
- Estados de carga

### Gestión de Cursos (10 tests)
- Crear curso
- Sidebar de gestión
- Secciones del curso

### Inscripciones (10 tests)
- Catálogo de cursos
- Flujo de inscripción
- Estados de inscripción

### Tareas (14 tests)
- Ver tareas
- Entregar tareas
- Validaciones de archivos

**Total: 57 tests**

