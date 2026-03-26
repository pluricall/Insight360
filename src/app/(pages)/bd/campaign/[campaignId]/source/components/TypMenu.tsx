"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

export type TypDataSource = {
  id: string;
  name: string;
};

type TypMenuDialogProps = {
  typs: TypDataSource[];
  onSelect: (typId: string) => void;
  selectedTypId?: string | null;
};

type TypDetail = {
  id: string;
  name: string;
  separator: string;
  entityName: string;
  loadingMode: string;
  parserMode: string;
  fields: string[];
  fixed_fields: Record<string, string>;
};

export function TypMenuDialog({
  typs,
  onSelect,
  selectedTypId,
}: TypMenuDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTypDetailId, setSelectedTypDetailId] = useState<string | null>(
    null
  );
  const [typDetails, setTypDetails] = useState<TypDetail | null>(null);

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  const handleOpenDetails = (id: string) => {
    setSelectedTypDetailId(id);
    setDetailDialogOpen(true);
  };

  useEffect(() => {
    if (selectedTypDetailId) {
      fetch(`/Insight360/apiloader/bd/typ/${selectedTypDetailId}`)
        .then((res) => res.json())
        .then((data) => setTypDetails(data))
        .catch((err) => console.error(err));
    }
  }, [selectedTypDetailId]);

  const filteredTyp = typs.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderFormattedDetails = (typ: TypDetail) => {
    return (
      <pre className="text-sm whitespace-pre-wrap font-mono">
        {`@@@\n@Separator = "${typ.separator}"
@EntityName = "${typ.entityName}"
@LoadingMode = "${typ.loadingMode}"
@ParserMode = "${typ.parserMode}"\n@@@\n`}
        {typ.fields.join("\n")} <br />
        % <br />
        {Object.entries(typ.fixed_fields)
          .map(
            ([key, value]) =>
              `${key}=${typeof value === "string" ? `"${value}"` : value}`
          )
          .join("\n")}
      </pre>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="secondary">
            {selectedTypId ? `Typ Selecionado` : `Selecionar Typ`}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Selecione um Typ</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Buscar typ pelo nome"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <ScrollArea className="h-64">
            {filteredTyp.length > 0 && (
              <div className="space-y-2">
                {filteredTyp.map((typ) => (
                  <div key={typ.id} className="flex gap-2">
                    <Button
                      variant={typ.id === selectedTypId ? "default" : "outline"}
                      onClick={() => handleSelect(typ.id)}
                      className={cn("w-full justify-start")}
                    >
                      {typ.name}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenDetails(typ.id)}
                    >
                      Ver detalhes
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {filteredTyp.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
                <h2 className="text-xl font-semibold text-gray-700">
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
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Typ</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-96">
            {typDetails ? (
              renderFormattedDetails(typDetails)
            ) : (
              <p className="text-gray-500 text-sm">Carregando...</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
