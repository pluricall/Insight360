import { generateReportGoContact, OwnerTypeEnum } from "@/services/galp/go-contact/generate-report";
import { NextResponse } from "next/server";
import fs from "fs";
import {
  authenticationGoContact, CampaignReportRow, CampaignServiceRow, downloadExcel, downloadReportGoContact, getTemplateGoContact, processCsvCampaign, processCsvQueue,
  queryCampaignServices, queryQueueServices, queryReportCampaign, queryReportQueue, queryReportSideBySide, querySideBySideServices,
  QueueReportRow,
  QueueServiceRow,
  SideBySideReportRow,
  SideBySideServiceRow
} from "@/services/galp";

export interface GalpReportProps {
  ownerType: OwnerTypeEnum
  endDate: string
  startDate: string
}

export async function POST(req: Request) {
  try {
    let resultsOfQuery: CampaignReportRow[] | QueueReportRow[] | SideBySideReportRow[] = []
    let servicesReport: CampaignServiceRow[] | QueueServiceRow[] | SideBySideServiceRow[] = []

    const { token } = await authenticationGoContact({ username: process.env.GO_CONTACT_USERNAME, password: process.env.GO_CONTACT_PASSWORD })
    const { startDate, endDate, ownerType }: GalpReportProps = await req.json();
    const { templateId, ownerId } = await getTemplateGoContact({ ownerType, token });

    const { reportJobId } = await generateReportGoContact({
      startDate,
      endDate,
      ownerType,
      templateId,
      ownerId,
      token
    });

    const filePath = await downloadReportGoContact({ reportJobId, token });

    if (ownerType === OwnerTypeEnum.Campaign) {
      await processCsvCampaign(filePath);
      servicesReport = await queryCampaignServices();
      resultsOfQuery = await queryReportCampaign();
    }

    if (ownerType === OwnerTypeEnum.Queue) {
      await processCsvQueue(filePath);
      servicesReport = await queryQueueServices();
      resultsOfQuery = await queryReportQueue();
    }

    if (ownerType === OwnerTypeEnum.SideBySide) {
      await processCsvQueue(filePath);
      servicesReport = await querySideBySideServices();
      resultsOfQuery = await queryReportSideBySide();
    }

    const excelFilePath = await downloadExcel(
      ownerType,
      resultsOfQuery,
      servicesReport
    );

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Erro ao excluir o arquivo Excel:", err);
      } else {
        console.log("Arquivo Excel excluído com sucesso:", filePath);
      }
    });

    return NextResponse.json({ fileName: excelFilePath });
  } catch (error: any) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}