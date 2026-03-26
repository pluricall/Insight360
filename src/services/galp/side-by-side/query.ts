import { prisma } from "@/lib/prisma";

export interface SideBySideReportRow {
  date: string;
  total_calls: number;
  answered_calls: number;
  sales: number;
  services_sales: number;
  SLA_60s: number;
  SLA_ATENDIDAS: number;
  AVG_WAIT_TIME: number;
  abandon_60s: number;
  ANSWERED_60S: number;
  SLA_ERSE: number;
  TX_CONCRETIZACAO: number;
}

export async function queryReportSideBySide(): Promise<SideBySideReportRow[]> {
  const result = await prisma.$queryRaw<SideBySideReportRow[]>`
    SELECT 
      TO_CHAR(DATE_TRUNC('day', call_start), 'DD/MM/YYYY') AS date,

      COUNT(DISTINCT call_uuid) FILTER (
        WHERE term_reason NOT IN ('NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER')
        AND queue_time > 0
        AND owner_name IN ('Atendimento || G&P || Sales || Side by Side [p]', 
                           'Callback || G&P || Sales || Side by Side')
      ) AS total_calls,

      COUNT(DISTINCT call_uuid) FILTER (
        WHERE term_reason NOT IN ('ABANDON', 'NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER') 
        AND talk_time > 0
        AND owner_name IN ('Atendimento || G&P || Sales || Side by Side [p]', 
                           'Callback || G&P || Sales || Side by Side')
      ) AS answered_calls,

      SUM(CASE 
        WHEN call_outcome_group = 'Venda'
        AND owner_name IN ('Atendimento || G&P || Sales || Side by Side [p]', 
                           'Callback || G&P || Sales || Side by Side')
        THEN 1 ELSE 0 
      END) AS sales,

      SUM(CASE 
        WHEN servicos_assistencia LIKE '%Galp%' 
        AND owner_name IN ('Atendimento || G&P || Sales || Side by Side [p]', 
                           'Callback || G&P || Sales || Side by Side')
        THEN 1 ELSE 0 
      END) AS services_sales,

      ROUND(
        COUNT(DISTINCT call_uuid) FILTER (
          WHERE term_reason NOT IN ('ABANDON','NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER') 
          AND talk_time > 0 AND queue_time <= 60
          AND owner_name IN ('Atendimento || G&P || Sales || Side by Side [p]', 
                             'Callback || G&P || Sales || Side by Side')
        ) * 100.0 / 
        NULLIF(
          COUNT(DISTINCT call_uuid) FILTER (
            WHERE term_reason NOT IN ('ABANDON', 'NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER')
            AND talk_time > 0
            AND owner_name IN ('Atendimento || G&P || Sales || Side by Side [p]', 
                               'Callback || G&P || Sales || Side by Side')
          ), 
        0),
      2
      ) AS SLA_60s,

      ROUND(
        (COUNT(DISTINCT call_uuid) FILTER (
          WHERE term_reason NOT IN ('ABANDON', 'NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER') 
          AND talk_time > 0
        ) * 100.0) / 
        NULLIF(
          COUNT(DISTINCT call_uuid) FILTER (
            WHERE term_reason NOT IN ('NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER')
            AND queue_time > 0
          ), 
        0), 
        2
      ) AS SLA_ATENDIDAS,

      ROUND(AVG(queue_time) FILTER (
        WHERE term_reason NOT IN ('ABANDON', 'NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER')
      ), 0) AS AVG_WAIT_TIME,

      COUNT(DISTINCT call_uuid) FILTER (
        WHERE term_reason = 'ABANDON'
        AND queue_time >= 60
        AND owner_name IN ('Atendimento || G&P || Sales || Side by Side [p]', 
                           'Callback || G&P || Sales || Side by Side')
      ) AS abandon_60s,

      COUNT(DISTINCT call_uuid) FILTER (
        WHERE term_reason NOT IN ('ABANDON', 'NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER') 
        AND talk_time > 0 AND queue_time <= 60
        AND owner_name IN ('Atendimento || G&P || Sales || Side by Side [p]', 
                           'Callback || G&P || Sales || Side by Side')
      ) AS answered_60s,

      ROUND(
        COUNT(DISTINCT call_uuid) FILTER (
          WHERE term_reason NOT IN ('ABANDON', 'NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER') 
          AND talk_time > 0 AND queue_time <= 60
          AND owner_name IN ('Atendimento || G&P || Sales || Side by Side [p]', 
                             'Callback || G&P || Sales || Side by Side')
        ) * 100.0 /
        NULLIF(
          COUNT(DISTINCT call_uuid) FILTER (
            WHERE term_reason NOT IN ('ABANDON', 'NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER') 
            AND talk_time > 0
            AND owner_name IN ('Atendimento || G&P || Sales || Side by Side [p]', 
                               'Callback || G&P || Sales || Side by Side')
          )
          + COUNT(*) FILTER (
              WHERE term_reason = 'ABANDON' AND queue_time > 60
              AND owner_name IN ('Atendimento || G&P || Sales || Side by Side [p]', 
                                 'Callback || G&P || Sales || Side by Side')
            ),
        0),
      2
      ) AS SLA_ERSE,

      ROUND(
        (SUM(CASE 
          WHEN call_outcome_group = 'Venda' THEN 1 ELSE 0 
        END) * 100.0) / 
        NULLIF(
          COUNT(DISTINCT call_uuid) FILTER (
            WHERE term_reason NOT IN ('ABANDON', 'NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER') 
            AND talk_time > 0
            AND owner_name IN ('Atendimento || G&P || Sales || Side by Side [p]', 
                               'Callback || G&P || Sales || Side by Side')
          ), 
        0),
      2
      ) AS TX_CONCRETIZACAO
FROM 
    public."GalpInboundSchema"
    GROUP BY DATE_TRUNC('day', call_start)
    HAVING 
      COUNT(*) FILTER (WHERE talk_time > 0) > 0  
      OR ROUND(AVG(talk_time) FILTER (
          WHERE call_outcome_name NOT IN ('', 'Press To Callback', 'Press to Inbound Queue', 'Queue Abandon')
          AND call_uuid IS NOT NULL
      ), 0) > 0
    ORDER BY DATE_TRUNC('day', call_start);
  `;

  await prisma.galpInboundSchema.deleteMany({});
  return result;
}
