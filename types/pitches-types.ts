/*
Type definitions for pitch-related data structures.
*/

export interface StarActionStep {
  stepNumber: number
  "what-did-you-specifically-do-in-this-step": string
  "what-was-the-outcome-of-this-step-optional"?: string
}

export interface StarSchema {
  situation: {
    "where-and-when-did-this-experience-occur"?: string
    "briefly-describe-the-situation-or-challenge-you-faced"?: string
  }
  task: {
    "what-was-your-responsibility-in-addressing-this-issue"?: string
    "what-constraints-or-requirements-did-you-need-to-consider"?: string
  }
  action: {
    steps: StarActionStep[]
  }
  result: {
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"?: string
  }
}

export type StarJsonbSchema = StarSchema[]
