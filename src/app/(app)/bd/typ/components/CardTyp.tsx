"use client";

import { Card } from "@/components/ui/card";
import { ArrowRight, Database } from "lucide-react";
import { useRouter } from "next/navigation";

interface SourceTypProps {
  id: string;
  name: string;
  origin: string;
}

export interface CardTypProps {
  id: string;
  name: string;
  sources: SourceTypProps[];
}

export function CardTyp({ data }: { data: CardTypProps }) {
  const router = useRouter();

  function handleOpenTypDetails() {
    router.push(`/bd/typ/update/${data.id}`);
  }

  return (
    <Card
      onClick={handleOpenTypDetails}
      className="group cursor-pointer flex items-center gap-4 p-4 shadow-md hover:shadow-lg transition w-full rounded-2xl border border-gray-200 hover:border-blue-600"
    >
      <div className="flex-1 overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {data.name}
        </h2>
        <p className="text-sm text-gray-500 mb-1 truncate">
          Qtd/Sources: {data.sources.length}
        </p>
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
