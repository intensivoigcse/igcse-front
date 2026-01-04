import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("jwt")?.value;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener el FormData del request
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const assignmentId = formData.get("assignmentId") as string;
    const comments = formData.get("comments") as string | null;

    if (!files || files.length === 0) {
      return Response.json({ error: "At least one file is required" }, { status: 400 });
    }

    if (!assignmentId) {
      return Response.json({ error: "assignmentId is required" }, { status: 400 });
    }

    // Validar máximo 5 archivos
    if (files.length > 5) {
      return Response.json({ error: "Maximum 5 files allowed" }, { status: 400 });
    }

    // Validar tamaño de cada archivo (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    for (const file of files) {
      if (file.size > maxSize) {
        return Response.json(
          { error: `File "${file.name}" exceeds 10MB limit` },
          { status: 400 }
        );
      }
    }

    // Crear FormData para enviar al backend
    const backendFormData = new FormData();
    files.forEach((file) => {
      backendFormData.append("files", file);
    });
    backendFormData.append("assignmentId", assignmentId);
    if (comments) {
      backendFormData.append("comments", comments);
    }

    // Enviar al backend
    const res = await fetch(`${BACKEND_URL}/submissions/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendFormData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errorData.error || errorData.message || "Failed to upload submission" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error uploading submission:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

