import sql from "mssql";

const config = {
  user: "relatorios",
  password: "s@,bXac~}7cMXad!",
  server: "192.168.0.170",
  port: 49493,
  database: "easy8",
  options: {
    encrypt: false,
    trustServerCertificate: true, 
    enableArithAbort: true,
  },
};

export async function connectMsSql() {
  try {
    const pool = await sql.connect(config);
    return pool
  } catch (error) {
    console.error("❌ Erro na conexão:", error);
  }
}