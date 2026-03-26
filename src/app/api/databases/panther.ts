import sql from "mssql";

const sqlConfig: sql.config = {
  user: process.env.DB_USER_PANTHER!,
  password: process.env.DB_PASSWORD_PANTHER!,
  server: process.env.DB_SERVER_PANTHER!,
  port: parseInt(process.env.DB_PORT_PANTHER!),
  database: process.env.DB_NAME_PANTHER!,
  options: { encrypt: false, trustServerCertificate: true },
};

let pantherPool: sql.ConnectionPool | null = null;

export async function connectPantherDb() {
  try {
    if (pantherPool?.connected) return pantherPool;

    pantherPool = new sql.ConnectionPool(sqlConfig);
    await pantherPool.connect();
    return pantherPool;
  } catch (error) {
    console.error("Erro ao conectar no PANTHER Server:", error);
    throw new Error("Falha ao conectar no PANTHER.");
  }
}