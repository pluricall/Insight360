'use client';
import { Menu } from "lucide-react";
import { useSidebar } from "./ui/sidebar";

export const SideMenuToggle = () => {
  const { toggleSidebar, isMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <Menu
      className="sm:hidden fixed top-4 left-6 z-50 cursor-pointer"
      onClick={toggleSidebar}
    />
  );
};