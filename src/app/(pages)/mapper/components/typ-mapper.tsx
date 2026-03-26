"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileInput } from "./file-upload";
import { Textarea } from "@/components/ui/textarea";

export function TypMapperCard() {
  const [typContent, setTypContent] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setTypContent(content);
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    const blob = new Blob([typContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "typ_modificado.typ";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="min-h-full w-full">
      <CardContent className="space-y-6 p-6">
        <h1 className="text-2xl font-semibold text-center">🧮 TYP Generator</h1>

        <FileInput
          label="Carregar arquivo .typ"
          accept=".typ"
          onFileChange={handleFileUpload}
        />

        <Textarea
          value={typContent}
          onChange={(e) => setTypContent(e.target.value)}
          className="w-full h-[800px]"
          placeholder="O conteúdo do arquivo .typ aparecerá aqui"
        />
      </CardContent>
    </Card>
  );
}
