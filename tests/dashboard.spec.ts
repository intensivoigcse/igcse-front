import { test, expect } from '@playwright/test';
import { loginAsProfessor, loginAsStudent, logout, TEST_PROFESSOR, TEST_STUDENT } from './fixtures/auth';

test.describe('Dashboard - Vista de Profesor', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProfessor(page);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('muestra título "Mis Cursos" para profesor', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Mis Cursos');
  });

  test('muestra descripción correcta para profesor', async ({ page }) => {
    await expect(page.locator('text=Gestiona los cursos que impartes')).toBeVisible();
  });

  test('muestra botón "Crear Curso" para profesor', async ({ page }) => {
    await expect(page.locator('button:has-text("Crear Curso")')).toBeVisible();
  });

  test('abre diálogo de crear curso al hacer click', async ({ page }) => {
    // Click en botón crear curso
    await page.click('button:has-text("Crear Curso")');
    
    // Verificar que se abre el diálogo
    await expect(page.locator('[role="dialog"], .fixed')).toBeVisible({ timeout: 3000 });
  });

  test('muestra cursos del profesor o estado vacío', async ({ page }) => {
    // Esperar a que cargue
    await page.waitForLoadState('networkidle');
    
    // Debería mostrar cursos o el estado vacío
    const hasCourses = await page.locator('.grid').isVisible().catch(() => false);
    const hasEmptyState = await page.locator('text=No tienes cursos creados aún').isVisible().catch(() => false);
    
    expect(hasCourses || hasEmptyState).toBeTruthy();
  });
});

test.describe('Dashboard - Vista de Estudiante', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('muestra título "Mis Inscripciones" para estudiante', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Mis Inscripciones');
  });

  test('muestra descripción correcta para estudiante', async ({ page }) => {
    await expect(page.locator('text=Cursos en los que estás inscrito')).toBeVisible();
  });

  test('NO muestra botón "Crear Curso" para estudiante', async ({ page }) => {
    await expect(page.locator('button:has-text("Crear Curso")')).not.toBeVisible();
  });

  test('muestra cursos inscritos o estado vacío', async ({ page }) => {
    // Esperar a que cargue
    await page.waitForLoadState('networkidle');
    
    // Debería mostrar cursos o el estado vacío
    const hasCourses = await page.locator('.grid').isVisible().catch(() => false);
    const hasEmptyState = await page.locator('text=No estás inscrito en ningún curso').isVisible().catch(() => false);
    
    expect(hasCourses || hasEmptyState).toBeTruthy();
  });

  test('estado vacío tiene botón para explorar cursos', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const hasEmptyState = await page.locator('text=No estás inscrito en ningún curso').isVisible().catch(() => false);
    
    if (hasEmptyState) {
      await expect(page.locator('button:has-text("Explorar Cursos")')).toBeVisible();
    }
  });
});

test.describe('Dashboard - Navegación', () => {
  test('click en curso navega a detalle del curso', async ({ page }) => {
    await loginAsProfessor(page);
    await page.waitForLoadState('networkidle');
    
    // Verificar si hay cursos
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      // Obtener el link del curso
      const courseLink = courseCard.locator('a').first();
      await courseLink.click();
      
      // Verificar que navegó a la página del curso
      await expect(page).toHaveURL(/\/courses\/\d+/);
    }
  });
});

test.describe('Dashboard - Estados de carga', () => {
  test('muestra spinner de carga inicialmente', async ({ page }) => {
    // Interceptar petición para hacerla más lenta
    await page.route('/api/courses/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });
    
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_PROFESSOR.email);
    await page.fill('input[type="password"]', TEST_PROFESSOR.password);
    await page.click('button[type="submit"]');
    
    // Debería mostrar el spinner mientras carga
    await expect(page.locator('text=Cargando cursos...')).toBeVisible({ timeout: 3000 });
  });

  test('muestra mensaje de error cuando falla la carga', async ({ page }) => {
    // Interceptar petición y simular error
    await page.route('/api/courses/professor', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Error del servidor' }),
      });
    });
    
    await loginAsProfessor(page);
    
    // Debería mostrar mensaje de error
    await expect(page.locator('text=Error')).toBeVisible({ timeout: 5000 });
  });
});

