import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import { OwnerTypeEnum } from "./GoContact/GetCreateReportGoContact";

export async function downloadExcel(
  ownerType: OwnerTypeEnum,
  report: any[]
): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Relatório");

  const titleBlue = "FFFF6600";
  const titleOrange = "FFFF7F33";

  if (ownerType === OwnerTypeEnum.Campaign) {
    worksheet.columns = [
      { header: "Data", key: "date", width: 20 },
      { header: "Vendas", key: "sales", width: 10 },
      { header: "Venda/Serviços", key: "services_sales", width: 20 },
      { header: "Não Interessados", key: "not_interested", width: 18 },
      { header: "Fechados", key: "closed", width: 12 },
      { header: "Tx/Concretização", key: "conversion_rate", width: 18 },
      { header: "E2E", key: "e2e", width: 10 },
      { header: "Tx/Serviço", key: "service_rate", width: 15 },
    ];

    report.forEach((item) => {
      worksheet.addRow({
        date: item.date,
        sales: Number(item.sales),
        services_sales: Number(item.services_sales),
        not_interested: Number(item.not_interested),
        closed: Number(item.closed),
        conversion_rate: Number(item.conversion_rate),
        e2e: Number(item.e2e),
        service_rate: Number(item.service_rate),
      });
    });
  }

  if (ownerType === OwnerTypeEnum.Queue) {
    worksheet.columns = [
      { header: "Data", key: "date", width: 20 },
      { header: "Total chamadas", key: "total_calls", width: 25 },
      { header: "Chamadas atendidas", key: "answered_calls", width: 30 },
      { header: "Vendas", key: "sales", width: 10 },
      { header: "Venda/Serviços", key: "services_sales", width: 20 },
      { header: "SLA <= 60s", key: "sla_60s", width: 20 },
      { header: "SLA Atendidas", key: "sla_atendidas", width: 25 },
      { header: "Tempo médio de espera", key: "avg_wait_time", width: 30 },
      { header: "SLA ERSE", key: "sla_erse", width: 15 },
      { header: "Tx/concretização", key: "tx_concretizacao", width: 30 },
    ]

    report.forEach((item) => {
      worksheet.addRow({
        date: item.date,
        total_calls: Number(item.total_calls),
        sales: Number(item.sales),
        services_sales: Number(item.services_sales),
        answered_calls: Number(item.answered_calls),
        sla_60s: Number(item.sla_60s),
        sla_atendidas: Number(item.sla_atendidas),
        avg_wait_time: Number(item.avg_wait_time),
        sla_erse: Number(item.sla_erse),
        tx_concretizacao: Number(item.tx_concretizacao),
      });
    });
  }

  // Estilo do Header
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: titleBlue },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Formatação das células
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      // Pintar coluna Data
      if (colNumber === 1 && rowNumber > 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: titleOrange },
        };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
      }

      const percentColsQueue = [6, 7, 9, 10];
    const percentColsCampaign = [6, 7, 8]; 

    if (rowNumber > 1) {
      if (
        (ownerType === OwnerTypeEnum.Queue && percentColsQueue.includes(colNumber)) ||
        (ownerType === OwnerTypeEnum.Campaign && percentColsCampaign.includes(colNumber))
      ) {
        cell.numFmt = '0.00 "%"';
      }

      if (ownerType === OwnerTypeEnum.Queue && colNumber === 8) {
        cell.numFmt = '0 "s"';
      }
    }
    });
  });

  let totalsRow: any[] = [];
  const campaignType =
    (ownerType === OwnerTypeEnum.Queue && "Inbound") ||
    (ownerType === OwnerTypeEnum.Campaign && "Outbound");

  if (ownerType === OwnerTypeEnum.Queue) {
    totalsRow = [
      `Total ${campaignType}`,
      report.reduce((sum, row) => sum + parseInt(row.total_calls || "0"), 0),
      report.reduce((sum, row) => sum + parseInt(row.answered_calls || "0"), 0),
      report.reduce((sum, row) => sum + parseInt(row.sales || "0"), 0),
      report.reduce((sum, row) => sum + parseInt(row.services_sales || "0"), 0),
      `${(
        report.reduce((sum, row) => sum + parseFloat(row.sla_60s || "0"), 0) /
        report.length
      ).toFixed(2)} %`,
      `${(
        report.reduce((sum, row) => sum + parseFloat(row.sla_atendidas || "0"), 0) /
        report.length
      ).toFixed(2)} %`,
      `${(
        report.reduce((sum, row) => sum + parseFloat(row.avg_wait_time || "0"), 0) /
        report.length
      ).toFixed(0)} s`,
      `${(
        report.reduce((sum, row) => sum + parseFloat(row.sla_erse || "0"), 0) /
        report.length
      ).toFixed(2)} %`,
      `${(
        report.reduce((sum, row) => sum + parseFloat(row.tx_concretizacao || "0"), 0) /
        report.length
      ).toFixed(2)} %`,
    ];
  }

  if (ownerType === OwnerTypeEnum.Campaign) {
    totalsRow = [
      `Total ${campaignType}`,
      report.reduce((sum, row) => sum + parseInt(row.sales || "0"), 0),
      report.reduce((sum, row) => sum + parseInt(row.services_sales || "0"), 0),
      report.reduce((sum, row) => sum + parseInt(row.not_interested || "0"), 0),
      report.reduce((sum, row) => sum + parseInt(row.closed || "0"), 0),
      `${(
        report.reduce(
          (sum, row) => sum + parseFloat(row.conversion_rate || "0"),
          0
        ) / report.length
      ).toFixed(2)} %`,
      `${(
        report.reduce((sum, row) => sum + parseFloat(row.e2e || "0"), 0) /
        report.length
      ).toFixed(2)} %`,
      `${(
        report.reduce((sum, row) => sum + parseFloat(row.service_rate || "0"), 0) /
        report.length
      ).toFixed(2)} %`,
    ];
  }

  worksheet.addRow(totalsRow).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: titleBlue },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Salvar arquivo
  const fileName = `${new Date()
    .toISOString()
    .slice(0, 19)
    .replace(/[-T:]/g, "")}${ownerType}.xlsx`;
  const TMP_PATH = path.join(process.cwd(), "tmp", fileName);

  if (!fs.existsSync(path.dirname(TMP_PATH))) {
    fs.mkdirSync(path.dirname(TMP_PATH), { recursive: true });
  }

  await workbook.xlsx.writeFile(TMP_PATH);

  return fileName;
}
