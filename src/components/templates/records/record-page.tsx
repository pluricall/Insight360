import { Header } from "@/components/header";
import { RecordClient } from "./components/wrapper";

export default function RecordTemplate() {
  return (
    <div>
      <Header title="Cadastro Record" />

      <div className="p-4">
        <RecordClient />
      </div>
    </div>
  );
}