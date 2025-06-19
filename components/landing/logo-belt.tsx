/*
Logo belt section component showing trusted company logos.
*/

import Image from "next/image"

export default function LogoBeltSection() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-muted-foreground mb-8 text-center font-medium">
          Trusted by professionals at leading organizations
        </p>
        <div className="flex items-center justify-center gap-8 opacity-60 md:gap-12">
          <Image
            className="h-6 w-auto grayscale transition-all hover:grayscale-0"
            src="https://html.tailus.io/blocks/customers/nvidia.svg"
            alt="Nvidia"
            width={100}
            height={24}
          />
          <Image
            className="h-5 w-auto grayscale transition-all hover:grayscale-0"
            src="https://html.tailus.io/blocks/customers/column.svg"
            alt="Column"
            width={100}
            height={20}
          />
          <Image
            className="h-5 w-auto grayscale transition-all hover:grayscale-0"
            src="https://html.tailus.io/blocks/customers/github.svg"
            alt="GitHub"
            width={100}
            height={20}
          />
          <Image
            className="h-6 w-auto grayscale transition-all hover:grayscale-0"
            src="https://html.tailus.io/blocks/customers/nike.svg"
            alt="Nike"
            width={100}
            height={24}
          />
        </div>
      </div>
    </section>
  )
}
