import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

// POST /api/attendance/session - Crear sesion
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("jwt")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, title, description, sessionDate, startTime, endTime } = body;

    if (!courseId || !title || !sessionDate) {
      return Response.json(
        { error: "courseId, title, and sessionDate are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/attendance/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        courseId, 
        title, 
        description, 
        sessionDate, 
        startTime, 
        endTime 
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errorData.message || "Failed to create session" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error creating attendance session:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

