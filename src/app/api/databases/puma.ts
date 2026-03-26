import sql from "mssql";

const sqlConfig = {
  user: process.env.SDR_DB_USER!,
  password: process.env.SDR_DB_PASSWORD!,
  server: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME!,
  options: { encrypt: false, trustServerCertificate: true },
};

let pumaPool: sql.ConnectionPool | null = null;

export async function connectPumaDb() {
  try {
    if (pumaPool?.connected) return pumaPool;

    pumaPool = new sql.ConnectionPool(sqlConfig);
    await pumaPool.connect();
    return pumaPool;
  } catch (error) {
    console.error("Erro ao conectar no PUMA Server:", error);
    throw new Error("Falha ao conectar no PUMA.");
  }
}