import { ImgHTMLAttributes } from "react"

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
  ...props
}: SafariProps) {
  return (
    <div className={className}>
      <img
        src={src}
        alt=""
        width={width}
        height={height}
        className="size-full rounded-lg object-cover"
        {...props}
      />
    </div>
  )
}
