import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { SourceData } from "./CampaignForm";

export function CardSource({ sourceData }: { sourceData: SourceData }) {
  const router = useRouter();

  function handleOpensourceDetails() {
    router.push(
      `/bd/campaign/${sourceData.campaign_id}/source/update/${sourceData.id}`
    );
  }

  return (
    <Card
      onClick={handleOpensourceDetails}
      className="group cursor-pointer flex items-center gap-4 p-4 shadow-md hover:shadow-lg transition w-full rounded-2xl border border-gray-200 hover:border-blue-600"
    >
      <div className="flex-1 overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {sourceData.name}
        </h2>
        <span className="text-sm text-gray-700">
          {sourceData.typ ? (
            <div>
              <strong>Typ: </strong>
              {sourceData.typ.name}
            </div>
          ) : (
            "Typ não atribuído"
          )}
        </span>
      </div>

      <div className="flex items-center text-blue-600 text-xs font-medium">
        <span className="hidden md:inline group-hover:scale-105 group-hover:text-blue-500 transition">
          {sourceData.typ ? "Detalhes " : "Adicionar Typ "}
        </span>
        <ArrowRight
          size={20}
          className="group-hover:translate-x-1 group-hover:text-blue-500 transition"
        />
      </div>
    </Card>
  );
}
