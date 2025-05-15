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

  return (
    <motion.div
  className="space-y-8 bg-white rounded-2xl border border-gray-100 overflow-hidden"
  style={{ 
    boxShadow: '0 4px 12px -8px rgba(0, 0, 0, 0.01), 0 2px 4px -2px rgba(0, 0, 0, 0.005)' 
  }}
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Role Name */}
          <FormField control={control} name="roleName" render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel className="text-sm font-medium text-gray-700">Role Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Frontend Developer"
                  className="w-full h-12 bg-white shadow-sm border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
          
          {/* Organisation Name */}
          <FormField control={control} name="organisationName" render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel className="text-sm font-medium text-gray-700">Organisation Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Engineering"
                  className="w-full h-12 bg-white shadow-sm border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
          
          {/* Role Level */}
          <FormField control={control} name="roleLevel" render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel className="text-sm font-medium text-gray-700">Role Level</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full h-12 bg-white shadow-sm border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200">
                    <SelectValue placeholder="Select APS level" />
                  </SelectTrigger>
                  <SelectContent>
                    {["APS1","APS2","APS3","APS4","APS5","APS6","EL1"].map(l => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
          
          {/* Pitch Word Limit */}
          <FormField control={control} name="pitchWordLimit" render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel className="text-sm font-medium text-gray-700">Pitch Word Limit</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={400}
                  placeholder="Minimum 400 words"
                  className="w-full h-12 bg-white shadow-sm border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
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
                  className="w-full h-48 p-6 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
        </div>
      </div>
    </motion.div>
  )
}