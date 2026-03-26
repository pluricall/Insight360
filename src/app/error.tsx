'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

type ErrorBoundaryProps = {
  error: Error;
  reset: () => void;
};

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="p-4 min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full text-center">
        <div className="relative inline-block mb-6">
          <AlertTriangle size={64} className="text-white mx-auto" />
          <div className="absolute h-1 w-16 bg-red-600 -rotate-12 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-80"></div>
        </div>
        <h2 className="text-heading-xl text-white font-sans mb-2">
          Something went wrong!
        </h2>
        {error?.message && (
          <p className="text-red-600 font-bold mb-2 px-4 text-body-md overflow-hidden text-ellipsis max-h-24">
            {error?.message}
          </p>
        )}

        <div className='flex items-center justify-center gap-4 mt-4'>

          <Button onClick={reset} variant='outline'>
            Try again
          </Button>
          <Button asChild variant='destructive'>
            <Link href="/agents/create">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}