import { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  id?: number | string;
  userId?: number | string;
  sub?: number | string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("jwt")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${BACKEND_URL}/inscriptions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errorData.message || "Failed to fetch inscriptions" },
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

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("jwt")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Inscriptions POST] Incoming enrollment request");
    // Get user profile to obtain userId
    const profileRes = await fetch(`${BACKEND_URL}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!profileRes.ok) {
      return Response.json({ error: "Failed to get user profile" }, { status: 401 });
    }

    const profileData = await profileRes.json();
    console.log("[Inscriptions POST] Profile response:", profileData);
    let userId = profileData.id || profileData.user?.id || profileData.userId;

    if (!userId) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        userId = decoded.id || decoded.userId || decoded.sub;
        console.log("[Inscriptions POST] UserId derived from token:", userId);
      } catch (decodeError) {
        console.error("[Inscriptions POST] Failed to decode JWT:", decodeError);
      }
    }

    console.log("[Inscriptions POST] Resolved userId:", userId);
    if (!userId) {
      console.error("[Inscriptions POST] Missing userId in profile response");
      return Response.json({ error: "User ID not found" }, { status: 400 });
    }

    const body = await request.json();
    console.log("[Inscriptions POST] Request body:", body);
    const { courseId } = body;

    if (!courseId) {
      return Response.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    // Convert courseId to number if it's a string
    const courseIdNum = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
    const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;

    console.log("[Inscriptions POST] Parsed IDs:", { userIdNum, courseIdNum });

    if (isNaN(courseIdNum) || isNaN(userIdNum)) {
      console.error("[Inscriptions POST] Invalid ID format", { userId, courseId });
      return Response.json(
        { error: "Invalid courseId or userId format" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/inscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: userIdNum, courseId: courseIdNum }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("[Inscriptions POST] Backend error response:", errorData);
      return Response.json(
        { error: errorData.message || errorData.error || "Failed to create inscription" },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("[Inscriptions POST] Success response:", data);
    return Response.json(data);
  } catch (error) {
    console.error("[Inscriptions POST] Unexpected error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

