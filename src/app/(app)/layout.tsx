import { SideMenu } from "@/components/SideMenu";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <SideMenu />
      <div className="w-full px-2">
        <main className="w-full">{children}</main>
      </div>
    </SidebarProvider>
  );
}
