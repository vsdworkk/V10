"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

const THINKING_PHRASES = [
  "Analyzing your experience",
  "Mapping your strengths",
  "Crafting your narrative",
  "Finalizing your pitch"
] as const

const TICK_MS = 80
const STEP = 0.2

function useProgress(active: boolean) {
  const [pct, setPct] = useState(0)
  const [phraseIdx, setPhraseIdx] = useState(0)

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      setPct(prev => Math.min(prev + STEP, 100))
    }, TICK_MS)
    return () => clearInterval(id)
  }, [active])

  useEffect(() => {
    const bucket = Math.floor(pct / (100 / THINKING_PHRASES.length))
    setPhraseIdx(Math.min(bucket, THINKING_PHRASES.length - 1))
  }, [pct])

  return { pct, phrase: THINKING_PHRASES[phraseIdx] }
}

interface LoaderProps {
  visible?: boolean
  onComplete?: () => void
  onCancel?: () => void
  className?: string
  errorMessage?: string | null
}

export default function AIThinkingLoader({
  visible = true,
  onComplete,
  onCancel,
  className = "",
  errorMessage
}: LoaderProps) {
  const [open, setOpen] = useState(visible)
  const { pct, phrase } = useProgress(open && !errorMessage)

  useEffect(() => {
    if (pct >= 100 && onComplete) onComplete()
  }, [pct, onComplete])

  useEffect(() => {
    setOpen(visible)
  }, [visible])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`bg-background/30 flex items-center justify-center rounded-md ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.section
            className="from-background via-muted/40 to-muted/20 relative w-full max-w-lg rounded-xl border bg-gradient-to-br p-6 shadow-sm"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            role="status"
            aria-live="polite"
          >
            {/* Close */}
            {onCancel && (
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground absolute right-2 top-2 size-7"
                onClick={onCancel}
                aria-label="Cancel generation"
              >
                <X className="size-4" />
              </Button>
            )}

            {errorMessage ? (
              <div className="space-y-2 py-2 text-center">
                <p className="text-destructive font-medium">Error occurred</p>
                <p className="text-muted-foreground text-sm">{errorMessage}</p>
                {onCancel && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={onCancel}
                  >
                    Start from scratch
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Gooey animation */}
                <div className="mx-auto mb-4 flex size-28 items-center justify-center">
                  <GooeyBlob />
                </div>

                {/* Phrase */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={phrase}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: "-5%" }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="-mt-1 min-h-[1.25rem] bg-clip-text text-center text-[1.125rem] font-medium tracking-tight text-transparent drop-shadow-sm sm:text-[1.25rem]"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, #444ec1, #7c3aed, #db2777)"
                    }}
                  >
                    {phrase}...
                  </motion.p>
                </AnimatePresence>
              </>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function GooeyBlob() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#444ec1" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
            result="goo"
          />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="18" fill="url(#g)">
        <animate
          attributeName="r"
          values="18;22;19;21;18"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      <g filter="url(#goo)">
        {BLOBS.map(({ r, path, dur }, i) => (
          <circle key={i} cx="50" cy="50" r={r} fill="url(#g)">
            <animate
              attributeName="cx"
              values={path.x}
              dur={dur}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={path.y}
              dur={dur}
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values={`${r};${r + 2};${r}`}
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>
    </svg>
  )
}

const BLOBS = [
  {
    r: 8,
    dur: "6s",
    path: { x: "50;65;75;60;35;25;40;50", y: "50;40;60;75;65;40;30;50" }
  },
  {
    r: 7,
    dur: "7s",
    path: { x: "50;35;20;40;70;80;60;50", y: "50;65;50;30;35;60;70;50" }
  },
  {
    r: 6,
    dur: "5s",
    path: { x: "50;60;75;65;40;25;35;50", y: "50;35;50;70;80;65;40;50" }
  },
  {
    r: 5,
    dur: "3.5s",
    path: { x: "50;65;55;35;45;70;50", y: "50;40;70;65;35;30;50" }
  },
  {
    r: 4,
    dur: "4.2s",
    path: { x: "50;45;60;75;65;40;30;50", y: "50;60;45;55;75;70;50;50" }
  }
] as const
