import { SideMenu } from "@/components/SideMenu";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="flex px-2">
        <SideMenu />
        <main className="w-full h-full">{children}</main>
      </div>
  );
}
