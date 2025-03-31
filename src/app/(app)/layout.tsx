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
      <div className="w-full py-2 px-4">
        <main className="p-2 w-full">{children}</main>
      </div>
    </SidebarProvider>
  );
}
