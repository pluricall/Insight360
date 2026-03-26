"use client";
import { AudioLines, Fuel, KanbanIcon, LockIcon, BrushIcon, Webhook,  Disc } from "lucide-react";
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
                <NavLink href="/agents/create">
                <SidebarMenuItem className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                  <KanbanIcon className="w-5 h-5" />
                  Criação de agentes
                </SidebarMenuItem>
              </NavLink>
              <NavLink href="/agents/cleanup">
                <SidebarMenuItem className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                  <BrushIcon className="w-5 h-5" />
                  Clean Up
                </SidebarMenuItem>
              </NavLink>
              <NavLink href="/agents/block">
                <SidebarMenuItem className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                  <LockIcon className="w-5 h-5" />
                  Bloqueio de agentes
                </SidebarMenuItem>
              </NavLink>
              <NavLink href="/leads">
                <SidebarMenuItem className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                  <Webhook className="w-5 h-5" />
                  API Leads
                </SidebarMenuItem>
              </NavLink>
              <NavLink href="/records">
                <SidebarMenuItem className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                  <Disc className="w-5 h-5" />
                  Gravações
                </SidebarMenuItem>
              </NavLink>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-500">
              Clientes
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavLink
                  href="https://agent.tejo.cc/minisom"
                  target="_blank"
                >
                  <SidebarMenuItem className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                    <AudioLines className="w-5 h-5" />
                    Minisom
                  </SidebarMenuItem>
                </NavLink>
                <NavLink href="/galp">
                  <SidebarMenuItem className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                    <Fuel className="w-5 h-5" />
                    Galp
                  </SidebarMenuItem>
                </NavLink>
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
