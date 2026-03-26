import fs from "fs";
import { parse } from "csv-parse";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function processCsvSideBySide(
  filePath: string,
): Promise<{ records: any[] }> {
  let records: any[] = [];

  const processRow = (row: any) => {
    return {
      call_uuid: row["call_uuid"],
      call_start: row["call_start"] ? new Date(row["call_start"]) : null,
      call_end: row["call_end"] ? new Date(row["call_end"]) : null,
      call_outcome_name: row["call_outcome_name"] || null,
      owner_name: row["Nome da Fila"] || null,
      servicos_assistencia: row["servicos_assistencia"] || null,
      queue_time: Number(row["queue_time"]) || 0,
      wait_time: Number(row["wait_time"]) || 0,
      term_reason: row["term_reason"] || null,
      talk_time: Number(row["talk_time"]) || 0,
      call_outcome_group: row["call_outcome_group"] || null,
      produtos_vendidos: row["482-32 Produtos Vendidos"] || null,
    }
  };

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ";", columns: true }))
      .on("data", (row) => {
        try {
          const record = processRow(row);
          if (record) records.push(record);
        } catch (error) {
          console.error("Erro ao processar linha:", error, row);
        }
      })
      .on("end", async () => {
        try {
          if (records.length > 0) {
            await prisma.galpInboundSchema.createMany({ data: records });
          }
          resolve({ records });
        } catch (error) {
          reject(error);
        }
      })
      .on("error", reject);
  });
}
