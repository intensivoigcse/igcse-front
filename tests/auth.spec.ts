import { test, expect } from '@playwright/test';
import { TEST_PROFESSOR, TEST_STUDENT, logout } from './fixtures/auth';

test.describe('Autenticación - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('muestra el formulario de login correctamente', async ({ page }) => {
    // Verificar elementos del formulario
    await expect(page.locator('h1')).toContainText('Ingresa a tu cuenta');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Ingresar');
  });

  test('login exitoso redirige al dashboard', async ({ page }) => {
    // Llenar formulario con credenciales válidas
    await page.fill('input[type="email"]', TEST_PROFESSOR.email);
    await page.fill('input[type="password"]', TEST_PROFESSOR.password);
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar redirección al dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('login fallido muestra mensaje de error', async ({ page }) => {
    // Llenar formulario con credenciales inválidas
    await page.fill('input[type="email"]', 'usuario.invalido@test.com');
    await page.fill('input[type="password"]', 'contraseñaIncorrecta123');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que aparece mensaje de error
    await expect(page.locator('.bg-destructive\\/15')).toBeVisible({ timeout: 5000 });
  });

  test('link a registro funciona', async ({ page }) => {
    // Buscar y clickear el link de registro
    await page.click('a[href="/signup"]');
    
    // Verificar navegación a signup
    await expect(page).toHaveURL('/signup');
  });

  test('botón de submit se deshabilita durante el loading', async ({ page }) => {
    await page.fill('input[type="email"]', TEST_PROFESSOR.email);
    await page.fill('input[type="password"]', TEST_PROFESSOR.password);
    
    // Interceptar la petición para hacerla más lenta
    await page.route('/api/auth/login', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // Clickear submit
    await page.click('button[type="submit"]');
    
    // Verificar que el botón muestra "Ingresando..."
    await expect(page.locator('button[type="submit"]')).toContainText('Ingresando...');
  });
});

test.describe('Autenticación - Signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('muestra el formulario de registro correctamente', async ({ page }) => {
    // Verificar elementos del formulario
    await expect(page.locator('h1')).toContainText('Crea tu cuenta');
    await expect(page.locator('input#name')).toBeVisible();
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('select#role')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('input#confirm-password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Crear Cuenta');
  });

  test('muestra error si passwords no coinciden', async ({ page }) => {
    // Llenar formulario
    await page.fill('input#name', 'Test User');
    await page.fill('input#email', 'test.nuevo@example.com');
    await page.fill('input#password', 'Password123!');
    await page.fill('input#confirm-password', 'DiferentePassword123!');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de error
    await expect(page.locator('.bg-destructive\\/15')).toContainText('Passwords do not match');
  });

  test('muestra error si password es menor a 8 caracteres', async ({ page }) => {
    // Llenar formulario con password corta
    await page.fill('input#name', 'Test User');
    await page.fill('input#email', 'test.nuevo@example.com');
    await page.fill('input#password', 'Short1!');
    await page.fill('input#confirm-password', 'Short1!');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de error
    await expect(page.locator('.bg-destructive\\/15')).toContainText('at least 8 characters');
  });

  test('permite seleccionar rol de estudiante o profesor', async ({ page }) => {
    const roleSelect = page.locator('select#role');
    
    // Verificar opciones disponibles
    await expect(roleSelect.locator('option[value="student"]')).toHaveText('Estudiante');
    await expect(roleSelect.locator('option[value="professor"]')).toHaveText('Profesor');
    
    // Verificar que estudiante es la opción por defecto
    await expect(roleSelect).toHaveValue('student');
    
    // Cambiar a profesor
    await roleSelect.selectOption('professor');
    await expect(roleSelect).toHaveValue('professor');
  });

  test('link a login funciona', async ({ page }) => {
    // Buscar y clickear el link de login
    await page.click('a[href="/login"]');
    
    // Verificar navegación a login
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Autenticación - Protección de rutas', () => {
  test('usuario no autenticado es redirigido a login desde dashboard', async ({ page }) => {
    // Intentar acceder al dashboard sin autenticación
    await page.goto('/dashboard');
    
    // Verificar redirección a login (puede incluir query params de redirect)
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('usuario no autenticado es redirigido a login desde cursos', async ({ page }) => {
    // Intentar acceder a cursos sin autenticación
    await page.goto('/courses');
    
    // Verificar redirección a login (puede incluir query params de redirect)
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });
});

