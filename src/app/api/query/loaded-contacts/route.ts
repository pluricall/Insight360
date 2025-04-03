import { NextResponse } from "next/server";
import { connectMsSql } from "../../connectionDb/mssql";

export async function GET() {
  try {
    const pool = await connectMsSql();
    const result = await pool?.request().query(`
    SELECT 
    bd AS BD, 
    dataload AS Data, 
    COUNT(EASYCODE) AS Carregados,
    SUM(CASE WHEN resultado = '1' THEN 1 ELSE 0 END) AS Marcações,
    FORMAT(COALESCE(SUM(CASE WHEN resultado IN ('1', '3') THEN 1 ELSE 0 END) * 1.0 / NULLIF(SUM(CASE WHEN resultado = '1' THEN 1 ELSE 0 END), 0), 0), 'N2') + '%' AS Interessados,
    FORMAT(COALESCE(SUM(CASE WHEN resultado IN ('1', '3') THEN 1 ELSE 0 END) * 1.0 / NULLIF(SUM(CASE WHEN resultado = '1' THEN 1 ELSE 0 END), 0), 0) / NULLIF(COUNT(EASYCODE), 0), 'N2') + '%' AS Conversão
FROM minisom_all_out_2022_act
WHERE LEN(plc_id) > 8
AND DATALOAD >= CONVERT(DATE, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
AND DATALOAD < CONVERT(DATE, DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)))
GROUP BY bd, dataload
ORDER BY Data ASC;
  `);

    return NextResponse.json(result?.recordset ?? []);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
