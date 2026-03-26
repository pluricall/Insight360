import { cn } from "@/lib/utils"
import Image from "next/image"

interface SignInImageProps {
  className?: string
}

export const SignInImage = ({className}: SignInImageProps) => {
  return (
    <Image
      src="/Insight360/logo.png"
      alt="Logo da Pluricall SA"
      height={300}
      width={300}
      className={cn(className)}
    />
  )
}