import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ClipboardList, Layers, ShieldCheck, Sparkles } from "lucide-react"
import { ReactNode } from "react"

export const FeaturesSection = () => {
  const features = [
    {
      title: "APS Framework Alignment",
      description:
        "Systematically considers every possible scenario to perfectly align your experience with APS frameworks—including ILS, WLS, and selection criteria—ensuring maximum fit and impact.",
      icon: <Layers className="size-6" aria-hidden />
    },
    {
      title: "Selection Criteria Precision",
      description:
        "Intelligently adapts your experience to address the selection criteria, explicitly highlighting your suitability and significantly reducing risk of automatic rejection.",
      icon: <ClipboardList className="size-6" aria-hidden />
    },
    {
      title: "Structured STAR Narratives",
      description:
        "Automatically organises your experience into persuasive STAR method narratives (Situation, Task, Action, Result) APS recruiters expect.",
      icon: <Sparkles className="size-6" aria-hidden />
    },
    {
      title: "Professional Tone & Security",
      description:
        "Uses professional language designed to resonate with APS recruiters while rigorous encryption keeps your data secure and confidential.",
      icon: <ShieldCheck className="size-6" aria-hidden />
    }
  ]

  return (
    <section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            5X Your Chances of Landing an Interview
          </h2>
        </div>
        <div className="@min-4xl:max-w-full @min-4xl:grid-cols-2 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="group shadow-zinc-950/5">
              <CardHeader className="pb-3">
                <CardDecorator>{feature.icon}</CardDecorator>
                <h3 className="mt-6 font-medium">{feature.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="mt-3 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:bg-white/5 dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
    />
    <div aria-hidden className="bg-radial to-background absolute inset-0 from-transparent to-75%" />
    <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">
      {children}
    </div>
  </div>
)

export default FeaturesSection
