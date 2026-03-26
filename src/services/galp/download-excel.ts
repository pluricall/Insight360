import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import { OwnerTypeEnum } from "./go-contact/generate-report";
import { groupByDateAndService } from "./group-services-by-date";

export async function downloadExcel(
  ownerType: OwnerTypeEnum,
  report: any[],
  servicesReport: any[] = []
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
      { header: "Abandonos >= 60s", key: "abandon_60s", width: 20 },
      { header: "Atendidas <= 60s", key: "answered_60s", width: 20 },
      { header: "Tempo médio de espera", key: "avg_wait_time", width: 25 },
      { header: "SLA <= 60s", key: "sla_60s", width: 20 },
      { header: "SLA Atendidas", key: "sla_atendidas", width: 25 },
      { header: "SLA ERSE", key: "sla_erse", width: 15 },
      { header: "Tx/concretização", key: "tx_concretizacao", width: 25 },
    ];

    report.forEach((item) => {
      worksheet.addRow({
        date: item.date,
        total_calls: Number(item.total_calls),
        answered_calls: Number(item.answered_calls),
        sales: Number(item.sales),
        services_sales: Number(item.services_sales),
        abandon_60s: isNaN(Number(item.abandon_60s)) ? 0 : Number(item.abandon_60s),
        answered_60s: Number(item.answered_60s),
        avg_wait_time: Number(item.avg_wait_time),
        sla_60s: Number(item.sla_60s),
        sla_atendidas: Number(item.sla_atendidas),
        sla_erse: Number(item.sla_erse),
        tx_concretizacao: Number(item.tx_concretizacao),
      });
    });
  }

  if (ownerType === OwnerTypeEnum.SideBySide) {
    worksheet.columns = [
      { header: "Data", key: "date", width: 20 },
      { header: "Total chamadas", key: "total_calls", width: 25 },
      { header: "Chamadas atendidas", key: "answered_calls", width: 30 },
      { header: "Vendas", key: "sales", width: 10 },
      { header: "Venda/Serviços", key: "services_sales", width: 20 },
      { header: "Abandonos >= 60s", key: "abandon_60s", width: 20 },
      { header: "Atendidas <= 60s", key: "answered_60s", width: 20 },
      { header: "Tempo médio de espera", key: "avg_wait_time", width: 25 },
      { header: "SLA <= 60s", key: "sla_60s", width: 20 },
      { header: "SLA Atendidas", key: "sla_atendidas", width: 25 },
      { header: "SLA ERSE", key: "sla_erse", width: 15 },
      { header: "Tx/concretização", key: "tx_concretizacao", width: 25 },
    ];

    report.forEach((item) => {
      worksheet.addRow({
        date: item.date,
        total_calls: Number(item.total_calls),
        answered_calls: Number(item.answered_calls),
        sales: Number(item.sales),
        services_sales: Number(item.services_sales),
        abandon_60s: isNaN(Number(item.abandon_60s)) ? 0 : Number(item.abandon_60s),
        answered_60s: Number(item.answered_60s),
        avg_wait_time: Number(item.avg_wait_time),
        sla_60s: Number(item.sla_60s),
        sla_atendidas: Number(item.sla_atendidas),
        sla_erse: Number(item.sla_erse),
        tx_concretizacao: Number(item.tx_concretizacao),
      });
    });
  }

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

      const percentColsQueue = [9, 10, 11, 12];
      const percentColsCampaign = [6, 7, 8];

      if (rowNumber > 1) {
        if (
          (ownerType === OwnerTypeEnum.Campaign && percentColsCampaign.includes(colNumber)) ||
          (ownerType === OwnerTypeEnum.Queue && percentColsQueue.includes(colNumber)) ||
          (ownerType === OwnerTypeEnum.SideBySide && percentColsQueue.includes(colNumber))
        ) {
          cell.numFmt = '0.00 "%"';
        }

        if (ownerType === OwnerTypeEnum.Queue && colNumber === 8 || ownerType === OwnerTypeEnum.SideBySide && colNumber === 8) {
          cell.numFmt = '0 "s"';
        }
      }
    });
  });

  let totalsRow: any[] = [];
  const campaign_type =
    (ownerType === OwnerTypeEnum.Queue && "Inbound") ||
    (ownerType === OwnerTypeEnum.Campaign && "Outbound") ||
    (ownerType === OwnerTypeEnum.SideBySide && "Side By Side")

  if (ownerType === OwnerTypeEnum.Queue) {
    const totalCalls = report.reduce((sum, row) => sum + parseInt(row.total_calls || "0"), 0);
    const totalAnswered = report.reduce((sum, row) => sum + parseInt(row.answered_calls || "0"), 0);
    const totalSales = report.reduce((sum, row) => sum + parseInt(row.sales || "0"), 0);
    const totalServiceSales = report.reduce((sum, row) => sum + parseInt(row.services_sales || "0"), 0);

    const avgWaitTime = report.reduce((sum, row) => sum + parseFloat(row.avg_wait_time || "0"), 0) / report.length;
    const abandonMoreThan60s = report.reduce((sum, row) => sum + parseFloat(row.abandon_60s || "0"), 0)
    const answered_60s = report.reduce((sum, row) => sum + parseFloat(row.answered_60s || "0"), 0)

    const avgTxConcretizacao = (totalSales / totalAnswered) * 100;
    const avgSLA60s = (answered_60s / totalAnswered) * 100;
    const avgSLAAtendidas = (totalAnswered / totalCalls) * 100;
    const avgSLAErse = (answered_60s / (totalAnswered + abandonMoreThan60s)) * 100;


    totalsRow = [
      `Total ${campaign_type}`,
      totalCalls,
      totalAnswered,
      totalSales,
      totalServiceSales,
      abandonMoreThan60s,
      answered_60s,
      `${avgWaitTime.toFixed(0)} s`,
      `${avgSLA60s.toFixed(2)} %`,
      `${avgSLAAtendidas.toFixed(2)} %`,
      `${avgSLAErse.toFixed(2)} %`,
      `${avgTxConcretizacao.toFixed(2)} %`,
    ];
  }

  if (ownerType === OwnerTypeEnum.SideBySide) {
    const totalCalls = report.reduce((sum, row) => sum + parseInt(row.total_calls || "0"), 0);
    const totalAnswered = report.reduce((sum, row) => sum + parseInt(row.answered_calls || "0"), 0);
    const totalSales = report.reduce((sum, row) => sum + parseInt(row.sales || "0"), 0);
    const totalServiceSales = report.reduce((sum, row) => sum + parseInt(row.services_sales || "0"), 0);

    const avgWaitTime = report.reduce((sum, row) => sum + parseFloat(row.avg_wait_time || "0"), 0) / report.length;
    const abandonMoreThan60s = report.reduce((sum, row) => sum + parseFloat(row.abandon_60s || "0"), 0)
    const answered_60s = report.reduce((sum, row) => sum + parseFloat(row.answered_60s || "0"), 0)

    const avgTxConcretizacao = (totalSales / totalAnswered) * 100;
    const avgSLA60s = (answered_60s / totalAnswered) * 100;
    const avgSLAAtendidas = (totalAnswered / totalCalls) * 100;
    const avgSLAErse = (answered_60s / (totalAnswered + abandonMoreThan60s)) * 100;


    totalsRow = [
      `Total ${campaign_type}`,
      totalCalls,
      totalAnswered,
      totalSales,
      totalServiceSales,
      abandonMoreThan60s,
      answered_60s,
      `${avgWaitTime.toFixed(0)} s`,
      `${avgSLA60s.toFixed(2)} %`,
      `${avgSLAAtendidas.toFixed(2)} %`,
      `${avgSLAErse.toFixed(2)} %`,
      `${avgTxConcretizacao.toFixed(2)} %`,
    ];
  }

  if (ownerType === OwnerTypeEnum.Campaign) {
    const totalSales = report.reduce((sum, row) => sum + parseInt(row.sales || "0"), 0);
    const totalServiceSales = report.reduce((sum, row) => sum + parseInt(row.services_sales || "0"), 0);
    const totalNotInterested = report.reduce((sum, row) => sum + parseInt(row.not_interested || "0"), 0);
    const totalClosed = report.reduce((sum, row) => sum + parseInt(row.closed || "0"), 0);

    const totalServiceRate = totalSales > 0
      ? (totalServiceSales * 100) / totalSales
      : 0;

    const totalE2E = totalClosed > 0 ? (totalSales * 100) / totalClosed : 0;

    const totalConversionRateDenominator = totalSales + totalNotInterested;
    const totalConversionRate = totalConversionRateDenominator > 0
      ? (totalSales * 100) / totalConversionRateDenominator
      : 0;

    totalsRow = [
      `Total ${campaign_type}`,
      totalSales,
      totalServiceSales,
      totalNotInterested,
      totalClosed,
      `${totalConversionRate.toFixed(2)} %`,
      `${totalE2E.toFixed(2)} %`,
      `${totalServiceRate.toFixed(2)} %`,
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

  if (servicesReport.length > 0) {
    // Espaço entre tabelas
    worksheet.addRow([]);
    worksheet.addRow([]);

    const startRow = worksheet.lastRow!.number + 1;

    const { services, rows } = groupByDateAndService(servicesReport);

    // Adiciona cabeçalho
    worksheet.addRow(["Data", ...services]);

    const headerRow = worksheet.getRow(startRow);
    headerRow.eachCell((cell, colNumber) => {
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
      // Pintar a coluna "Data" de laranja
      if (colNumber === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: titleOrange },
        };
      }
    });

    // Adiciona as linhas de dados
    rows.forEach((row) => {
      const excelRow = worksheet.addRow([row.date, ...services.map((s) => row[s])]);
      excelRow.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        // Pintar coluna Data de laranja
        if (colNumber === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: titleOrange },
          };
          cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
        }
      });
    });
  }


  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `${dateStr}_${ownerType}.xlsx`;
  const TMP_PATH = path.join(process.cwd(), "tmp", fileName);

  if (!fs.existsSync(path.dirname(TMP_PATH))) {
    fs.mkdirSync(path.dirname(TMP_PATH), { recursive: true });
  }

  await workbook.xlsx.writeFile(TMP_PATH);

  return fileName;
}
