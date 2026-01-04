import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

// GET /api/forums/course/[courseId] - Listar hilos de un curso
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const token = request.cookies.get("jwt")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let url = `${BACKEND_URL}/forums/course/${courseId}`;
    const queryParams = new URLSearchParams();
    if (category) queryParams.append("category", category);
    if (search) queryParams.append("search", search);
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errorData.message || "Failed to fetch forum threads" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching forum threads:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

