/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect, Page } from '@playwright/test';

/**
 * Credenciales de prueba para tests E2E
 * Estas cuentas fueron creadas en el sistema para testing.
 * 
 * Si necesitas cambiarlas, puedes usar variables de entorno:
 *    - TEST_PROFESSOR_EMAIL, TEST_PROFESSOR_PASSWORD
 *    - TEST_STUDENT_EMAIL, TEST_STUDENT_PASSWORD
 */
export const TEST_PROFESSOR = {
  email: process.env.TEST_PROFESSOR_EMAIL || 'profesor.test@appaso.com',
  password: process.env.TEST_PROFESSOR_PASSWORD || 'TestPassword123!',
  name: 'Profesor Test E2E',
};

export const TEST_STUDENT = {
  email: process.env.TEST_STUDENT_EMAIL || 'estudiante.test@appaso.com',
  password: process.env.TEST_STUDENT_PASSWORD || 'TestPassword123!',
  name: 'Estudiante Test E2E',
};

// Helper para hacer login
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Esperar a que se complete el login
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

// Helper para hacer login como profesor
export async function loginAsProfessor(page: Page) {
  await login(page, TEST_PROFESSOR.email, TEST_PROFESSOR.password);
}

// Helper para hacer login como estudiante
export async function loginAsStudent(page: Page) {
  await login(page, TEST_STUDENT.email, TEST_STUDENT.password);
}

// Helper para hacer logout
export async function logout(page: Page) {
  // Limpiar localStorage y cookies
  await page.evaluate(() => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userRole');
  });
  // Eliminar cookie
  await page.context().clearCookies();
}

// Extend base test con fixtures de autenticación
export const test = base.extend<{
  professorPage: Page;
  studentPage: Page;
}>({
  professorPage: async ({ page }, use) => {
    await loginAsProfessor(page);
    await use(page);
  },
  studentPage: async ({ page }, use) => {
    await loginAsStudent(page);
    await use(page);
  },
});

export { expect };

