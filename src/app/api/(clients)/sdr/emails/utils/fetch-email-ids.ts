import { connectPantherDb } from "@/app/api/databases/panther";
import sql from "mssql";

interface fetchEmailIdsParams {
  datainicio?: string
  datafim?: string
}

export async function fetchEmailIdsFromPanther({ datainicio, datafim }: fetchEmailIdsParams) {
  try {
    const table = process.env.DB_CLIENT_PANTHER!;
    const allowedTables = process.env.DB_CLIENT_WHITELIST?.split(",") || [];

    if (!table) throw new Error("Fonte de dados não configurada.");
    if (!allowedTables.includes(table)) throw new Error("Fonte de dados inválida ou não autorizada.");

    if (datafim && !datainicio) {
      throw new Error("É necessário informar datainicio ao informar datafim.");
    }

    const connection = await connectPantherDb();
    const request = connection.request();
    request.input("campaign", process.env.DB_CAMPAIGNID_PANTHER!);

    let dateFilter = "";

    if (datainicio) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(datainicio)) {
        throw new Error("Data início deve estar no formato YYYY-MM-DD.");
      }
      const startDate = new Date(datainicio + "T00:00:00");
      request.input("startDate", sql.DateTime, startDate);

      if (datafim) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(datafim)) {
          throw new Error("Data fim deve estar no formato YYYY-MM-DD.");
        }
        const endDate = new Date(datafim + "T00:00:00");
        endDate.setDate(endDate.getDate() + 1); // dia seguinte
        request.input("endDate", sql.DateTime, endDate);
        dateFilter = "AND start_time >= @startDate AND start_time < @endDate";
      } else {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        request.input("endDate", sql.DateTime, endDate);
        dateFilter = "AND start_time >= @startDate AND start_time < @endDate";
      }
    }

    const { recordset } = await request.query(`
      SELECT recording_doc_id 
      FROM ${table}
      WHERE media_type = '2'
        AND campaign = @campaign
        ${dateFilter}
        ORDER BY start_time
    `);

    return recordset;
  } catch (err: any) {
    console.error("Erro SQL interno:", err.message);
    throw new Error(err.message);
  }
}
