import axios from "axios";
import { OwnerTypeEnum } from "./generate-report";

interface Owner {
  id: string;
  name: string;
}

interface GoContactApiResponse {
  queue: Owner[];
  campaign: Owner[];
}

interface GetTemplateGoConctactParams {
  ownerType: OwnerTypeEnum;
  token: string;
}

export async function getTemplateGoContact({
  ownerType,
  token,
}: GetTemplateGoConctactParams): Promise<{ templateId: number; ownerId: number[] }> {
  try {
    let templateId: number;
    let ownerNames: string[] = [];
    let apiField: keyof GoContactApiResponse;

    switch (ownerType) {
      case OwnerTypeEnum.Queue:
        templateId = 83;
        ownerNames = [
          "Atendimento | G&P | Sales | Retorno Outbound Puro [p]",
          "Callback | G&P | Sales [p]",
          "Callback | G&P | Sales | Side by Side [p]",
          "Atendimento | G&P | Sales [p]",
          "Atendimento | Wallboxes | Sales | Retorno Outbound [p]",
        ];
        apiField = "queue";
        break;

      case OwnerTypeEnum.SideBySide:
        templateId = 83;
        ownerNames = [
          "Atendimento | G&P | Sales | Side by Side Virtual [p]",
          "Atendimento | G&P | Sales | Side by Side [p]",
          "Callback | G&P | Sales | Side by Side Virtual [p]"
        ];
        apiField = "queue";
        break;

      case OwnerTypeEnum.Campaign:
        templateId = 77;
        ownerNames = [
          "Outbound | G&P | Sales | Chamadas Manuais Side by Side [p]",
          "Outbound | G&P | Sales | Chamadas Manuais [p]",
          "Outbound | G&P | Sales | Puro [p]",
          "Outbound | G&P | Retention | Recuperação de contratos [p]",
          "Outbound | G&P | Sales | Registo Lead Form [p]",
          "Outbound | G&P | Sales | Puro 1 [p]",
          "Outbound | Wallboxes | Sales [p]",
        ];
        apiField = "campaign";
        break;
      default:
        throw new Error("OwnerType inválido");
    }

    const { data } = await axios.get<GoContactApiResponse>(
      "https://galp.gocontact.com/poll/api/owners",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const owners = data[apiField];

    if (!owners || owners.length === 0) {
      throw new Error(`Nenhum owner encontrado em "${apiField}"`);
    }


    const ownerId = owners
      .filter(owner => ownerNames.some(name => owner.name.includes(name)))
      .map(owner => {
        const parsed = Number(owner.id);
        if (Number.isNaN(parsed)) {
          throw new Error(`Owner id inválido: ${owner.id}`);
        }
        return parsed;
      });

    if (ownerId.length === 0) {
      throw new Error(`Nenhum owner encontrado para os nomes: ${ownerNames.join(", ")}`);
    }

    return { templateId, ownerId };
  } catch (error) {
    console.error("Erro ao buscar template e owners:", error);
    throw error;
  }
}
