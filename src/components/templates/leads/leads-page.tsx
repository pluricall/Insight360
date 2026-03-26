import { Header } from "@/components/header";
import { LeadForm } from "./components/lead-form";

export function LeadsTemplate() {
  return (
    <div>
      <Header title="Cadastro LeadConfig" />
      <div className="flex-1 flex justify-center p-4">
        <div className="w-full max-w-4xl">
          <LeadForm />
        </div>
      </div>
    </div>
  );
}