import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

// GET /api/attendance/course/[courseId]/student/[userId] - Stats de un estudiante especifico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; userId: string }> }
) {
  try {
    const { courseId, userId } = await params;
    const token = request.cookies.get("jwt")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${BACKEND_URL}/attendance/course/${courseId}/student/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errorData.message || "Failed to fetch student attendance" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

