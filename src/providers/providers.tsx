"use client";
import { AuthProvider } from "@/contexts/AuthProvider";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
      <ThemeProvider storageKey="dashboard-theme" defaultTheme="dark">
        <AuthProvider>
          <Toaster richColors />
          {children}
        </AuthProvider>
      </ThemeProvider>
  );
}
