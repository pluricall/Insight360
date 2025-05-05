import { URLSearchParams } from "url";

export enum OwnerTypeEnum {
  Queue = "queue",
  Campaign = "campaign",
}

export interface ICreateReport {
  startDate: string;
  endDate: string;
  ownerType: OwnerTypeEnum;
  templateId: number;
  ownerIds: number[];
}

export async function CreateReportGoContact({
  startDate,
  endDate,
  ownerType,
  templateId,
  ownerIds,
}: ICreateReport): Promise<string> {
  try {
    const queryParams = new URLSearchParams({
      action: "downloadReport",
      domain: process.env.GO_CONTACT_DOMAIN,
      username: process.env.GO_CONTACT_USERNAME,
      password: process.env.GO_CONTACT_PASSWORD,
      api_download: "true",
      ownerType,
      startDate,
      endDate,
      dataType: "0",
      templateId: templateId.toString(),
      includeALLOwners: "false",
    });

    ownerIds.forEach((ownerId) => {
      queryParams.append("ownerId[]", ownerId.toString());
    });

    const response = await fetch(
      `https://galp-acc.go-contact.com/fs/modules/report-builder/php/reportBuilderRequests.php?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Erro ao criar relatório: ${response.statusText}`);
    }

    const reportResponse = await response.json();
    return reportResponse;
  } catch (error) {
    console.error("Erro ao criar relatório:", error);
    throw error;
  }
}
