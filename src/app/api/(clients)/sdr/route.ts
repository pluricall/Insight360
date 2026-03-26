// app/api/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectPumaDb } from '../../databases/puma';
import sql from 'mssql';

const resultsTranslater: Record<string, string> = {
  '4': 'Transferido para SDR',
  '5': 'Transferido para SDR',
  '1': 'Cliente Esclarecido',
  '6': 'Outras situações',
  'C': 'Chamada caiu',
  'A': 'Chamada fora do Âmbito',
  'K': 'Chamada de teste',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const datainicio = searchParams.get('datainicio') ?? undefined;
  const datafim = searchParams.get('datafim') ?? undefined;
  const easycode = searchParams.get('easycode') ?? undefined;
  const origem = searchParams.get('origem') ?? undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '200');

  if (datafim && !datainicio) {
    return NextResponse.json({ error: "'datainicio' é obrigatório quando 'datafim' é informado." }, { status: 400 });
  }

  if (datainicio && datafim && new Date(datainicio) > new Date(datafim)) {
    return NextResponse.json({ error: "'datainicio' não pode ser maior que 'datafim'." }, { status: 400 });
  }

  if (origem && origem !== 'email' && origem !== 'telefone') {
    return NextResponse.json({ error: "Origem deve ser 'email' ou 'telefone'." }, { status: 400 });
  }

  if (easycode && (isNaN(Number(easycode)) || easycode.length !== 9)) {
    return NextResponse.json({ error: "Easycode deve ser um número e com nove caracteres." }, { status: 400 });
  }

  const offset = (page - 1) * limit;

  try {
    const pool = await connectPumaDb();
    const request = pool.request();

    let where = `resultado <> '0' AND resultado <> 'K'`;

    if (datainicio) {
      where += ` AND datacontacto >= @datainicio`;
      request.input('datainicio', sql.DateTime, new Date(datainicio));
    }

    if (datafim) {
      where += ` AND datacontacto <= @datafim`;
      request.input('datafim', sql.DateTime, new Date(datafim));
    }
    if (easycode) {
      where += ` AND easycode = @easycode`;
      request.input('easycode', sql.Int, Number(easycode));
    }
    if (origem) {
      const campo = origem === 'email' ? 'info_email' : 'tel_marcado';
      where += ` AND ${campo} IS NOT NULL AND ${campo} <> ''`;
    }

    const query = `
      SELECT *
      FROM ${process.env.DB_CLIENT}
      WHERE ${where}
      ORDER BY datacontacto DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `;

    const result = await request.query(query);

    const records = result.recordset.map(record => ({
      resultado: resultsTranslater[record.resultado] || record.resultado,
      easycode: record.easycode,
      datacontacto: record.datacontacto,
      tel_marcado: record.tel_marcado,
      nif: record.nif,
      empresa: record.empresa,
      nome: record.nome,
      telemovel: record.telemovel,
      situacao: record.situacao,
      observacoes: record.observacoes,
      info_email: record.info_email,
      envio_email: record.envio_email,
      enderecoemail: record.enderecoemail,
      tipo_cliente: record.tipo_cliente,
      origem: record.tipificacao_3,
    }));

    return NextResponse.json({
      page,
      limit,
      count: records.length,
      data: records,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao conectar ou consultar o banco.', detail: err.message }, { status: 500 });
  }
}
