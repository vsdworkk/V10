export type Section =
  | "INTRO"
  | "ROLE"
  | "EXP"
  | "GUIDE"
  | "STAR"
  | "FINAL"

export type StarSubStep = "SITUATION" | "TASK" | "ACTION" | "RESULT"

export interface WizardStep {
  id: string // unique route id or identifier
  section: Section
  header: string
  starIndex?: number // 1‑based when section === "STAR"
  starSubStep?: StarSubStep
} 