import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  id?: string;
  name: string;
  email: string;
  role: string;
}

export function getUserFromToken(): { id: string; name: string; email: string; role: string } | null {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return {
      id: decoded.id || '',
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };
    
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('jwt');
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt', token);
    
    const decoded = jwtDecode<JWTPayload>(token);
    //localStorage.setItem('id', decoded.id || '');
    localStorage.setItem('userRole', decoded.role);
    console.log(decoded.role);

    // Also set as cookie for middleware to access
    document.cookie = `jwt=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userRole');
    // Remove cookie
    document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function getUserRole(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('userRole');
}

export function getUserId():string | null {
  return localStorage.getItem('userId');
}

export function isTeacher(): boolean {
  return getUserRole() === 'professor';
}

export function isStudent(): boolean {
  return getUserRole() === 'student';
}
