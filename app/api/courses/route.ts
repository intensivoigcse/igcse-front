import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("jwt")?.value;
    
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${BACKEND_URL}/course`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errorData.error || "Failed to fetch courses" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("jwt")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title || !description) {
      return Response.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    console.log("Creating course with data:", JSON.stringify(body, null, 2));

    const res = await fetch(`${BACKEND_URL}/course`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      let errorData;
      let errorText = "";
      try {
        errorText = await res.text();
        console.error(`Backend error response (status ${res.status}):`, errorText);
        errorData = errorText ? JSON.parse(errorText) : {};
        console.error("Parsed error data:", errorData);
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError);
        console.error("Raw error text:", errorText);
        errorData = { 
          message: errorText || `Backend returned status ${res.status}`,
          raw: errorText 
        };
      }
      return Response.json(
        { 
          error: errorData.message || errorData.error || `Failed to create course (Status: ${res.status})`,
          details: errorData,
          status: res.status
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error in POST /api/courses:", error);
    return Response.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
