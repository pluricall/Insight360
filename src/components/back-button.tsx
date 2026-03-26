import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

export function BackButton({ href = "/" }: { href?: string }) {
  return (
    <Button
      className="flex items-center text-lg"
      variant="link"
      asChild
    >
      <Link href={href}>
        <ArrowLeft size={18} />
        Voltar
      </Link>
    </Button>
  );
}
