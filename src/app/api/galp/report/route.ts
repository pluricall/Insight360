import { downloadExcel } from "@/services/Galp/DownloadExcelGalp";
import { CreateReportGoContact, OwnerTypeEnum } from "@/services/Galp/GoContact/GetCreateReportGoContact";
import { DownloadReportGoContact } from "@/services/Galp/GoContact/GetDownloadReportGoContact";
import { GetTemplateGoConctact } from "@/services/Galp/GoContact/GetTemplateGoContact";
import { processCSV } from "@/services/Galp/ProcessGalpCSV";
import { QueryReportGalp } from "@/services/Galp/QueryReportGalp";
import fs from "fs";
import { NextResponse } from "next/server";

export interface GalpReportProps {
  ownerType: OwnerTypeEnum
  endDate: string
  startDate: string
}

export async function POST(req: Request) {
  try {
    const { startDate, endDate, ownerType }: GalpReportProps = await req.json();
    
    const { templateId, ownerIds } = await GetTemplateGoConctact(ownerType);
    const reportName = await CreateReportGoContact({
      startDate,
      endDate,
      ownerType,
      templateId,
      ownerIds,
    });

    const filePath = await DownloadReportGoContact(reportName);

    await processCSV(filePath, ownerType);
    const resultsOfQuery = await QueryReportGalp(ownerType)
    const excelFilePath = await downloadExcel(
      ownerType,
      resultsOfQuery
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
