import { NextResponse } from "next/server";
import { connectMsSql } from "../../connectionDb/mssql";

export async function GET() {
  try {
    const pool = await connectMsSql();
    const result = await pool?.request().query(`SELECT 
    COUNT(EASYCODE) AS carregados,
      SUM(CASE WHEN resultado IN ('1', '3') THEN 1 ELSE 0 END) AS contatos_uteis,
      SUM(CASE WHEN resultado = '1' THEN 1 ELSE 0 END) AS marcacoes,
	    SUM(CASE WHEN resultado IS NOT NULL THEN 1 ELSE 0 END) as trabalhados
    FROM 
    minisom_all_out_2022_act
      WHERE 
      LEN(plc_id) > 8
      AND DATALOAD >= CONVERT(DATE, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
      AND DATALOAD < CONVERT(DATE, DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)));`
    );

    return NextResponse.json(result?.recordset ?? []);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// SUM(CASE WHEN resultado IN ('1', '3') THEN 1 ELSE 0 END) AS trabalhados