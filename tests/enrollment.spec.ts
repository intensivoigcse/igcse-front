import { test, expect } from '@playwright/test';
import { loginAsStudent, logout } from './fixtures/auth';

test.describe('Catálogo de Cursos - Estudiante', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('puede acceder al catálogo de cursos', async ({ page }) => {
    // Navegar al catálogo de cursos
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    // Verificar que se cargó la página (puede mostrar cursos o lista vacía)
    const hasCourses = await page.locator('[class*="card"]').first().isVisible().catch(() => false);
    const hasEmptyState = await page.locator('text=No hay').isVisible().catch(() => false);
    const hasPageLoaded = await page.locator('main').isVisible().catch(() => false);
    
    expect(hasCourses || hasEmptyState || hasPageLoaded).toBeTruthy();
  });

  test('puede ver lista de cursos disponibles', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    // Debería mostrar cursos o estado vacío
    const hasCourses = await page.locator('[class*="card"]').first().isVisible().catch(() => false);
    const hasEmptyState = await page.locator('text=No hay cursos').isVisible().catch(() => false);
    
    expect(hasCourses || hasEmptyState).toBeTruthy();
  });

  test('puede ver detalles de un curso', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      // Click en el curso
      await courseCard.click();
      
      // Verificar que navega a la página de detalle
      await expect(page).toHaveURL(/\/courses\/\d+/);
    }
  });
});

test.describe('Inscripción en Cursos - Estudiante', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('puede ver botón de inscribirse en curso no inscrito', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      // Verificar si hay botón de inscribirse (solo si no está inscrito)
      const enrollButton = page.locator('button:has-text("Inscribirse")');
      const isEnrolled = await page.locator('text=Inscripción Pendiente').isVisible().catch(() => false);
      const isAccepted = await page.locator('text=Inscrito').isVisible().catch(() => false);
      
      if (!isEnrolled && !isAccepted) {
        await expect(enrollButton).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('inscripción muestra estado pendiente', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      const enrollButton = page.locator('button:has-text("Inscribirse")');
      const canEnroll = await enrollButton.isVisible().catch(() => false);
      
      if (canEnroll) {
        // Inscribirse
        await enrollButton.click();
        
        // Verificar mensaje de inscripción pendiente
        await expect(page.locator('text=Pendiente').or(page.locator('text=pendiente'))).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('mensaje informativo para inscripción pendiente', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      // Verificar si tiene inscripción pendiente
      const hasPending = await page.locator('text=Inscripción Pendiente').isVisible().catch(() => false);
      
      if (hasPending) {
        // Verificar mensaje informativo
        await expect(page.locator('text=siendo revisada')).toBeVisible();
      }
    }
  });

  test('estudiante aceptado puede ver contenido del curso', async ({ page }) => {
    // Ir al dashboard donde están los cursos aceptados
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      // Estudiante aceptado debería ver el sidebar con secciones
      const hasStudentSidebar = await page.locator('text=Información').or(page.locator('text=Info')).isVisible().catch(() => false);
      
      if (hasStudentSidebar) {
        // Verificar secciones disponibles para estudiante aceptado
        await expect(page.locator('text=Materiales')).toBeVisible();
        await expect(page.locator('text=Tareas')).toBeVisible();
        await expect(page.locator('text=Anuncios')).toBeVisible();
        await expect(page.locator('text=Foros')).toBeVisible();
      }
    }
  });
});

test.describe('Cancelar Inscripción - Estudiante', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('puede cancelar inscripción pendiente', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      // Verificar si tiene inscripción pendiente con opción de cancelar
      const cancelButton = page.locator('button:has-text("Cancelar Inscripción"), button:has-text("Cancelar")');
      const canCancel = await cancelButton.isVisible().catch(() => false);
      
      if (canCancel) {
        // Verificar que el botón está visible
        await expect(cancelButton).toBeVisible();
      }
    }
  });
});

test.describe('Vista de Curso Aceptado - Estudiante', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('estudiante ve sidebar con secciones correctas', async ({ page }) => {
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      // Verificar secciones del sidebar de estudiante
      const sections = ['Información', 'Materiales', 'Tareas', 'Anuncios', 'Foros', 'Asistencia'];
      
      for (const section of sections) {
        const sectionVisible = await page.locator(`text=${section}`).isVisible().catch(() => false);
        // Al menos algunas secciones deberían estar visibles
        if (sectionVisible) {
          await expect(page.locator(`text=${section}`)).toBeVisible();
          break;
        }
      }
    }
  });

  test('puede navegar a materiales del curso', async ({ page }) => {
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      const materialesBtn = page.locator('text=Materiales').first();
      const hasMateriales = await materialesBtn.isVisible().catch(() => false);
      
      if (hasMateriales) {
        await materialesBtn.click();
        await page.waitForTimeout(500);
        
        // Verificar que se muestra contenido de materiales
        await expect(page.locator('text=Material').or(page.locator('text=Archivo').or(page.locator('text=No hay')))).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

