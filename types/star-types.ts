/**
 * @description
 * Type definitions and utility types for STAR components that handle both
 * the new nested structure with kebab-case question fields and legacy string formats.
 */

import { StarSchema } from "@/db/schema/pitches-schema"

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === "string"
}

/**
 * Type guard to check if a value matches the Situation part of StarSchema
 */
export function isSituationObject(
  value: unknown
): value is StarSchema["situation"] {
  return (
    typeof value === "object" &&
    value !== null &&
    "where-and-when-did-this-experience-occur" in value
  )
}

/**
 * Type guard to check if a value matches the Task part of StarSchema
 */
export function isTaskObject(value: unknown): value is StarSchema["task"] {
  return (
    typeof value === "object" &&
    value !== null &&
    "what-was-your-responsibility-in-addressing-this-issue" in value
  )
}

/**
 * Type guard to check if a value matches the Result part of StarSchema
 */
export function isResultObject(value: unknown): value is StarSchema["result"] {
  return (
    typeof value === "object" &&
    value !== null &&
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization" in
      value
  )
}

/**
 * Type guard to check if a value matches the Action part of StarSchema
 */
export function isActionObject(value: unknown): value is StarSchema["action"] {
  return (
    typeof value === "object" &&
    value !== null &&
    "steps" in value &&
    Array.isArray((value as any).steps)
  )
}

/**
 * Parse a legacy situation string into the new structured format
 */
export function parseLegacySituation(text: string): StarSchema["situation"] {
  const result: StarSchema["situation"] = {
    "where-and-when-did-this-experience-occur": "",
    "briefly-describe-the-situation-or-challenge-you-faced": ""
  }

  const lines = text.split("\n")
  lines.forEach((line: string) => {
    if (line.startsWith("Where and when:")) {
      result["where-and-when-did-this-experience-occur"] = line
        .replace("Where and when:", "")
        .trim()
    } else if (line.startsWith("Description:")) {
      result["briefly-describe-the-situation-or-challenge-you-faced"] = line
        .replace("Description:", "")
        .trim()
    }
  })

  return result
}

/**
 * Parse a legacy task string into the new structured format
 */
export function parseLegacyTask(text: string): StarSchema["task"] {
  const result: StarSchema["task"] = {
    "what-was-your-responsibility-in-addressing-this-issue": "",
    "what-constraints-or-requirements-did-you-need-to-consider": ""
  }

  const lines = text.split("\n")
  lines.forEach((line: string) => {
    if (line.startsWith("Responsibility:")) {
      result["what-was-your-responsibility-in-addressing-this-issue"] = line
        .replace("Responsibility:", "")
        .trim()
    } else if (line.includes("constraints") || line.includes("requirements")) {
      result["what-constraints-or-requirements-did-you-need-to-consider"] =
        line.trim()
    }
  })

  return result
}

/**
 * Parse a legacy result string into the new structured format
 */
export function parseLegacyResult(text: string): StarSchema["result"] {
  const result: StarSchema["result"] = {
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": ""
  }

  const lines = text.split("\n")
  lines.forEach((line: string) => {
    if (line.startsWith("Benefit:")) {
      result[
        "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"
      ] = line.replace("Benefit:", "").trim()
    }
  })

  return result
}
