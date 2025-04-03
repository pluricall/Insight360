import { NextResponse } from "next/server";
import { connectMsSql } from "../../connectionDb/mssql";

export async function GET() {
  try {
    const pool = await connectMsSql();
    const result = await pool?.request().query(`select FORMAT 
    (a.datacontacto, 'yyyy-MM-dd') as Dia, b.tipoBD as [Tipo BD], COUNT(*) as Marcações
    from minisom_all_out_2022_act a 
    inner join minisom_foxcc_numeros b ON
    a.bd = b.codigoInterno 
    WHERE a.datacontacto = FORMAT (getdate(), 'yyyy-MM-dd') 
    AND resultado = '1'
    GROUP BY a.datacontacto, b.tipoBD`
    );

    return NextResponse.json(result?.recordset ?? []);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}