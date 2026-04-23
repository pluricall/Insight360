import { Header } from "@/components/header";
import { ReportClient } from "./components/wrapper";

export default function ReportTemplate() {
  return (
    <div>
      <Header title="Cadastro Report" />

      <div className="p-4">
        <ReportClient />
      </div>
    </div>
  );
}