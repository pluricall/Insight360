"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "@/components/Search";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CardTyp, CardTypProps } from "./components/CardTyp";
import { BackButton } from "@/components/BackButton";

export default function Home() {
  const [data, setData] = useState<CardTypProps[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCampaignData() {
      try {
        const response = await fetch("http://localhost:3333/api/bd/typ", {
          cache: "no-store",
        });
        const json = await response.json();
        setData(json.typs ?? []);
      } catch (error) {
        console.error("Erro ao buscar bases de dados:", error);
      }
    }

    fetchCampaignData();
  }, []);

  if (!data) {
    return <div className="text-center py-10 text-gray-500">Carregando...</div>;
  }

  const filteredData = data.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center min-h-screen p-8">
      <div className="w-full max-w-5xl space-y-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <BackButton/>
          <h1 className="text-4xl font-extrabold text-gray-800">Todos os Typ's</h1>
          <div className="flex gap-2">
            <Link href="/bd/typ/register">
              <Button className="flex items-center gap-2 px-4 py-2 text-sm">
                <Plus size={18} /> Novo Typ
              </Button>
            </Link>
            <Link href="/bd/campaign/register">
              <Button className="flex items-center gap-2 px-4 py-2 text-sm">
                <Plus size={18} /> Nova campanha
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-full">
          <Search
            placeholder="Buscar typ pelo nome"
            className="bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => (
              <CardTyp data={item} key={item.id} />
            ))}
          </div>
        )}

        {filteredData.length === 0 && (
          <Card className="flex flex-col items-center justify-center gap-4 p-10 text-center shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700">
              Nenhum typ encontrado!
            </h2>
            <p className="text-gray-500 text-base max-w-md">
              Você ainda não possui nenhum typ cadastrado ou o nome buscado
              não corresponde a nenhum.
            </p>
            <Link href="/bd/typ/register">
              <Button className="flex items-center gap-2 mt-2">
                <Plus size={16} /> Novo typ
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
