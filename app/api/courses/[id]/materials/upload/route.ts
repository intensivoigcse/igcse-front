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

    // Obtener el FormData del request
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string | null;
    const studentVisible = formData.get("studentVisible") === "true";

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Validar que sea PDF
    if (file.type !== "application/pdf") {
      return Response.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return Response.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    // Crear FormData para enviar al backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("courseId", courseId);
    if (folderId) {
      backendFormData.append("folderId", folderId);
    }
    backendFormData.append("studentVisible", String(studentVisible));

    // Enviar al backend
    const res = await fetch(`${BACKEND_URL}/documents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendFormData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errorData.error || "Failed to upload file" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error uploading file:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

