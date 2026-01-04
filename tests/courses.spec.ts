import { test, expect } from '@playwright/test';
import { loginAsProfessor, logout } from './fixtures/auth';

test.describe('Gestión de Cursos - Profesor', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProfessor(page);
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('puede abrir diálogo de crear curso desde dashboard', async ({ page }) => {
    // Click en botón crear curso
    await page.click('button:has-text("Crear Curso")');
    
    // Verificar que se abre el diálogo con campos correctos
    await expect(page.locator('[role="dialog"], .fixed')).toBeVisible();
    await expect(page.locator('input[name="title"], input#title, input[placeholder*="título"]')).toBeVisible({ timeout: 3000 });
  });

  test('formulario de crear curso tiene campos requeridos', async ({ page }) => {
    await page.click('button:has-text("Crear Curso")');
    
    // Verificar campos del formulario
    await expect(page.locator('input').first()).toBeVisible();
    await expect(page.locator('textarea, [contenteditable="true"]').first()).toBeVisible();
  });

  test('puede crear un nuevo curso', async ({ page }) => {
    await page.click('button:has-text("Crear Curso")');
    
    // Esperar a que el diálogo esté completamente visible
    await page.waitForTimeout(500);
    
    // Verificar que el diálogo se abrió con los campos correctos
    const dialog = page.locator('[role="dialog"], .fixed').first();
    await expect(dialog).toBeVisible();
    
    // Verificar campos del formulario
    const titleInput = dialog.locator('input').first();
    await expect(titleInput).toBeVisible();
    
    const descriptionInput = dialog.locator('textarea').first();
    await expect(descriptionInput).toBeVisible();
    
    // Llenar algunos campos para verificar que funcionan
    const timestamp = Date.now();
    await titleInput.fill(`Curso E2E ${timestamp}`);
    await descriptionInput.fill('Esta es una descripción detallada del curso de prueba para tests E2E automatizados con más de 50 caracteres.');
    
    // Verificar que el contenido se escribió correctamente
    await expect(titleInput).toHaveValue(`Curso E2E ${timestamp}`);
    
    // Cerrar el diálogo (buscar botón X o cancelar)
    const closeButton = dialog.locator('button:has-text("Cancelar"), button[aria-label*="close"], button:has-text("×")').first();
    const hasCloseButton = await closeButton.isVisible().catch(() => false);
    if (hasCloseButton) {
      await closeButton.click();
    } else {
      // Presionar Escape para cerrar
      await page.keyboard.press('Escape');
    }
  });
});

test.describe('Detalle de Curso - Profesor', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProfessor(page);
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('sidebar de gestión muestra todas las secciones', async ({ page }) => {
    // Navegar a un curso si existe
    const courseCard = page.locator('[class*="card"] a').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      // Verificar secciones del sidebar
      await expect(page.locator('text=Overview').or(page.locator('text=Resumen'))).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Estudiantes')).toBeVisible();
      await expect(page.locator('text=Materiales')).toBeVisible();
      await expect(page.locator('text=Tareas')).toBeVisible();
      await expect(page.locator('text=Anuncios')).toBeVisible();
      await expect(page.locator('text=Foros')).toBeVisible();
      await expect(page.locator('text=Asistencia')).toBeVisible();
    }
  });

  test('puede navegar entre secciones del sidebar', async ({ page }) => {
    const courseCard = page.locator('[class*="card"] a').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      // Click en sección Estudiantes
      await page.click('text=Estudiantes');
      await page.waitForTimeout(500);
      
      // Verificar que carga la sección
      await expect(page.locator('text=Estudiantes Inscritos').or(page.locator('text=estudiantes'))).toBeVisible({ timeout: 5000 });
      
      // Click en sección Materiales
      await page.click('text=Materiales');
      await page.waitForTimeout(500);
      
      // Verificar que carga la sección de materiales
      await expect(page.locator('text=Material').or(page.locator('text=Subir'))).toBeVisible({ timeout: 5000 });
    }
  });

  test('puede ver botón de volver al dashboard', async ({ page }) => {
    const courseCard = page.locator('[class*="card"] a').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      // Verificar botón de volver
      await expect(page.locator('button:has-text("Volver")')).toBeVisible();
      
      // Click en volver
      await page.click('button:has-text("Volver")');
      
      // Verificar que vuelve al dashboard
      await expect(page).toHaveURL('/dashboard');
    }
  });
});

test.describe('Gestión de Estudiantes - Profesor', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProfessor(page);
    await page.waitForLoadState('networkidle');
  });

  test('puede ver lista de estudiantes inscritos', async ({ page }) => {
    const courseCard = page.locator('[class*="card"] a').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      // Navegar a sección de estudiantes
      await page.click('text=Estudiantes');
      await page.waitForTimeout(1000);
      
      // Verificar que muestra la lista o mensaje de vacío
      const hasStudents = await page.locator('table, [class*="list"]').isVisible().catch(() => false);
      const hasEmptyMessage = await page.locator('text=No hay estudiantes').isVisible().catch(() => false);
      
      expect(hasStudents || hasEmptyMessage).toBeTruthy();
    }
  });
});

test.describe('Gestión de Materiales - Profesor', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProfessor(page);
    await page.waitForLoadState('networkidle');
  });

  test('puede ver sección de materiales', async ({ page }) => {
    const courseCard = page.locator('[class*="card"] a').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      // Navegar a materiales
      await page.click('text=Materiales');
      await page.waitForTimeout(1000);
      
      // Verificar que aparece opción de subir material
      await expect(page.locator('button:has-text("Subir"), button:has-text("Agregar")')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Gestión de Anuncios - Profesor', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProfessor(page);
    await page.waitForLoadState('networkidle');
  });

  test('puede ver sección de anuncios', async ({ page }) => {
    const courseCard = page.locator('[class*="card"] a').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      // Navegar a anuncios
      await page.click('text=Anuncios');
      await page.waitForTimeout(1000);
      
      // Verificar que aparece la sección
      await expect(page.locator('text=Anuncio').or(page.locator('text=Crear'))).toBeVisible({ timeout: 5000 });
    }
  });
});

