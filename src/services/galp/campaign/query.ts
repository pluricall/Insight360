import { prisma } from "@/lib/prisma";

export interface CampaignReportRow {
    date: string;
    sales: number;
    not_interested: number;
    closed: number;
    conversion_rate: number;
    e2e: number;
    services_sales: number;
    service_rate: number;
}

export async function queryReportCampaign(): Promise<CampaignReportRow[]> {
    const result = await prisma.$queryRaw<CampaignReportRow[]>` 
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
    return result;
}