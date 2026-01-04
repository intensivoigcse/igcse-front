import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

// POST /api/announcements - Crear anuncio
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("jwt")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { course_id, title, content } = body;

    if (!course_id || !title || !content) {
      return Response.json(
        { error: "course_id, title, and content are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/announcements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errorData.message || errorData.error || "Failed to create announcement" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

