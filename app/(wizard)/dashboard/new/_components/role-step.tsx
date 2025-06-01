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
export default function RoleStep() {
  const { control, watch, formState } = useFormContext<PitchWizardFormData>()
  const pitchLimitChoice = watch("pitchWordLimit")

  const { errors } = formState

  return (
    <div className="w-full h-full lg:max-w-3xl lg:mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="space-y-4 lg:space-y-6">
          {/* Role Name */}
          <motion.div variants={itemVariants} className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">Role Name</FormLabel>
            <FormField
              control={control}
              name="roleName"
              render={({ field }) => (
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Senior Policy Analyst"
                    className="w-full h-12 lg:h-12 bg-white border border-gray-200 rounded-lg px-4 text-base lg:text-sm transition-all duration-200"
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
          </motion.div>

          {/* Organisation Name */}
          <motion.div variants={itemVariants} className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">Organisation Name</FormLabel>
            <FormField
              control={control}
              name="organisationName"
              render={({ field }) => (
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Department of Public Works"
                    className="w-full h-12 lg:h-12 bg-white border border-gray-200 rounded-lg px-4 text-base lg:text-sm transition-all duration-200"
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
          </motion.div>

          {/* Role Level and Pitch Word Limit - Side by side on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Role Level */}
            <motion.div variants={itemVariants} className="space-y-2">
              <FormLabel className="text-sm font-medium text-gray-700">Role Level</FormLabel>
              <FormField
                control={control}
                name="roleLevel"
                render={({ field }) => (
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full h-12 lg:h-12 bg-white border border-gray-200 rounded-lg px-4 text-base lg:text-sm transition-all duration-200"
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
              {errors.roleLevel && (
                <p className="text-red-500 text-sm mt-1">{errors.roleLevel.message}</p>
              )}
            </motion.div>

            {/* Pitch Word Limit */}
            <motion.div variants={itemVariants} className="space-y-2">
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
                      className="w-full h-12 lg:h-12 bg-white border border-gray-200 rounded-lg px-4 text-base lg:text-sm transition-all duration-200"
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
              {errors.pitchWordLimit && (
                <p className="text-red-500 text-sm mt-1">{errors.pitchWordLimit.message}</p>
              )}
            </motion.div>
          </div>

          {/* Role Description (Optional) */}
          <motion.div variants={itemVariants} className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              Role Description 
              <span className="text-gray-400 font-normal ml-1">(Optional)</span>
            </FormLabel>
            <FormField
              control={control}
              name="roleDescription"
              render={({ field }) => (
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe your role and key responsibilities..."
                    className="w-full min-h-[100px] lg:min-h-[120px] bg-white border border-gray-200 rounded-lg p-4 text-base lg:text-sm resize-none transition-all duration-200"
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
            {errors.roleDescription && (
              <p className="text-red-500 text-sm mt-1">{errors.roleDescription.message}</p>
            )}
          </motion.div>
        </div>

        {/* Mobile helper text */}
        <div className="lg:hidden bg-blue-50 border border-blue-200 rounded-lg p-3 mt-6">
          <p className="text-sm text-blue-800 leading-relaxed">
            💡 <strong>Tip:</strong> Fill out all required fields to continue to the next step. 
            You can always come back and edit your responses later.
          </p>
        </div>
      </motion.div>
    </div>
  )
}