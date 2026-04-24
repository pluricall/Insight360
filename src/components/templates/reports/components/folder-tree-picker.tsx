"use client";

import { useState } from "react";
import { SelectItem } from "@/components/ui/select";
import { SelectField } from "@/components/select-field";
import { Loader2, ChevronRight, X } from "lucide-react";

interface Folder {
  name: string;
  path: string;
  hasChildren: boolean;
}

interface FolderLevel {
  folders: Folder[];
  selected: string;
}

interface Props {
  driveId: string;
  value?: string;
  onChange: (path: string | undefined) => void;
}

async function fetchFolders(driveId: string, path = ""): Promise<Folder[]> {
  const url = path
    ? `https://lince.centrocontacto.cc/sharepoint/drives/${driveId}/folders?path=${encodeURIComponent(path)}`
    : `https://lince.centrocontacto.cc/sharepoint/drives/${driveId}/folders`;

  const res = await fetch(url);
  return res.json();
}

export function FolderPathBuilder({ driveId, value, onChange }: Props) {
  const [levels, setLevels] = useState<FolderLevel[]>([]);
  const [rootFolders, setRootFolders] = useState<Folder[]>([]);
  const [rootLoading, setRootLoading] = useState(false);
  const [rootLoaded, setRootLoaded] = useState(false);
  const [loadingLevel, setLoadingLevel] = useState<number | null>(null);

  useState(() => {
    if (!driveId || rootLoaded) return;
    setRootLoading(true);
    fetchFolders(driveId)
      .then((folders) => {
        setRootFolders(folders);
        setRootLoaded(true);
      })
      .finally(() => setRootLoading(false));
  });

  const handleSelect = async (levelIndex: number, selectedPath: string) => {
  const folders = levelIndex === 0 ? rootFolders : levels[levelIndex - 1].folders;
  const selected = folders.find((f) => f.path === selectedPath)!;

  if (levelIndex === 0) {
    setLevels([]);
  } else {
    setLevels((prev) =>
      prev.slice(0, levelIndex).map((l, i) =>
        i === levelIndex - 1 ? { ...l, selected: selectedPath } : l
      )
    );
  }

  onChange(selectedPath);

  if (!selected.hasChildren) return; 

  setLoadingLevel(levelIndex + 1);
  const children = await fetchFolders(driveId, selectedPath);
  setLoadingLevel(null);

  if (children.length === 0) return;

  setLevels((prev) => {
    const base = levelIndex === 0 ? [] : prev.slice(0, levelIndex).map((l, i) =>
      i === levelIndex - 1 ? { ...l, selected: selectedPath } : l
    );
    return [...base, { folders: children, selected: "" }];
  });
};

 const handleClear = (levelIndex: number) => {
  if (levelIndex === 0) {
    setLevels([]);
    onChange(undefined);
  } else {
    setLevels((prev) =>
      prev.slice(0, levelIndex).map((l, i) =>
        i === levelIndex - 1 ? { ...l, selected: "" } : l
      )
    );

    const parentSelected =
      levelIndex === 1
        ? rootFolders.find((f) => value?.startsWith(f.path))?.path
        : levels[levelIndex - 2]?.selected; 

    onChange(parentSelected || undefined);
  }
};

  const rootSelected = levels.length > 0 || value
    ? rootFolders.find((f) => value?.startsWith(f.path))?.path ?? ""
    : "";

  return (
    <div className="flex flex-col gap-2">
      <LevelSelect
        label={rootLoading ? "Carregando pastas..." : "Pasta"}
        folders={rootFolders}
        selected={rootSelected}
        disabled={rootLoading || !rootLoaded}
        loading={loadingLevel === 0}  // nunca acontece mas por consistência
        onSelect={(path) => handleSelect(0, path)}
        onClear={rootSelected ? () => handleClear(0) : undefined}
      />

      {levels.map((level, i) => (
        <div key={i} className="flex items-start gap-2">
          <ChevronRight size={16} className="text-muted-foreground mt-[34px] shrink-0" />
          <div className="flex-1">
            <LevelSelect
              label={`Subpasta ${i + 1}`}
              folders={level.folders}
              selected={level.selected}
              disabled={loadingLevel !== null}
              loading={loadingLevel === i + 1}
              onSelect={(path) => handleSelect(i + 1, path)}
              onClear={level.selected ? () => handleClear(i + 1) : undefined}
            />
          </div>
        </div>
      ))}

      {value && (
        <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md truncate">
          {value}
        </p>
      )}
    </div>
  );
}

function LevelSelect({
  label,
  folders,
  selected,
  disabled,
  loading,
  onSelect,
  onClear,
}: {
  label: string;
  folders: Folder[];
  selected: string;
  disabled: boolean;
  loading: boolean;
  onSelect: (path: string) => void;
  onClear?: () => void;
}) {
  return (
    <div className="flex items-end gap-1.5">
      <div className="flex-1">
        <SelectField
          label={label}
          onValueChange={onSelect}
          value={selected}
          disabled={disabled}
        >
          {folders.map((f) => (
            <SelectItem key={f.path} value={f.path}>
              {f.name}
            </SelectItem>
          ))}
        </SelectField>
      </div>

      {loading && (
        <Loader2 size={16} className="animate-spin text-muted-foreground mb-2.5 shrink-0" />
      )}

      {onClear && !loading && (
        <button
          type="button"
          onClick={onClear}
          className="mb-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          title="Limpar selecção"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}