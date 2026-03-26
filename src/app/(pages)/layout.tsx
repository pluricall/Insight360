import { SideMenu } from "@/components/side-menu";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 return (
    <div className="flex h-screen">
      <SideMenu />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
