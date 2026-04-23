"use client";
import { AudioLines, Fuel, KanbanIcon, LockIcon, BrushIcon, Webhook, Disc, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { NavLink } from "./nav-link";
import { useAuth } from "@/contexts/AuthProvider";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";

export function SideMenu() {
  const [loading, setLoading] = useState(false);
  const { signOutAltitude } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      setLoading(true);
      await signOutAltitude();
      router.push("/sign-in");
    } catch (error: any) {
      if (error.message) toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const allPagesNavLinks = [
    { href: "/agents/create", label: "Criação de agentes", icon: <KanbanIcon className="w-5 h-5" /> },
    { href: "/agents/cleanup", label: "Clean Up", icon: <BrushIcon className="w-5 h-5" /> },
    { href: "/agents/block", label: "Bloqueio de agentes", icon: <LockIcon className="w-5 h-5" /> },
    { href: "/leads", label: "API Leads", icon: <Webhook className="w-5 h-5" /> },
    { href: "/records", label: "Gravações", icon: <Disc className="w-5 h-5" /> },
    { href: "/reports", label: "Relatórios", icon: <FileText className="w-5 h-5" /> },
  ];

  const allClientsNavLinks = [
    { href: "https://agent.tejo.cc/minisom", label: "Minisom", icon: <AudioLines className="w-5 h-5" />, external: true },
    { href: "/galp", label: "Galp", icon: <Fuel className="w-5 h-5" /> },
  ];

  return (
    <Sidebar className="text-white min-h-screen">
      <SidebarHeader className="flex items-center justify-center gap-4 p-4 border-b border-r-0">
        <div className="flex items-center gap-4">
          <Image
            src="/Insight360/avatar.jpeg"
            alt="Avatar Pluricall"
            height={40}
            width={40}
            className="rounded-full"
          />
          <h1 className="text-primary text-center text-xl  md:text-2xl font-bold uppercase">
            INSIGHT 360
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500">
            Páginas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allPagesNavLinks.map((link) => (
                <NavLink key={link.href} href={link.href}>
                  <SidebarMenuItem className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                    {link.icon}
                    {link.label}
                  </SidebarMenuItem>
                </NavLink>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500">
            Clientes
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allClientsNavLinks.map((link) => (
                <NavLink key={link.href} href={link.href} target={link.external ? "_blank" : "_self"}>
                  <SidebarMenuItem className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                    {link.icon}
                    {link.label}
                  </SidebarMenuItem>
                </NavLink>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="flex p-4 border-t border-gray-700">
        <div className="flex gap-2 w-full items-center justify-between">
          <Button
            onClick={handleLogout}
            disabled={loading}
            variant="outline"
            className="text-primary border-gray-600 hover:bg-muted"
          >
            Sair
          </Button>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
