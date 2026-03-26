"use client";

import { Card } from "@/components/ui/card";
import { ArrowRight, Database } from "lucide-react";
import { useRouter } from "next/navigation";

export interface CardCampaignProps {
  id: string;
  name: string;
  campaign_type: string;
  description?: string;
}

export function CardCampaign({ data }: { data: CardCampaignProps }) {
  const router = useRouter();

  function handleOpenCampaignDetails() {
    router.push(`/bd/campaign/update/${data.id}`);
  }

  return (
    <Card
      onClick={handleOpenCampaignDetails}
      className="group cursor-pointer flex items-center gap-4 p-4 shadow-md hover:shadow-lg transition w-full rounded-2xl border border-gray-200 hover:border-blue-600"
    >
      <div className="flex items-center justify-center w-14 h-14 bg-blue-50 rounded-full">
        <Database className="text-blue-600" size={28} />
      </div>

      <div className="flex-1 overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-800 truncate">{data.name}</h2>
        <p className="text-sm text-gray-500 mb-1 truncate">{data.campaign_type}</p>
      </div>

      <div className="flex items-center text-blue-600 text-xs font-medium">
        <span
          className="hidden md:inline group-hover:scale-105 group-hover:text-blue-500 transition"
        >
          Detalhes
        </span>
        <ArrowRight
          size={20}
          className="group-hover:translate-x-1 group-hover:text-blue-500 transition"
        />
      </div>
    </Card>
  );
}
