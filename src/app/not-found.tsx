import { Button } from '@/components/ui/button';
import { FileQuestion, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 flex-col bg-black">
      <div className="relative inline-block mb-3 font-sans">
        <span className="text-8xl font-bold text-white inline-block transform -rotate-12 -translate-y-2 -translate-x-1">
          4
        </span>
        <span className="text-8xl font-bold text-white inline-block">0</span>
        <span className="text-8xl font-bold text-white inline-block">4</span>
      </div>

      <p className="text-gray-100 mb-8">Página não encontrada</p>

      <div className="mt-6 flex justify-center gap-4">
        <Button asChild variant='secondary'>
          <Link href="/agents/create">Home</Link>
        </Button>
      </div>
    </div>
  );
}