/*
Features section component showcasing the main product features.
*/

import { Rocket, Target, Users } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h2 className="text-balance text-4xl font-bold lg:text-5xl">
                From APS Anxiety to a Polished Pitch in Minutes
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Answer a few guided prompts, then let our AI weave in ILS, WLS,
                STAR and APS values, so you can relax and hit "Submit" with
                confidence.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-8">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 mt-1 rounded-lg p-3">
                  <Rocket className="text-primary size-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    Skip the Learning Curve
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    No need to master complex APS frameworks —just answer
                    prompts while we translate your experience into APS-ready
                    language.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 mt-1 rounded-lg p-3">
                  <Target className="text-primary size-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    Hit Every Selection Criterion
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Real-time checks ensure no criterion—and no STAR element—is
                    missed, boosting your shortlist chances.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 mt-1 rounded-lg p-3">
                  <Users className="text-primary size-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    Built for Every Level & Role
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    From APS1 to EL1, across data, marketing, policy, and
                    beyond. One platform adapts to any role type and
                    classification level.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Placeholder */}
          <div className="flex items-center justify-center">
            <div className="bg-muted/30 border-muted-foreground/20 flex aspect-square w-full max-w-md items-center justify-center rounded-2xl border-2 border-dashed p-12">
              <div className="space-y-4 text-center">
                <div className="bg-muted mx-auto flex size-16 items-center justify-center rounded-lg">
                  <div className="bg-muted-foreground/20 size-8 rounded"></div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Visual placeholder
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
