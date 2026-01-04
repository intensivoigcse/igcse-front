"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isAuthenticated, getUserRole, removeAuthToken } from "@/lib/auth";
import { LogOut, Menu, X, BookOpen, User, GraduationCap, Heart, Home } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsAuthenticatedUser(isAuthenticated());
    setUserRole(getUserRole());
  }, [pathname]);

  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticatedUser(false);
    setUserRole(null);
    router.push("/");
  };

  // Different navigation links based on user role
  const getNavLinks = () => {
    if (!isAuthenticatedUser) {
      return [
        { href: "/", label: "Inicio", icon: Home },
        { href: "/login", label: "Iniciar Sesión", icon: User },
        { href: "/signup", label: "Registrarse", icon: User },
      ];
    }

    // Base links for all authenticated users
    const baseLinks = [
      { href: "/dashboard", label: "Dashboard", icon: Home },
    ];

    // Role-specific links
    if (userRole === "student") {
      return [
        ...baseLinks,
        { href: "/courses", label: "Cursos", icon: BookOpen },
        { href: "/inscriptions", label: "Inscripciones", icon: GraduationCap },
        { href: "/donations", label: "Donaciones", icon: Heart },
        { href: "/profile", label: "Perfil", icon: User },
      ];
    } else if (userRole === "professor") {
      return [
        ...baseLinks,
        { href: "/inscriptions", label: "Inscripciones", icon: GraduationCap },
        { href: "/donations", label: "Donaciones", icon: Heart },
        { href: "/profile", label: "Perfil", icon: User },
      ];
    }

    // Default fallback (all links)
    return [
      ...baseLinks,
      { href: "/courses", label: "Cursos", icon: BookOpen },
      { href: "/inscriptions", label: "Inscripciones", icon: GraduationCap },
      { href: "/donations", label: "Donaciones", icon: Heart },
      { href: "/profile", label: "Perfil", icon: User },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={isAuthenticatedUser ? "/dashboard" : "/"} className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">APPaso</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            {isAuthenticatedUser && (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted rounded-md ${
                    isActive ? "text-primary bg-muted" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            {isAuthenticatedUser && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

