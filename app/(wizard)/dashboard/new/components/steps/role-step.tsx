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
 - Mobile-first responsive design

@dependencies
React Hook Form, zod for validation
Shadcn UI components for consistent styling

@notes
We replaced the old dropdown for pitchWordLimit with a numeric Input.
We replaced old roleLevel items with APS1, APS2, APS3, APS4, APS5, APS6, EL1.
*/
"use client"

import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "../wizard/schema"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
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
export default function RoleStep() {
  const { control, watch, formState } = useFormContext<PitchWizardFormData>()
  const pitchLimitChoice = watch("pitchWordLimit")

  const { errors } = formState

  return (
    <div className="size-full space-y-6 p-4 sm:p-6 lg:mx-auto lg:max-w-3xl lg:space-y-8 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="space-y-4 lg:space-y-6">
          {/* Role Name */}
          <motion.div variants={itemVariants} className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              Role Name
            </FormLabel>
            <FormField
              control={control}
              name="roleName"
              render={({ field }) => (
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Senior Policy Analyst"
                    className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-base transition-all duration-200 lg:h-12 lg:text-sm"
                    style={
                      {
                        "--focus-ring-color": "#444ec1",
                        "--focus-border-color": "#444ec1"
                      } as React.CSSProperties
                    }
                    onFocus={e => {
                      e.target.style.borderColor = "#444ec1"
                      e.target.style.boxShadow =
                        "0 0 0 1px rgba(68, 78, 193, 0.1)"
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </FormControl>
              )}
            />
            {errors.roleName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.roleName.message}
              </p>
            )}
          </motion.div>

          {/* Organisation Name */}
          <motion.div variants={itemVariants} className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              Organisation Name
            </FormLabel>
            <FormField
              control={control}
              name="organisationName"
              render={({ field }) => (
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Department of Public Works"
                    className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-base transition-all duration-200 lg:h-12 lg:text-sm"
                    style={
                      {
                        "--focus-ring-color": "#444ec1",
                        "--focus-border-color": "#444ec1"
                      } as React.CSSProperties
                    }
                    onFocus={e => {
                      e.target.style.borderColor = "#444ec1"
                      e.target.style.boxShadow =
                        "0 0 0 1px rgba(68, 78, 193, 0.1)"
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </FormControl>
              )}
            />
            {errors.organisationName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.organisationName.message}
              </p>
            )}
          </motion.div>

          {/* Role Level and Pitch Word Limit - Side by side on larger screens */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            {/* Role Level */}
            <motion.div variants={itemVariants} className="space-y-2">
              <FormLabel className="text-sm font-medium text-gray-700">
                Role Level
              </FormLabel>
              <FormField
                control={control}
                name="roleLevel"
                render={({ field }) => (
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-base transition-all duration-200 lg:h-12 lg:text-sm"
                        style={
                          {
                            "--focus-ring-color": "#444ec1",
                            "--focus-border-color": "#444ec1"
                          } as React.CSSProperties
                        }
                        onFocus={e => {
                          e.currentTarget.style.borderColor = "#444ec1"
                          e.currentTarget.style.boxShadow =
                            "0 0 0 1px rgba(68, 78, 193, 0.1)"
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderColor = "#e5e7eb"
                          e.currentTarget.style.boxShadow = "none"
                        }}
                      >
                        <SelectValue placeholder="Select APS level" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "APS1",
                          "APS2",
                          "APS3",
                          "APS4",
                          "APS5",
                          "APS6",
                          "EL1"
                        ].map(l => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                )}
              />
              {errors.roleLevel && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.roleLevel.message}
                </p>
              )}
            </motion.div>

            {/* Pitch Word Limit */}
            <motion.div variants={itemVariants} className="space-y-2">
              <FormLabel className="text-sm font-medium text-gray-700">
                Pitch Word Limit
              </FormLabel>
              <FormField
                control={control}
                name="pitchWordLimit"
                render={({ field }) => (
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={e => field.onChange(e.target.valueAsNumber)}
                      min={400}
                      max={1000}
                      placeholder="Enter between 400 and 1000 words"
                      className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-base transition-all duration-200 lg:h-12 lg:text-sm"
                      style={
                        {
                          "--focus-ring-color": "#444ec1",
                          "--focus-border-color": "#444ec1"
                        } as React.CSSProperties
                      }
                      onFocus={e => {
                        e.target.style.borderColor = "#444ec1"
                        e.target.style.boxShadow =
                          "0 0 0 1px rgba(68, 78, 193, 0.1)"
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = "#e5e7eb"
                        e.target.style.boxShadow = "none"
                      }}
                    />
                  </FormControl>
                )}
              />
              {errors.pitchWordLimit && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.pitchWordLimit.message}
                </p>
              )}
            </motion.div>
          </div>

          {/* Role Description */}
          <motion.div variants={itemVariants} className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              Role Description
            </FormLabel>
            <FormField
              control={control}
              name="roleDescription"
              render={({ field }) => (
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe your role and key responsibilities..."
                    className="min-h-[100px] w-full resize-none rounded-lg border border-gray-200 bg-white p-4 text-base transition-all duration-200 lg:min-h-[120px] lg:text-sm"
                    style={
                      {
                        "--focus-ring-color": "#444ec1",
                        "--focus-border-color": "#444ec1"
                      } as React.CSSProperties
                    }
                    onFocus={e => {
                      e.target.style.borderColor = "#444ec1"
                      e.target.style.boxShadow =
                        "0 0 0 1px rgba(68, 78, 193, 0.1)"
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "#e5e7eb"
                      e.target.style.boxShadow = "none"
                    }}
                  />
                </FormControl>
              )}
            />
            {errors.roleDescription && (
              <p className="mt-1 text-sm text-red-500">
                {errors.roleDescription.message}
              </p>
            )}
          </motion.div>
        </div>

        {/* Mobile helper text */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-3 lg:hidden">
          <p className="text-sm leading-relaxed text-blue-800">
            💡 <strong>Tip:</strong> Fill out all required fields to continue to
            the next step. You can always come back and edit your responses
            later.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
