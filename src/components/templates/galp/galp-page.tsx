import { Header } from "@/components/header";
import { GalpForm } from "./components/galp-form";

export default function GalpTemplate() {
  return (
    <div>
      <Header title="Relatório Galp" />
      <div className="flex-1 flex justify-center p-4">
        <GalpForm />
      </div>
    </div>
  );
}
