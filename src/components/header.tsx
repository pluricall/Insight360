
import React from "react"
import { SideMenuToggle } from "./side-menu-toggle"

type HeaderProps = {
  title: string
}

export const Header = ({ title }: HeaderProps) => {
  return (
    <div className="flex items-center justify-center gap-4 p-5 border-b">
      <SideMenuToggle />
      <h1 className="text-primary text-center text-xl  md:text-2xl font-bold uppercase">
        {title}
      </h1>
    </div>
  )
}