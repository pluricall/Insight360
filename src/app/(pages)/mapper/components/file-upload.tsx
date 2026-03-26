"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { ArrowBigDown } from "lucide-react";

interface FileInputProps {
  label?: string;
  accept?: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileInput({ label = "Carregar ficheiro", accept = ".xlsx", onFileChange }: FileInputProps) {
  const [fileName, setFileName] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
    onFileChange(e);
  };

  return (
<div className="relative w-full">
  <Input
    label={label}
    readOnly
    value={fileName}
    placeholder="Clique ou arraste o ficheiro"
    onClick={handleClick}
    className="cursor-pointer pr-10"
  />
  <input
    type="file"
    accept={accept}
    ref={fileRef}
    onChange={handleChange}
    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
  />
  <div
    className="absolute right-3 pointer-events-none top-2/4 "
  >
    <ArrowBigDown className="w-6 h-6 text-gray-100" />
  </div>
</div>
  );
}
