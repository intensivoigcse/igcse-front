import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

// PATCH /api/forums/thread/[id]/pin - Fijar/desfijar hilo (solo profesor)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get("jwt")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isPinned } = body;

    if (typeof isPinned !== "boolean") {
      return Response.json(
        { error: "isPinned (boolean) is required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/forums/thread/${id}/pin`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isPinned }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errorData.message || "Failed to pin/unpin thread" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error pinning forum thread:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

