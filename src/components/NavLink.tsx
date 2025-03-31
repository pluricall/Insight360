'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLink({
  href,
  children,
  target,
}: {
  href: string
  children: React.ReactNode
  target?: '_blank' | '_self' | '_parent' | '_top'
}) {
  const pathname = usePathname()

  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      className={`flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary ${
        isActive ? 'font-semibold text-primary' : ''
      }`}
    >
      {children}
    </Link>
  )
}