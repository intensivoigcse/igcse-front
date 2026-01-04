import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

interface InscriptionData {
  id: string;
  student?: {
    id: string;
    name: string;
    email: string;
  };
  userId: string;
  createdAt: string;
  enrollment_status: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get("jwt")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch students enrolled in this course using the new dedicated endpoint
    const res = await fetch(`${BACKEND_URL}/inscriptions/course/${id}/students`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errorData.error || "Failed to fetch students" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const inscriptions = data.inscriptions || data || [];

    // Format the response - include all enrollment statuses for professor management
    const students = inscriptions.map((inscription: InscriptionData) => ({
      id: inscription.student?.id || inscription.userId,
      name: inscription.student?.name || "Unknown",
      email: inscription.student?.email || "",
      enrollmentDate: inscription.createdAt || new Date().toISOString(),
      enrollmentId: inscription.id,
      enrollmentStatus: inscription.enrollment_status,
      progress: Math.floor(Math.random() * 30) + 60, // Mock progress for now (60-90%)
      lastActive: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(), // Random within last 3 days
    }));

    return Response.json({ 
      students: students,
      totalStudents: data.totalStudents || students.length
    });
  } catch (error) {
    console.error("Error fetching course students:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

