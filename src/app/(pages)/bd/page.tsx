"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function BdHome() {
  const [loading, setLoading] = useState(false);

  const handleResubmit = async () => {
    setLoading(true);

    const payload = {
      campaignName: "mc_sonae_cob",
      sql: "WHERE dataload = '2023-11-22'",
      request: {
        ContactStatus: {
          RequestType: "Ignore",
          Value: "Disabled",
        },
        ResubmitHomePhone: false,
        ResubmitBusinessPhone: false,
        ResubmitMobilePhone: false,
        ResubmitOtherPhone: false,
        ResubmitAdditionalPhone1: false,
        ResubmitAdditionalPhone2: false,
        ResubmitAdditionalPhone3: false,
        ResubmitAdditionalPhone4: false,
        ResubmitAdditionalPhone5: false,
        ResubmitAdditionalPhone6: false,
        ResubmitAdditionalPhone7: false,
        ResubmitAdditionalPhone8: false,
        ResubmitAdditionalPhone9: false,
        ResubmitAdditionalPhone10: false,
        ResubmitAdditionalPhone11: false,
        ResubmitAdditionalPhone12: false,
        ResubmitAdditionalPhone13: false,
        ResubmitAdditionalPhone14: false,
        ResubmitAdditionalPhone15: false,
        ResubmitReschedulePhone: false,
        ResubmitInvalidPhones: false,
        NTriesAuto: false,
        NTriesManual: false,
        discriminator: "",
      },
      discriminator: "",
    };

    try {
      const response = await fetch(
        "apiloader/altitude/resubmitContacts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        console.error(response)
        throw new Error("Falha ao ressubmeter contatos");
      }
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gray-50">
      <div className="w-full max-w-4xl space-y-12">
        <header className="text-center space-y-2">
          <h1 className="text-5xl font-extrabold text-gray-800">Visão 360</h1>
          <p className="text-xl text-gray-500">
            Acompanhe e gerencie suas campanhas e arquivos com eficiência.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Card className="transition-transform hover:scale-105 duration-300 flex flex-col items-center justify-between p-8 space-y-6 shadow-xl rounded-2xl">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-semibold text-gray-800">
                Campanhas
              </h2>
              <p className="text-gray-500 text-base">
                Visualize e gerencie as campanhas cadastradas.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Link href="/bd/campaign/register">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft size={18} /> Criar campanha
                </Button>
              </Link>
              <Link href="/bd/campaign">
                <Button className="flex items-center gap-2">
                  Ver campanhas <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="transition-transform hover:scale-105 duration-300 flex flex-col items-center justify-between p-8 space-y-6 shadow-xl rounded-2xl">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-semibold text-gray-800">Typs</h2>
              <p className="text-gray-500 text-base">
                Visualize e gerencie todos os Typs disponíveis.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Link href="/bd/typ/register">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft size={18} /> Criar Typ
                </Button>
              </Link>
              <Link href="/bd/typ">
                <Button className="flex items-center gap-2">
                  Ver Typs <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
