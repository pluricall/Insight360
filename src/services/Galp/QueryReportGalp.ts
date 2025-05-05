import { prisma } from "@/lib/prisma";
import { OwnerTypeEnum } from "./GoContact/GetCreateReportGoContact";

export async function QueryReportGalp(ownerType: OwnerTypeEnum) {
    let queryReport: any[] = [];

    if (ownerType === OwnerTypeEnum.Campaign) {
        queryReport = await prisma.$queryRaw` 
    SELECT
    TO_CHAR(DATE_TRUNC('day', call_start), 'DD/MM/YYYY') AS date,
    
    SUM(CASE WHEN call_outcome_group = 'Venda' THEN 1 ELSE 0 END) AS sales, 

    SUM(CASE WHEN call_outcome_group = 'Util/Não Interessado' THEN 1 ELSE 0 END) AS not_interested,

    SUM(CASE WHEN call_outcome_group IN ('Venda', 'Util/Não Interessado', 'Dificuldade') THEN 1 ELSE 0 END) AS closed,

    ROUND(
    (SUM(CASE WHEN call_outcome_group = 'Venda' THEN 1 ELSE 0 END) * 100.0) / 
    NULLIF(SUM(CASE WHEN call_outcome_group IN ('Venda', 'Util/Não Interessado') THEN 1 ELSE 0 END), 0),
    2) AS conversion_rate,

    ROUND(
        CASE 
            WHEN SUM(CASE WHEN call_outcome_group IN ('Venda', 'Util/Não Interessado', 'Dificuldade') THEN 1 ELSE 0 END) > 0 
            THEN (SUM(CASE WHEN call_outcome_group = 'Venda' THEN 1 ELSE 0 END) * 100.0 / 
                  SUM(CASE WHEN call_outcome_group IN ('Venda', 'Util/Não Interessado', 'Dificuldade') THEN 1 ELSE 0 END)) 
            ELSE 0 
        END, 
    2) AS e2e,

    SUM(CASE WHEN servicos_assistencia LIKE '%Galp%' THEN 1 ELSE 0 END) AS services_sales,

    ROUND(
        CASE 
            WHEN SUM(CASE WHEN call_outcome_group = 'Venda' THEN 1 ELSE 0 END) > 0 
            THEN (SUM(CASE WHEN servicos_assistencia LIKE '%Galp%' THEN 1 ELSE 0 END) * 100.0 / 
                  SUM(CASE WHEN call_outcome_group = 'Venda' THEN 1 ELSE 0 END)) 
            ELSE 0 
        END, 
    2) AS service_rate
    
    FROM public."GalpOutboundSchema"
    GROUP BY DATE_TRUNC('day', call_start)  
    ORDER BY DATE_TRUNC('day', call_start); 
    `;
        await prisma.galpOutboundSchema.deleteMany({});
    }


    if (ownerType === OwnerTypeEnum.Queue) {
        queryReport = await prisma.$queryRaw`
      SELECT 
    TO_CHAR(DATE_TRUNC('day', call_start), 'DD/MM/YYYY') AS date,

    COUNT(DISTINCT call_uuid) FILTER (
    WHERE term_reason NOT IN ('ABANDON', 'OUT_OF_SCHEDULE')
    AND NOT (queue_time <= 0)
    AND owner_name NOT LIKE '%Callback%'
    AND owner_name NOT LIKE '%Outbound Puro%'
) AS total_calls,

    COUNT(DISTINCT call_uuid) FILTER (
        WHERE term_reason NOT IN ('ABANDON', 'NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER') 
        AND talk_time > 0
        AND owner_name NOT LIKE '%Callback%'
        AND owner_name NOT LIKE '%Outbound Puro%'
    ) AS answered_calls,

    SUM(CASE 
        WHEN call_outcome_group = 'Venda' 
        AND (
            owner_name NOT LIKE '%Outbound Puro%' 
        ) THEN 1 ELSE 0 
    END) AS sales,

    SUM(CASE 
        WHEN servicos_assistencia LIKE '%Galp%' 
        AND (
            owner_name NOT LIKE '%Outbound Puro%' 
        ) THEN 1 ELSE 0 
    END) AS services_sales,

    ROUND(
    COUNT(DISTINCT call_uuid) FILTER (
        WHERE term_reason NOT IN ('ABANDON', 'NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER') 
        AND talk_time > 0
        AND queue_time <= 60
        AND owner_name NOT LIKE '%Callback%'
        AND owner_name NOT LIKE '%Outbound Puro%'
    ) * 100.0 / 
    NULLIF(COUNT(DISTINCT call_uuid) FILTER (
        WHERE term_reason != 'ABANDON'
        AND NOT (queue_time <= 0)
        AND owner_name NOT LIKE '%Callback%'
        AND owner_name NOT LIKE '%Outbound Puro%'
    ), 0),
    2
) AS SLA_60s,

    ROUND(
        (COUNT(DISTINCT call_uuid) FILTER (
        WHERE term_reason NOT IN ('ABANDON', 'NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER') 
        AND talk_time > 0
        AND owner_name NOT LIKE '%Callback%'
        AND owner_name NOT LIKE '%Outbound Puro%'
        ) * 100.0) / 
        NULLIF(COUNT(DISTINCT call_uuid) FILTER (
        WHERE term_reason NOT IN ('ABANDON', 'OUT_OF_SCHEDULE')
    AND NOT (queue_time <= 0)
    AND owner_name NOT LIKE '%Callback%'
    AND owner_name NOT LIKE '%Outbound Puro%'
), 0), 
    2) AS SLA_ATENDIDAS,

    ROUND(AVG(queue_time) FILTER (
        WHERE owner_name NOT LIKE '%Callback%'
        AND owner_name NOT LIKE '%Outbound Puro%'
    )) AS AVG_WAIT_TIME,

    ROUND(
        COUNT(DISTINCT call_uuid) FILTER (
        WHERE term_reason NOT IN ('ABANDON', 'NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER') 
        AND talk_time > 0 AND queue_time <= 60
        AND owner_name NOT LIKE '%Callback%'
        AND owner_name NOT LIKE '%Outbound Puro%'
        ) * 100.0 /
        NULLIF(
            COUNT(DISTINCT call_uuid) FILTER (
        WHERE term_reason NOT IN ('ABANDON', 'NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER') 
        AND talk_time > 0
        AND owner_name NOT LIKE '%Callback%'
        AND owner_name NOT LIKE '%Outbound Puro%'
        ) + 
            COUNT(*) FILTER (
                WHERE term_reason = 'ABANDON' 
                AND queue_time > 60
                AND owner_name NOT LIKE '%Callback%'
                AND owner_name NOT LIKE '%Outbound Puro%'
            ),
        0),
    2) AS SLA_ERSE,

    ROUND(
        (SUM(CASE 
            WHEN call_outcome_group = 'Venda' THEN 1 ELSE 0 
        END) * 100.0) / 
        NULLIF( COUNT(DISTINCT call_uuid) FILTER (
        WHERE term_reason NOT IN ('ABANDON', 'NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER') 
        AND talk_time > 0
        AND owner_name NOT LIKE '%Callback%'
        AND owner_name NOT LIKE '%Outbound Puro%'
        ), 0),
    2) AS TX_CONCRETIZACAO

FROM 
    public."GalpInboundSchema"

GROUP BY 
    DATE_TRUNC('day', call_start)

HAVING 
    COUNT(*) FILTER (WHERE talk_time > 0) > 0  
    OR ROUND(AVG(talk_time) FILTER (
        WHERE call_outcome_name NOT IN ('', 'Press To Callback', 'Press to Inbound Queue', 'Queue Abandon')
        AND call_uuid IS NOT NULL
    ), 0) > 0

ORDER BY 
    DATE_TRUNC('day', call_start);
    `;

        await prisma.galpInboundSchema.deleteMany({});
    }
    return queryReport;
}
/*SELECT
TO_CHAR(DATE_TRUNC('day', call_start), 'DD/MM/YYYY') AS date,
 
COUNT(*) FILTER (WHERE queue_time > 0) AS total_calls,

COUNT(*) FILTER (WHERE call_outcome_group <> 'System' AND queue_time > 0) AS answered_calls,

SUM(CASE WHEN call_outcome_group = 'Venda' THEN 1 ELSE 0 END) AS sales,
SUM(CASE WHEN servicos_assistencia LIKE '%Galp%' THEN 1 ELSE 0 END) AS services_sales,

ROUND(
CASE 
WHEN SUM(CASE WHEN call_outcome_group <> 'System' AND queue_time > 0 THEN 1 ELSE 0 END) = 0 THEN 0
ELSE (
SUM(CASE 
      WHEN call_outcome_group <> 'System' 
       AND queue_time > 0 
       AND queue_time <= 60 
    THEN 1 ELSE 0 
    END
) * 100.0
) 
/ 
SUM(CASE WHEN call_outcome_group <> 'System' AND queue_time > 0 THEN 1 ELSE 0 END)
END,
2
) AS SLA_60s,

ROUND(
(COUNT(*) FILTER (WHERE call_outcome_group <> 'System' AND queue_time > 0) * 100.0) / 
NULLIF(
  COUNT(*) FILTER (WHERE call_outcome_group <> 'System' AND queue_time > 0) + 
  COUNT(*) FILTER (WHERE term_reason = 'ABANDON' AND queue_time > 0), 
0), 
2) AS SLA_ATENDIDAS,

AVG(wait_time) FILTER (
  WHERE owner_name NOT LIKE '%Callback%'
  AND owner_name NOT LIKE '%Outbound Puro%'
) AS AVG_WAIT_TIME,

ROUND(
(COUNT(*) FILTER (WHERE call_outcome_group <> 'System' AND queue_time <= 60) * 100.0) /
NULLIF(
  COUNT(*) FILTER (WHERE call_outcome_group <> 'System') +
  COUNT(*) FILTER (WHERE term_reason = 'ABANDON' AND queue_time > 60),
0),
2) AS SLA_ERSE,

ROUND(
  (SUM(CASE WHEN call_outcome_group = 'Venda' THEN 1 ELSE 0 END) * 100.0) / 
  NULLIF(SUM(CASE WHEN call_outcome_group <> 'System' THEN 1 ELSE 0 END), 0),
2) AS TX_CONCRETIZACAO

FROM 
public."GalpInboundSchema"
GROUP BY 
DATE_TRUNC('day', call_start)  
HAVING 
COUNT(*) FILTER (WHERE queue_time > 0) > 0 
OR COUNT(*) FILTER (WHERE call_outcome_group <> 'System' AND queue_time > 0) > 0 
OR ROUND(AVG(queue_time) FILTER (
  WHERE call_outcome_name NOT IN ('', 'Press To Callback', 'Press to Inbound Queue', 'Queue Abandon')
  AND call_uuid IS NOT NULL
), 0) > 0
ORDER BY 
DATE_TRUNC('day', call_start);

call_outcome_group = 'Venda' / WHERE term_reason NOT IN ('ABANDON', 'NO_AGENTS_LOGGED', 'OUT_OF_SCHEDULE', 'PRESS_TO_QUEUE_TRANSFER') 
      AND talk_time > 0
      AND owner_name NOT LIKE '%Callback%'
      AND owner_name NOT LIKE '%Outbound Puro%'  AS CONCRETIZAÇÃO*/
