"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash } from "lucide-react";
import { FileInput } from "./file-upload";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ExcelData = Record<string, any>;

type Field = {
  key: string;
  type: "excel" | "plc_id" | "dataload" | "plc_cod_bd" | "bd";
  value?: string;
  isPhone?: boolean;
};

function SortableItem({ field, index, togglePhone, remove, updateValue }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.key + index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 border rounded flex flex-col gap-2"
    >
      <div className="flex items-center gap-2">
        <Checkbox
          checked={field.isPhone || false}
          onCheckedChange={() => togglePhone(index)}
          onPointerDown={(e) => e.stopPropagation()}
        />
        <span>
          {index + 1}. {field.key}
        </span>
        <div className="ml-auto flex gap-1 items-center">
          <Button
            variant="destructive"
            onClick={() => remove(index)}
            className="rounded-full"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Trash size={32} />
          </Button>
        </div>
      </div>

      {(field.type === "plc_cod_bd" || field.type === "bd") && (
        <Input
          type="text"
          placeholder="Digite o valor"
          className="border rounded p-1"
          value={field.value || ""}
          onChange={(e) => updateValue(index, e.target.value)}
        />
      )}
    </div>
  );
}

export function MapperCard() {
  const [data, setData] = useState<ExcelData[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const arrayBuffer = evt.target?.result as ArrayBuffer;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
        defval: "",
      });
      if (jsonData.length > 0) {
        setData(jsonData);
        const cols = Object.keys(jsonData[0]);
        setFields(cols.map((col) => ({ key: col, type: "excel", isPhone: false })));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const addField = (type: Field["type"]) => {
    if (fields.find((f) => f.type === type)) return;
    setFields((prev) => [...prev, { key: type, type }]);
  };

  const removeField = (index: number) =>
    setFields((prev) => prev.filter((_, i) => i !== index));

  const updateFieldValue = (index: number, value: string) =>
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, value } : f)));

  const togglePhone = (index: number) =>
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, isPhone: !f.isPhone } : f))
    );

  const isValidPhone = (num: string) => {
    const cleaned = num.replace(/\s+/g, "").replace(/^(\+351|351)/, "").replace(/\D/g, "");
    return /^[239]\d{8}$/.test(cleaned) ? cleaned : null;
  };

  const handleGenerateTxt = () => {
    if (!data.length) return alert("Nenhum ficheiro carregado.");
    if (!fileName.trim()) return alert("Por favor, insira um nome para o ficheiro.");

    const hoje = new Date();
    const dataYMD = hoje.toISOString().slice(0, 10).replace(/-/g, "");
    const dataFormatada = hoje.toISOString().slice(0, 10).replace(/-/g, "/");

    const linhas: string[] = [];
    let contador = 0;

    data.forEach((row) => {
      contador++;
      const linha = fields
        .map((field) => {
          switch (field.type) {
            case "excel":
              if (row[field.key] && typeof row[field.key] === "string") {
                if (field.isPhone) {
                  const cleaned = isValidPhone(row[field.key]);
                  return cleaned ?? "";
                }
                return row[field.key];
              }
              return row[field.key] ?? "";
            case "plc_id":
              return `${dataYMD}_${String(contador).padStart(7, "0")}`;
            case "dataload":
              return dataFormatada;
            case "plc_cod_bd":
            case "bd":
              return field.value ?? "";
            default:
              return "";
          }
        })
        .join("|");
      linhas.push(linha);
    });

    const blob = new Blob([linhas.join("\n")], {
      type: "text/plain;charset=utf-8",
    });

    const finalName = fileName.endsWith(".txt") ? fileName : `${fileName}.txt`;
    saveAs(blob, finalName);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f, i) => f.key + i === active.id);
      const newIndex = fields.findIndex((f, i) => f.key + i === over.id);
      setFields((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center">🧮 TXT Generator</h1>

        <FileInput onFileChange={handleFileUpload} />

        {data.length > 0 && (
          <div className="flex gap-2 items-center">
            <Input
              type="text"
              placeholder="Nome do ficheiro (ex: clientes)"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
            <Button onClick={handleGenerateTxt}>Gerar TXT</Button>
          </div>
        )}

        <div className="flex gap-4 flex-wrap">
          <Button variant="outline" onClick={() => addField("plc_id")}>
            Adicionar plc_id
          </Button>
          <Button variant="outline" onClick={() => addField("dataload")}>
            Adicionar dataload
          </Button>
          <Button variant="outline" onClick={() => addField("plc_cod_bd")}>
            Adicionar plc_cod_bd
          </Button>
          <Button variant="outline" onClick={() => addField("bd")}>
            Adicionar bd
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map((f, i) => f.key + i)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <SortableItem
                  key={field.key + index}
                  field={field}
                  index={index}
                  togglePhone={togglePhone}
                  remove={removeField}
                  updateValue={updateFieldValue}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card >
  );
}
