import { Frown } from 'lucide-react'

export function NotFoundReport() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-center">
        <Frown size={60} className="text-muted-foreground mb-4" />
        <p>Não encontramos dados para exibir no momento.</p>
      </div>
    </div>
  )
}
