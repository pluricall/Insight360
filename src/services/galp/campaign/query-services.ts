import { prisma } from "@/lib/prisma";

export interface CampaignServiceRow {
  date: string;
  service: string;
  total: number;
}

export async function queryCampaignServices(): Promise<CampaignServiceRow[]> {
  return prisma.$queryRaw<CampaignServiceRow[]>`
    SELECT
      TO_CHAR(DATE_TRUNC('day', call_start), 'DD/MM/YYYY') AS "date",

      trim(
        CASE
          -- VENDA COM SERVIÇO GALP
          WHEN servicos_assistencia LIKE '%Galp%' THEN
            regexp_replace(servicos_assistencia, '\s*,\s*', ', ', 'g')
            || ' + '
            || COALESCE(NULLIF(produtos_vendidos, ''), 'NA')

          -- VENDA SEM SERVIÇO (produto puro)
          ELSE
            COALESCE(NULLIF(produtos_vendidos, ''), 'NA')
        END
      ) AS service,

      COUNT(*) AS total
    FROM public."GalpOutboundSchema"
    WHERE call_outcome_group = 'Venda'
    GROUP BY "date", service
    ORDER BY "date", total DESC;
  `;
}
