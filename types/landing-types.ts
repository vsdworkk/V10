/*
Type definitions for landing page components.
*/

import { LucideIcon } from "lucide-react"

export interface ProblemItem {
  title: string
  description: string
  icon: LucideIcon
}

export interface SectionProps {
  id?: string
  title?: string
  subtitle?: string
  description?: string
  children?: React.ReactNode
  className?: string
} 