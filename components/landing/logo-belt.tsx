/*
Logo belt section component showing trusted company logos.
*/

"use server"

export async function LogoBeltSection() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-muted-foreground mb-8 text-center font-medium">
          Trusted by professionals at leading organizations
        </p>
        <div className="flex items-center justify-center gap-8 opacity-60 md:gap-12">
          <img
            className="h-6 w-auto grayscale transition-all hover:grayscale-0"
            src="https://html.tailus.io/blocks/customers/nvidia.svg"
            alt="Nvidia"
            height="24"
            width="auto"
          />
          <img
            className="h-5 w-auto grayscale transition-all hover:grayscale-0"
            src="https://html.tailus.io/blocks/customers/column.svg"
            alt="Column"
            height="20"
            width="auto"
          />
          <img
            className="h-5 w-auto grayscale transition-all hover:grayscale-0"
            src="https://html.tailus.io/blocks/customers/github.svg"
            alt="GitHub"
            height="20"
            width="auto"
          />
          <img
            className="h-6 w-auto grayscale transition-all hover:grayscale-0"
            src="https://html.tailus.io/blocks/customers/nike.svg"
            alt="Nike"
            height="24"
            width="auto"
          />
        </div>
      </div>
    </section>
  )
}
