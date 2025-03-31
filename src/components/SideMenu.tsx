"use client";
import { AudioLines, Box, Fuel, Home } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
    <Sidebar className="bg-gray-900 text-white min-h-screen">
      <div className=" flex items-center justify-center gap-4 p-4 border-b border-gray-700">
      <Image
          src="/avatar.jpeg"
          alt="Avatar Pluricall"
          height={40}
          width={40}
          className="rounded-full"
        />

        <h1 className="text-center text-lg font-bold uppercase">INSIGHT 360</h1>
      </div>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">
            Páginas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-800">
                <SidebarMenuButton asChild>
                  <NavLink href="/">
                    <Home className="w-5 h-5" />
                    Dashboard
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">
            Campanhas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-800">
                <SidebarMenuButton asChild>
                  <NavLink href="/cubes">
                    <Box className="w-5 h-5" />
                    Cubes
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-800">
                <SidebarMenuButton asChild>
                  <NavLink
                    href="https://agent.tejo.cc/minisom/sign-in"
                    target="_blank"
                  >
                    <AudioLines className="w-5 h-5" />
                    Minisom
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-800">
                <SidebarMenuButton asChild>
                  <NavLink href="/galp">
                    <Fuel className="w-5 h-5" />
                    Galp
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-700">
        <Button
          onClick={handleLogout}
          disabled={loading}
          variant="outline"
          className="w-full text-white border-gray-600 hover:bg-gray-800"
        >
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
