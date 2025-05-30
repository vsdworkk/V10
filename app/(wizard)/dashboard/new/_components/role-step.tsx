/**
@description
Client sub-component for wizard Step 1: Role Information.
Collects:
 - roleName
 - organisationName
 - roleLevel (now APS1, APS2, APS3, APS4, APS5, APS6, EL1)
 - pitchWordLimit (numeric input for any value > 0)
 - roleDescription (optional)

Key Features:
 - Uses React Hook Form context from the wizard
 - Provides basic inputs with label + error display
 - Word limit is now a numeric text field allowing any value greater than 0.

@dependencies
React Hook Form, zod for validation
Shadcn UI components for consistent styling

@notes
We replaced the old dropdown for pitchWordLimit with a numeric Input.
We replaced old roleLevel items with APS1, APS2, APS3, APS4, APS5, APS6, EL1.
*/
"use client"

import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard/schema"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

/**
@function RoleStep
@description
Wizard step to capture role-level info:
 - Role Name
 - Organisation Name
 - Role Level (APS1...EL1)
 - Word Limit (<500...<1000)
 - Optional Role Description
*/
// Updated RoleStep Component
export default function RoleStep() {
  const { control, watch, formState } = useFormContext<PitchWizardFormData>()
  const pitchLimitChoice = watch("pitchWordLimit")

  const { errors } = formState

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <div className="space-y-6">
        <div className="space-y-4">
          {/* Role Name */}
          <div className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">Role Name</FormLabel>
            <FormField
              control={control}
              name="roleName"
              render={({ field }) => (
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Senior Policy Analyst"
                    className="w-full h-12 bg-white border border-gray-200 rounded-lg px-4 transition-all duration-200"
                    style={{
                      '--focus-ring-color': '#444ec1',
                      '--focus-border-color': '#444ec1'
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#444ec1'
                      e.target.style.boxShadow = '0 0 0 1px rgba(68, 78, 193, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </FormControl>
              )}
            />
            {errors.roleName && (
              <p className="text-red-500 text-sm mt-1">{errors.roleName.message}</p>
            )}
          </div>

          {/* Organisation Name */}
          <div className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">Organisation Name</FormLabel>
            <FormField
              control={control}
              name="organisationName"
              render={({ field }) => (
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Department of Public Works"
                    className="w-full h-12 bg-white border border-gray-200 rounded-lg px-4 transition-all duration-200"
                    style={{
                      '--focus-ring-color': '#444ec1',
                      '--focus-border-color': '#444ec1'
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#444ec1'
                      e.target.style.boxShadow = '0 0 0 1px rgba(68, 78, 193, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </FormControl>
              )}
            />
            {errors.organisationName && (
              <p className="text-red-500 text-sm mt-1">{errors.organisationName.message}</p>
            )}
          </div>

          {/* Role Level */}
          <div className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">Role Level</FormLabel>
            <FormField
              control={control}
              name="roleLevel"
              render={({ field }) => (
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full h-12 bg-white border border-gray-200 rounded-lg px-4 transition-all duration-200"
                      style={{
                        '--focus-ring-color': '#444ec1',
                        '--focus-border-color': '#444ec1'
                      } as React.CSSProperties}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#444ec1'
                        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(68, 78, 193, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.boxShadow = 'none'
                      }}>
                      <SelectValue placeholder="Select APS level" />
                    </SelectTrigger>
                    <SelectContent>
                      {["APS1","APS2","APS3","APS4","APS5","APS6","EL1"].map(l => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              )}
            />
          </div>

          {/* Pitch Word Limit */}
          <div className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">Pitch Word Limit</FormLabel>
            <FormField
              control={control}
              name="pitchWordLimit"
              render={({ field }) => (
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={400}
                    placeholder="Minimum 400 words"
                    className="w-full h-12 bg-white border border-gray-200 rounded-lg px-4 transition-all duration-200"
                    style={{
                      '--focus-ring-color': '#444ec1',
                      '--focus-border-color': '#444ec1'
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#444ec1'
                      e.target.style.boxShadow = '0 0 0 1px rgba(68, 78, 193, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb'
                      e.target.style.boxShadow = 'none'
                    }}
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
              )}
            />
          </div>
        </div>

        {/* Optional Role Description */}
        <div className="space-y-4">
          <FormField control={control} name="roleDescription" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Role Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe the responsibilities and requirements for this role..."
                  className="w-full h-48 p-4 bg-white border border-gray-200 rounded-lg transition-all duration-200 resize-none"
                  style={{
                    '--focus-ring-color': '#444ec1',
                    '--focus-border-color': '#444ec1'
                  } as React.CSSProperties}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#444ec1'
                    e.target.style.boxShadow = '0 0 0 1px rgba(68, 78, 193, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
        </div>
      </div>
    </div>
  )
}