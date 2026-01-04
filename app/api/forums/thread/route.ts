import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

// POST /api/forums/thread - Crear nuevo hilo
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("jwt")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, title, content, category } = body;

    if (!courseId || !title || !content) {
      return Response.json(
        { error: "courseId, title, and content are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/forums/thread`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId, title, content, category: category || "General" }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errorData.message || "Failed to create thread" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error creating forum thread:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

