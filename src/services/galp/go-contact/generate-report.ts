import axios from "axios";

export enum OwnerTypeEnum {
  Queue = "queue",
  Campaign = "campaign",
  SideBySide = "sideBySide"
}

export interface GenerateReportGoContactParams {
  startDate: string;
  endDate: string;
  ownerType: OwnerTypeEnum;
  templateId: number;
  ownerId: number[];
  token: string
}

interface GoContactCreateReportResponse {
  reportJobId: string,
  domainUuid: string
}

function formatDate(date: string | Date) {
  const d = new Date(date);

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

export async function generateReportGoContact({
  startDate,
  endDate,
  ownerType,
  templateId,
  ownerId,
  token
}: GenerateReportGoContactParams): Promise<GoContactCreateReportResponse> {
  try {
    const ownerTypeToSend =
      ownerType === OwnerTypeEnum.SideBySide
        ? "queue"
        : ownerType;

    const { data } = await axios.post<GoContactCreateReportResponse>('https://galp.gocontact.com/poll/api/reportdesigner/generateReport', {
      api_download: true,
      ownerType: ownerTypeToSend,
      ownerId,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dataType: 0,
      templateId: Number(templateId),
      includeALLOwners: false,
    },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    return { domainUuid: data.domainUuid, reportJobId: data.reportJobId }
  } catch (error) {
    console.error("Erro ao criar relatório:", error);
    throw error;
  }
}
