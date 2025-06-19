/*
Safari style image wrapper component using Next.js Image for optimization.
*/

import { ImgHTMLAttributes } from "react"
import Image from "next/image"

export interface SafariProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "width" | "height"
  > {
  url?: string
  src?: string
  width?: number
  height?: number
  className?: string
}

export default function Safari({
  src,
  url,
  width = 1203,
  height = 753,
  className,
  alt = "",
  ...props
}: SafariProps) {
  return (
    <div className={className}>
      <Image
        src={src || ""}
        alt={alt}
        width={width}
        height={height}
        className="size-full rounded-lg object-cover"
        {...props}
      />
    </div>
  )
}
