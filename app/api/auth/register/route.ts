const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // CRITICAL: Prevent registering with admin role
    if (role === "admin") {
      return Response.json(
        { error: "No se puede registrar con rol administrador" },
        { status: 403 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role: role || "student", // Default to student if no role provided
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return Response.json(
        { error: errorData.message || "Registration failed" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
