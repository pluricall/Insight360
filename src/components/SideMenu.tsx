"use client";
import { AudioLines, Box, Fuel, Home } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { NavLink } from "./NavLink";
import { useAuth } from "@/contexts/AuthProvider";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ThemeToggle } from "./theme/themeToggle";

export function SideMenu() {
  const [loading, setLoading] = useState(false);
  const { logoutUser } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      setLoading(true);
      await logoutUser();
      router.push("/sign-in");
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  }
  return (
    <Sidebar className=" text-white min-h-screen">
      <SidebarHeader className=" flex items-center justify-center gap-4 p-4 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <Image
            src="/avatar.jpeg"
            alt="Avatar Pluricall"
            height={40}
            width={40}
            className="rounded-full"
          />

          <h1 className="text-primary text-center text-lg font-bold uppercase">
            INSIGHT 360
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">
            Páginas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavLink href="/">
                <SidebarMenuItem className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                  <Home className="w-5 h-5" />
                  Dashboard
                </SidebarMenuItem>
              </NavLink>
              <NavLink href="/cubes">
                <SidebarMenuItem className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                  <Box className="w-5 h-5" />
                  Cubes
                </SidebarMenuItem>
              </NavLink>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">
            Clientes
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavLink
                href="https://agent.tejo.cc/minisom/sign-in"
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">Funil</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavLink href="/funnel">
                <SidebarMenuItem className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                  <AudioLines className="w-5 h-5" />
                  Minisom
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
            className="text-white border-gray-600 hover:bg-muted"
          >
            Sair
          </Button>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
