import { test, expect } from '@playwright/test';
import { loginAsStudent, loginAsProfessor, logout } from './fixtures/auth';

test.describe('Ver Tareas - Estudiante', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('puede acceder a sección de tareas', async ({ page }) => {
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      // Click en sección de tareas
      const tareasBtn = page.locator('text=Tareas').first();
      const hasTareas = await tareasBtn.isVisible().catch(() => false);
      
      if (hasTareas) {
        await tareasBtn.click();
        await page.waitForTimeout(500);
        
        // Verificar que se muestra la sección de tareas
        await expect(page.locator('text=Tarea').or(page.locator('text=No hay tareas'))).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('puede ver lista de tareas asignadas', async ({ page }) => {
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      const tareasBtn = page.locator('text=Tareas').first();
      await tareasBtn.click();
      await page.waitForTimeout(1000);
      
      // Verificar que muestra tareas o estado vacío
      const hasTasks = await page.locator('[class*="card"]').first().isVisible().catch(() => false);
      const hasEmpty = await page.locator('text=No hay tareas').isVisible().catch(() => false);
      
      expect(hasTasks || hasEmpty).toBeTruthy();
    }
  });

  test('puede ver información de una tarea', async ({ page }) => {
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      await page.locator('text=Tareas').first().click();
      await page.waitForTimeout(1000);
      
      // Si hay tareas, verificar que muestran información
      const taskCard = page.locator('[class*="card"]').nth(1); // El primer card es del layout
      const hasTask = await taskCard.isVisible().catch(() => false);
      
      if (hasTask) {
        // Verificar que muestra puntos o fecha de vencimiento
        const hasPoints = await page.locator('text=puntos').isVisible().catch(() => false);
        const hasDueDate = await page.locator('text=Vence').or(page.locator('text=vence')).isVisible().catch(() => false);
        
        expect(hasPoints || hasDueDate).toBeTruthy();
      }
    }
  });
});

test.describe('Entregar Tarea - Estudiante', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('puede abrir diálogo de entrega de tarea', async ({ page }) => {
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      await page.locator('text=Tareas').first().click();
      await page.waitForTimeout(1000);
      
      // Buscar botón de entregar
      const submitBtn = page.locator('button:has-text("Entregar")').first();
      const canSubmit = await submitBtn.isVisible().catch(() => false);
      
      if (canSubmit) {
        await submitBtn.click();
        
        // Verificar que se abre el diálogo
        await expect(page.locator('text=Entregar Tarea')).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('diálogo de entrega tiene campos requeridos', async ({ page }) => {
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      await page.locator('text=Tareas').first().click();
      await page.waitForTimeout(1000);
      
      const submitBtn = page.locator('button:has-text("Entregar")').first();
      const canSubmit = await submitBtn.isVisible().catch(() => false);
      
      if (canSubmit) {
        await submitBtn.click();
        await page.waitForTimeout(500);
        
        // Verificar campos del diálogo
        await expect(page.locator('textarea, [id="comment"]')).toBeVisible();
        await expect(page.locator('button:has-text("Seleccionar archivos")')).toBeVisible();
      }
    }
  });

  test('validación: requiere comentario o archivo', async ({ page }) => {
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      await page.locator('text=Tareas').first().click();
      await page.waitForTimeout(1000);
      
      const submitBtn = page.locator('button:has-text("Entregar")').first();
      const canSubmit = await submitBtn.isVisible().catch(() => false);
      
      if (canSubmit) {
        await submitBtn.click();
        await page.waitForTimeout(500);
        
        // Intentar enviar sin nada
        await page.locator('button:has-text("Entregar Tarea")').click();
        
        // Verificar mensaje de error
        await expect(page.locator('text=comentario o')).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('puede cancelar entrega de tarea', async ({ page }) => {
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      await page.locator('text=Tareas').first().click();
      await page.waitForTimeout(1000);
      
      const submitBtn = page.locator('button:has-text("Entregar")').first();
      const canSubmit = await submitBtn.isVisible().catch(() => false);
      
      if (canSubmit) {
        await submitBtn.click();
        await page.waitForTimeout(500);
        
        // Click en cancelar
        await page.locator('button:has-text("Cancelar")').click();
        
        // Verificar que se cierra el diálogo
        await expect(page.locator('text=Entregar Tarea')).not.toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('puede agregar comentario a la entrega', async ({ page }) => {
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      await page.locator('text=Tareas').first().click();
      await page.waitForTimeout(1000);
      
      const submitBtn = page.locator('button:has-text("Entregar")').first();
      const canSubmit = await submitBtn.isVisible().catch(() => false);
      
      if (canSubmit) {
        await submitBtn.click();
        await page.waitForTimeout(500);
        
        // Escribir comentario
        const textarea = page.locator('textarea, [id="comment"]');
        await textarea.fill('Este es mi comentario de entrega para la tarea.');
        
        // Verificar que se escribió
        await expect(textarea).toHaveValue('Este es mi comentario de entrega para la tarea.');
      }
    }
  });
});

test.describe('Gestión de Tareas - Profesor', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsProfessor(page);
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('puede acceder a sección de tareas', async ({ page }) => {
    const courseCard = page.locator('[class*="card"] a').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      // Click en sección de tareas
      await page.click('text=Tareas');
      await page.waitForTimeout(500);
      
      // Verificar que se muestra la sección
      await expect(page.locator('text=Tarea').or(page.locator('text=Crear'))).toBeVisible({ timeout: 5000 });
    }
  });

  test('puede ver botón para crear tarea', async ({ page }) => {
    const courseCard = page.locator('[class*="card"] a').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      await page.click('text=Tareas');
      await page.waitForTimeout(500);
      
      // Verificar botón de crear
      await expect(page.locator('button:has-text("Crear"), button:has-text("Nueva"), button:has-text("Agregar")')).toBeVisible({ timeout: 5000 });
    }
  });

  test('puede ver entregas de estudiantes', async ({ page }) => {
    const courseCard = page.locator('[class*="card"] a').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      await page.click('text=Tareas');
      await page.waitForTimeout(1000);
      
      // Verificar que hay opción de ver entregas si hay tareas
      const taskExists = await page.locator('[class*="card"]').nth(1).isVisible().catch(() => false);
      
      if (taskExists) {
        const viewSubmissions = page.locator('button:has-text("Ver"), button:has-text("Entregas")');
        const hasViewOption = await viewSubmissions.first().isVisible().catch(() => false);
        
        // Solo verificar si la opción existe cuando hay tareas
        expect(hasViewOption || !taskExists).toBeTruthy();
      }
    }
  });
});

test.describe('Validación de Archivos - Entrega de Tarea', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('muestra tipos de archivo permitidos', async ({ page }) => {
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      await page.locator('text=Tareas').first().click();
      await page.waitForTimeout(1000);
      
      const submitBtn = page.locator('button:has-text("Entregar")').first();
      const canSubmit = await submitBtn.isVisible().catch(() => false);
      
      if (canSubmit) {
        await submitBtn.click();
        await page.waitForTimeout(500);
        
        // Verificar información de tipos permitidos
        await expect(page.locator('text=PDF').or(page.locator('text=imágenes'))).toBeVisible();
      }
    }
  });

  test('muestra límite de archivos', async ({ page }) => {
    const courseCard = page.locator('[class*="card"]').first();
    const hasCourses = await courseCard.isVisible().catch(() => false);
    
    if (hasCourses) {
      await courseCard.click();
      await page.waitForLoadState('networkidle');
      
      await page.locator('text=Tareas').first().click();
      await page.waitForTimeout(1000);
      
      const submitBtn = page.locator('button:has-text("Entregar")').first();
      const canSubmit = await submitBtn.isVisible().catch(() => false);
      
      if (canSubmit) {
        await submitBtn.click();
        await page.waitForTimeout(500);
        
        // Verificar información de límites
        await expect(page.locator('text=5 archivos').or(page.locator('text=10MB'))).toBeVisible();
      }
    }
  });
});

