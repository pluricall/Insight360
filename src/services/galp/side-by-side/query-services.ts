import { prisma } from "@/lib/prisma";

export interface SideBySideServiceRow {
  date: string;
  service: string;
  total: number;
}

export async function querySideBySideServices(): Promise<SideBySideServiceRow[]> {
  return prisma.$queryRaw<SideBySideServiceRow[]>`
   SELECT
      TO_CHAR(DATE_TRUNC('day', call_start), 'DD/MM/YYYY') AS "date",
      trim(regexp_replace(servicos_assistencia, '\s*,\s*', ', ', 'g')) AS service,
      COUNT(*) AS total
    FROM public."GalpInboundSchema"
    WHERE servicos_assistencia LIKE '%Galp%'
      AND owner_name LIKE '%Side%'
    GROUP BY DATE_TRUNC('day', call_start), service
    ORDER BY "date", total DESC;
`;
}
