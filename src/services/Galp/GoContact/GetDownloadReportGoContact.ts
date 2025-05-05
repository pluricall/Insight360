import fs from "fs";
import path from "path";

export async function DownloadReportGoContact(fileName: string): Promise<string> {
  try {
    const reportsDir = path.join(process.cwd(), "reports");

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const queryParams = new URLSearchParams({
      action: "getCsvReportFile",
      domain: process.env.GO_CONTACT_DOMAIN,
      username: process.env.GO_CONTACT_USERNAME,
      password: process.env.GO_CONTACT_PASSWORD,
      api_download: "true",
      file: fileName,
    });

    const response = await fetch(
      `https://galp-acc.go-contact.com/fs/modules/report-builder/php/reportBuilderRequests.php?${queryParams.toString()}`
    );

    if (!response.ok || !response.body) {
      throw new Error(`Erro ao baixar arquivo: ${response.statusText}`);
    }

    const filePath = path.join(reportsDir, fileName);
    const writer = fs.createWriteStream(filePath);
    const reader = response.body.getReader();

    await new Promise<void>((resolve, reject) => {
      function processChunk({
        done,
        value,
      }: ReadableStreamReadResult<Uint8Array>) {
        if (done) {
          writer.end();
          resolve();
          return;
        }
        writer.write(value, () =>
          reader.read().then(processChunk).catch(reject)
        );
      }

      reader.read().then(processChunk).catch(reject);
      writer.on("error", reject);
    });

    return filePath;
  } catch (error) {
    console.error("Erro ao baixar o relatório:", error);
    throw error;
  }
}
