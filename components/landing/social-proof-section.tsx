/*
  APSPitchPro — Horizontal rail variants (5 options derived from Variant Two)
  Focus: cards that host text cleanly with better rhythm and polish.
*/

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Testimonial = {
  id: string
  quote: string
  name: string
  role: string
  initials: string
  avatar?: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "lachie",
    quote:
      "Two applications, two interviews. That's my result with APSPitchPro after struggling with rejections. It perfectly captured the 'APS tone' and aligned my experience to the criteria, even helping me uncover examples I'd forgotten. It took all the stress out of the process and delivered real results. I can't recommend it enough for anyone serious about their APS career.",
    name: "Lachie M",
    role: "Department of Finance",
    initials: "LM",
    avatar: "https://tailus.io/images/reviews/shekinah.webp"
  },
  {
    id: "malith",
    quote:
      "I was skeptical of AI after trying tools like ChatGPT that just produced robotic, generic text. APSPitchPro is in a different league. It guided me to structure my own unique experiences, so the final pitch sounded authentically like me, while also ensuring my experience was perfectly aligned with the selection criteria and relevant APS frameworks.",
    name: "Malith G",
    role: "Australian Taxation Office",
    initials: "MG",
    avatar: "https://tailus.io/images/reviews/jonathan.webp"
  },
  {
    id: "chloe",
    quote:
      "Juggling a full-time job and applications was burning me out. I used to spend my entire weekend stressing over a single pitch. With APSPitchPro, I generated a fully compliant, tailored statement of claims in about 40 minutes. It's incredible. I've applied for three roles in the time it used to take me to write one. A massive time-saver.",
    name: "Chloe T",
    role: "Department of Finance",
    initials: "CT",
    avatar: "https://tailus.io/images/reviews/yucel.webp"
  },
  {
    id: "aaron",
    quote:
      "The blank page is the worst, I always struggle to find good examples to use in my applications. The AI guidance feature was a lifesaver, it just pulled out my best achievements that fit the criteria that I could use to build my pitch. But the final pitch blew me away. Honestly, it sounded like me, was totally compliant, and was just as good as a pitch I paid $750 for a few years back. Seriously impressed.",
    name: "Aaron M",
    role: "Department of Treasury",
    initials: "AM",
    avatar: "https://tailus.io/images/reviews/rodrigo.webp"
  }
]

function Meta({ t }: { t: Testimonial }) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-3">
      <Avatar className="size-12">
        {t.avatar ? (
          <AvatarImage
            src={t.avatar}
            alt={t.name}
            height={96}
            width={96}
            loading="lazy"
          />
        ) : null}
        <AvatarFallback>{t.initials}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">{t.name}</p>
        <p className="text-muted-foreground text-sm">{t.role}</p>
      </div>
    </div>
  )
}

function EmphasizeHighlight({ text }: { text: string }) {
  // Define phrases to highlight
  const highlightPhrases = [
    "Two applications, two interviews",
    "APSPitchPro is in a different league.",
    "I've applied for three roles in the time it used to take me to write one. A massive time-saver.",
    "it sounded like me, was totally compliant, and was just as good as a pitch I paid $750 for a few years back."
  ]

  let result = text

  // Replace each phrase with a marked version
  highlightPhrases.forEach(phrase => {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
    result = result.replace(regex, `<HIGHLIGHT>${phrase}</HIGHLIGHT>`)
  })

  // Split by highlight markers and render
  const parts = result.split(/(<HIGHLIGHT>.*?<\/HIGHLIGHT>)/g)

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("<HIGHLIGHT>") && part.endsWith("</HIGHLIGHT>")) {
          const highlightText = part.replace(/<\/?HIGHLIGHT>/g, "")
          return (
            <mark
              key={i}
              className="bg-primary/10 text-primary rounded px-1 py-0.5"
            >
              {highlightText}
            </mark>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   RAIL VARIANT A — Soft top stripe + measured text
   - Even rhythm, max line length, subtle divider before meta.
────────────────────────────────────────────────────────────────────────────── */
export function SocialProofRailVariantA() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl space-y-8 px-6">
        <header className="text-center">
          <h2 className="text-4xl font-semibold tracking-tight lg:text-5xl">
            What our users are saying
          </h2>
        </header>

        <div className="[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-1">
            {TESTIMONIALS.map(t => (
              <Card
                key={t.id}
                className="bg-card/80 relative w-[88%] shrink-0 snap-center overflow-hidden rounded-xl border sm:w-[520px]"
              >
                <div className="via-primary/70 pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent to-transparent" />
                <CardContent className="p-6">
                  <div className="grid h-full grid-rows-[1fr_auto] gap-6">
                    <p className="text-pretty text-[1.05rem] leading-7 tracking-tight md:text-lg md:leading-8">
                      {t.quote}
                    </p>
                    <div>
                      <hr className="border-border/60 mb-4 mt-2" />
                      <Meta t={t} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   RAIL VARIANT B — Left rule quote
   - Indented block with inner left border, large opening mark.
────────────────────────────────────────────────────────────────────────────── */
export function SocialProofRailVariantB() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl space-y-8 px-6">
        <header className="text-center">
          <h2 className="text-4xl font-semibold tracking-tight lg:text-5xl">
            What our users are saying
          </h2>
        </header>

        <div className="[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-1">
            {TESTIMONIALS.map(t => (
              <Card
                key={t.id}
                className="bg-card/90 w-[85%] shrink-0 snap-center rounded-xl border sm:w-[520px]"
              >
                <CardContent className="p-6">
                  <div className="grid h-full grid-rows-[1fr_auto] gap-6">
                    <div className="relative pl-4">
                      <span
                        aria-hidden
                        className="text-muted-foreground/20 absolute -left-1 -top-2 text-6xl leading-none"
                      >
                        “
                      </span>
                      <div className="border-l pl-4">
                        <p className="text-pretty text-[1.05rem] leading-7 md:text-lg md:leading-8">
                          {t.quote}
                        </p>
                      </div>
                    </div>
                    <Meta t={t} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   RAIL VARIANT C — Meta-first
   - Avatar and name first, then the quote; clearer scannability.
────────────────────────────────────────────────────────────────────────────── */
export function SocialProofRailVariantC() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl space-y-8 px-6">
        <header className="text-center">
          <h2 className="text-4xl font-semibold tracking-tight lg:text-5xl">
            What our users are saying
          </h2>
        </header>

        <div className="[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-1">
            {TESTIMONIALS.map(t => (
              <Card
                key={t.id}
                className="bg-card/80 w-[86%] shrink-0 snap-center rounded-xl border sm:w-[520px]"
              >
                <CardContent className="p-6">
                  <div className="grid h-full grid-rows-[auto_1fr] gap-4">
                    <Meta t={t} />
                    <p className="text-balance text-[1.05rem] leading-7 md:text-lg md:leading-8">
                      {t.quote}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   RAIL VARIANT D — Compact tiles
   - Narrower measure, stronger shadow, tight rhythm for dense rails.
────────────────────────────────────────────────────────────────────────────── */
export function SocialProofRailVariantD() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl space-y-8 px-6">
        <header className="text-center">
          <h2 className="text-4xl font-semibold tracking-tight lg:text-5xl">
            What our users are saying
          </h2>
        </header>

        <div className="[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-1">
            {TESTIMONIALS.map(t => (
              <Card
                key={t.id}
                className="bg-card/90 w-[78%] shrink-0 snap-center rounded-xl border shadow-sm sm:w-[440px]"
              >
                <CardContent className="p-6">
                  <div className="grid h-full grid-rows-[1fr_auto] gap-5">
                    <p className="text-pretty text-base leading-7 md:text-[1.05rem] md:leading-7">
                      {t.quote}
                    </p>
                    <Meta t={t} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   RAIL VARIANT E — Magazine highlight
   - Product name highlighted; thin top+bottom rules; airy spacing.
────────────────────────────────────────────────────────────────────────────── */
export function SocialProofRailVariantE() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl space-y-8 px-6">
        <header className="text-center">
          <h2 className="text-4xl font-semibold tracking-tight lg:text-5xl">
            What our users are saying
          </h2>
        </header>

        <div className="[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-1">
            {TESTIMONIALS.map(t => (
              <Card
                key={t.id}
                className="bg-card/80 relative w-[88%] shrink-0 snap-center overflow-hidden rounded-xl border sm:w-[520px]"
              >
                <div className="bg-border/80 absolute inset-x-0 top-0 h-px" />
                <div className="bg-border/80 absolute inset-x-0 bottom-0 h-px" />
                <CardContent className="p-6">
                  <div className="grid h-full grid-rows-[1fr_auto] gap-6">
                    <p className="text-pretty text-[1.05rem] leading-7 md:text-lg md:leading-8">
                      <EmphasizeHighlight text={t.quote} />
                    </p>
                    <Meta t={t} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export const SocialProofSection = SocialProofRailVariantE
