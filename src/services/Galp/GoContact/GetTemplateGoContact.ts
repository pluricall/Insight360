import { NextApiRequest, NextApiResponse } from "next";
import { OwnerTypeEnum } from "./GetCreateReportGoContact";

interface ITemplateResponse {
  owners: {
    id: number;
    name: string;
  }[];
  templates: {
    id: number;
    name: string;
  }[];
}

export async function GetTemplateGoConctact(
  ownerType: OwnerTypeEnum
): Promise<{ templateId: number; ownerIds: number[] }> {
  try {
    let action: string = ""
    let templateName: string = ""
    let ownerNames: string | string[] = [""]

    if (ownerType === OwnerTypeEnum.Queue) {
      templateName = "INP_INB_SALES_RYAN";
      action = "getqueue";
      ownerNames = [
        "Atendimento || G&amp;P || Sales || Contratação",
        "Atendimento || Sales || Retorno Campanha Outbound Puro",
        "Callback || G&amp;P Sales",
      ];
    } 

    if (ownerType === OwnerTypeEnum.Campaign) {
      templateName = "Sofia-Ryan";
      action = "getcampaign";
      ownerNames = [
        "Outbound || Sales || Puro",
        "Outbound || Sales || Puro 1"
      ];
    }

    const queryParams = new URLSearchParams({
      domain: process.env.GO_CONTACT_DOMAIN,
      username: process.env.GO_CONTACT_USERNAME,
      password: process.env.GO_CONTACT_PASSWORD,
      action,
      api_download: "true",
    });

    const response = await fetch(
      `https://galp-acc.go-contact.com/fs/php/classes/report_builder.php?${queryParams.toString()}`
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Erro da API externa:", text);
    
      throw new Error(`Erro da API externa: ${text}`);
    }
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Resposta não é JSON:", text);
      throw new Error(text);
    }
    
    const { owners, templates }: ITemplateResponse = await response.json();

    const ownerIds = owners
      .filter((owner) => ownerNames.includes(owner.name))
      .map((owner) => owner.id);

    if (ownerIds.length === 0) {
      throw new Error(`Nenhum ID encontrado para os nomes: ${ownerNames}`);
    }

    const template = templates.find((t) => t.name === templateName);

    if (!template) {
      throw new Error(`Template não encontrado: ${templateName}`);
    }

    return { templateId: template.id, ownerIds };
  } catch (error) {
    console.error("Erro ao buscar template e owners:", error);
    throw error;
  }
}