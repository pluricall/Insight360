"use client";

import { useState } from "react";
import { ReportForm } from "./report-form";
import { ReportTable } from "./report-table";

export function ReportClient() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="grid xl:grid-cols-2 gap-4 h-fit">

      <ReportForm onSuccess={() => setRefresh((r) => r + 1)} />

      <ReportTable refresh={refresh} />

    </div>
  );
}