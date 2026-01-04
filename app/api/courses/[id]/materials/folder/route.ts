import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const token = request.cookies.get("jwt")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, parentFolderId, studentVisible } = body;

    if (!name || name.trim().length === 0) {
      return Response.json({ error: "Folder name is required" }, { status: 400 });
    }

    if (name.length > 100) {
      return Response.json({ error: "Folder name too long (max 100 characters)" }, { status: 400 });
    }

    // Crear carpeta en el backend
    const res = await fetch(`${BACKEND_URL}/folder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        courseId,
        name: name.trim(),
        parentFolderId: parentFolderId || null,
        studentVisible: studentVisible !== undefined ? studentVisible : true,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errorData.error || "Failed to create folder" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error creating folder:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

