import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: folderId } = await params;
    const token = request.cookies.get("jwt")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener subcarpetas
    const subfoldersRes = await fetch(`${BACKEND_URL}/folder/parent/${folderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Obtener documentos de la carpeta
    const documentsRes = await fetch(`${BACKEND_URL}/documents/folder/${folderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!subfoldersRes.ok || !documentsRes.ok) {
      return Response.json(
        { error: "Failed to fetch folder contents" },
        { status: subfoldersRes.status }
      );
    }

    const subfolders = await subfoldersRes.json();
    const documents = await documentsRes.json();

    return Response.json({
      folders: subfolders || [],
      documents: documents || [],
    });
  } catch (error) {
    console.error("Error fetching folder contents:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: folderId } = await params;
    const token = request.cookies.get("jwt")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${BACKEND_URL}/folder/${folderId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errorData.error || "Failed to delete folder" },
        { status: res.status }
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

