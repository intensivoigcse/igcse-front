import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

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

    // Obtener carpetas raíz del curso
    const foldersRes = await fetch(`${BACKEND_URL}/folder/course/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Obtener documentos raíz del curso
    const documentsRes = await fetch(`${BACKEND_URL}/documents/course/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!foldersRes.ok || !documentsRes.ok) {
      return Response.json(
        { error: "Failed to fetch materials" },
        { status: foldersRes.status }
      );
    }

    const folders = await foldersRes.json();
    const documents = await documentsRes.json();

    return Response.json({
      folders: folders || [],
      documents: documents || [],
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

