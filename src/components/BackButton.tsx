import { ArrowLeft, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Button onClick={handleBack} className="flex items-center text-lg" variant="link">
      <ArrowLeft size={18} />
      Voltar
    </Button>
  );
}
