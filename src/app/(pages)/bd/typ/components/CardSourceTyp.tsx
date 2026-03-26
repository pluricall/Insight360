"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Source {
  id: string;
  name: string;
  campaign: {
    id: string;
    name: string;
  };
}

export function CardSourceTyp({ source }: { source: Source }) {
  const router = useRouter();

  function handleOpenSourceDetails() {
    router.push(`/bd/campaign/${source.campaign.id}/source/update/${source.id}`);
  }

  return (
    <Card
      onClick={handleOpenSourceDetails}
      className="group cursor-pointer flex items-center gap-4 p-4 shadow-md hover:shadow-lg transition w-full rounded-2xl border border-gray-200 hover:border-blue-600"
    >
      <div className="flex-1 overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {source.campaign.name}
        </h2>
        <span className="text-sm text-gray-700">
          {" "}
          <strong>Source: </strong>
          {source.name}
        </span>
      </div>

      <div className="flex items-center text-blue-600 text-xs font-medium">
        <span className="hidden md:inline group-hover:scale-105 group-hover:text-blue-500 transition">
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
