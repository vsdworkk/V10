/*
Logo belt section component showing trusted government departments.
*/

"use server"

import BlurFade from "@/components/ui/blur-fade"
import { Card } from "@/components/ui/card"

export async function LogoBeltSection() {
  const departments = [
    "Department of Finance",
    "Department of Defence",
    "Department of Health and Aged Care",
    "Australian Taxation Office",
    "Department of Home Affairs",
    "Attorney-General's Department",
    "Australian Bureau of Statistics",
    "Australian Competition and Consumer Commission",
    "Australian Electoral Commission",
    "Department of Agriculture, Fisheries and Forestry",
    "Department of Climate Change, Energy, the Environment and Water",
    "Department of Education",
    "Department of Employment and Workplace Relations",
    "Department of Foreign Affairs and Trade",
    "Department of Health, Disability and Ageing",
    "Department of Industry, Science and Resources",
    "Department of Social Services",
    "Department of the Prime Minister and Cabinet",
    "Department of the Treasury"
  ]

  return (
    <section className="relative overflow-hidden bg-white py-24">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-white" />

      <div className="relative mx-auto max-w-7xl px-6">
        <BlurFade delay={0.2} inView>
          <div className="text-center">
            <h3 className="text-foreground mb-12 text-2xl font-semibold leading-relaxed md:text-3xl">
              Trusted by APS Employees at
            </h3>
          </div>
        </BlurFade>

        <BlurFade delay={0.4} inView>
          <Card className="relative overflow-hidden border-none bg-white shadow-none">
            {/* Scrolling belt with enhanced styling */}
            <div className="relative overflow-hidden py-8">
              {/* Gradient fade effects on sides */}
              <div className="from-background/80 pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r to-transparent" />
              <div className="from-background/80 pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l to-transparent" />

              <div className="animate-scroll flex items-center gap-16 whitespace-nowrap">
                {/* First set of departments */}
                {departments.map((department, index) => (
                  <span
                    key={index}
                    className="text-foreground hover:text-primary text-lg font-semibold transition-all duration-300 md:text-xl"
                  >
                    {department}
                  </span>
                ))}
                {/* Duplicate set for seamless loop */}
                {departments.map((department, index) => (
                  <span
                    key={`duplicate-${index}`}
                    className="text-foreground hover:text-primary text-lg font-semibold transition-all duration-300 md:text-xl"
                  >
                    {department}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </BlurFade>

        <BlurFade delay={0.6} inView>
          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Join thousands of APS professionals who trust our platform
            </p>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
