import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const filename = (await params).filename;

    const filePath = path.join(process.cwd(), "tmp", filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Arquivo não encontrado." },
        { status: 404 }
      );
    }

    const fileStream = fs.createReadStream(filePath);

    const headers = new Headers({
      "Content-Disposition": `attachment; filename=${filename}`,
      "Content-Type": "application/octet-stream",
    });
    
    return new Response(fileStream as any, { headers });
  } catch (error) {
    console.error("Erro ao baixar o relatório:", error);
    return NextResponse.json(
      { error: "Erro ao baixar relatório." },
      { status: 500 }
    );
  }
}
