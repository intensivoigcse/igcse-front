import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

// PATCH /api/forums/thread/[id]/lock - Bloquear/desbloquear hilo (solo profesor)
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
    const { isLocked } = body;

    if (typeof isLocked !== "boolean") {
      return Response.json(
        { error: "isLocked (boolean) is required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/forums/thread/${id}/lock`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isLocked }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errorData.message || "Failed to lock/unlock thread" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error locking forum thread:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

