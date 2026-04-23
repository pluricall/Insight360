"use client";
import { useState } from "react";
import { RecordForm } from "./record-form";
import { RecordTable } from "./record-table";

export function RecordClient() {
  const [refresh, setRefresh] = useState(0);
  return (
    <div className="grid xl:grid-cols-2 gap-4">
      <RecordForm onSuccess={() => setRefresh((r) => r + 1)}/>
      <RecordTable refresh={refresh} />
    </div>
  );
}