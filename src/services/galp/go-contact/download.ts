import axios from "axios";
import fs from "fs";
import path from "path";
import os from "os";

export async function downloadReportGoContact({
  reportJobId,
  token,
  maxAttempts = 20,
  intervalMs = 6000,
}: {
  reportJobId: string;
  token: string;
  maxAttempts?: number;
  intervalMs?: number;
}): Promise<string> {
  const url = `https://galp.gocontact.com/poll/api/reportdesigner/${reportJobId}/download`;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[Tentativa ${attempt}/${maxAttempts}] Verificando relatório...`);

    const response = await axios.get(url, {
      responseType: "stream",
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });

    if (response.status === 200) {
      const tmpDir = path.join(os.tmpdir(), "galp_reports");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const filePath = path.join(tmpDir, `${reportJobId}.csv`);
      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise<void>((res, rej) => {
        writer.on("finish", res);
        writer.on("error", rej);
      });

      return filePath;
    }

    if (response.status === 410) {
      throw new Error("Relatório expirou no servidor. Gere novamente.");
    }

    if ([202, 404].includes(response.status)) {
      if (attempt === maxAttempts) {
        throw new Error(`Relatório não ficou pronto após ${maxAttempts} tentativas. Tente um período menor.`);
      }
      await new Promise(r => setTimeout(r, intervalMs));
      continue;
    }

    throw new Error(`Erro inesperado: ${response.status}`);
  }

  throw new Error("Falha no polling do relatório.");
}