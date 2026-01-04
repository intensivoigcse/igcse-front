import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("jwt")?.value;
    
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching professor courses from:", `${BACKEND_URL}/course/professor`);
    
    const res = await fetch(`${BACKEND_URL}/course/professor`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Backend response status:", res.status);
    console.log("Backend response headers:", Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Backend error response:", {
        status: res.status,
        statusText: res.statusText,
        error: errorData
      });
      return Response.json(
        { error: errorData.error || errorData.message || "Failed to fetch courses" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching professor courses:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
