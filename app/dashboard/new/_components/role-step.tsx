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
import { PitchWizardFormData } from "./pitch-wizard"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
  FormDescription
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
import { Briefcase, Building2, Scale, FileText, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

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

  // We'll watch the pitchWordLimit for dynamic logic in the wizard
  const pitchLimitChoice = watch("pitchWordLimit")

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Name */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-muted/60 hover:border-primary/60 transition-colors">
            <div className="bg-muted/30 p-3 border-b flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary/80" />
              <h3 className="font-medium">Role Name</h3>
            </div>
            <CardContent className="p-4 pt-5">
              <FormField
                control={control}
                name="roleName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Administrative Officer"
                        className="bg-background"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the exact title of the role you're applying for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Organisation Name */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-muted/60 hover:border-primary/60 transition-colors">
            <div className="bg-muted/30 p-3 border-b flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary/80" />
              <h3 className="font-medium">Organisation Name</h3>
            </div>
            <CardContent className="p-4 pt-5">
              <FormField
                control={control}
                name="organisationName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Department of Finance"
                        value={field.value ?? ""}
                        className="bg-background"
                      />
                    </FormControl>
                    <FormDescription>
                      The department or agency you're applying to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Level */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-muted/60 hover:border-primary/60 transition-colors">
            <div className="bg-muted/30 p-3 border-b flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary/80" />
              <h3 className="font-medium">Role Level</h3>
            </div>
            <CardContent className="p-4 pt-5">
              <FormField
                control={control}
                name="roleLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select APS level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="APS1">APS1</SelectItem>
                          <SelectItem value="APS2">APS2</SelectItem>
                          <SelectItem value="APS3">APS3</SelectItem>
                          <SelectItem value="APS4">APS4</SelectItem>
                          <SelectItem value="APS5">APS5</SelectItem>
                          <SelectItem value="APS6">APS6</SelectItem>
                          <SelectItem value="EL1">EL1</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Select the classification level for this position
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Pitch Word Limit */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-muted/60 hover:border-primary/60 transition-colors">
            <div className="bg-muted/30 p-3 border-b flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary/80" />
              <h3 className="font-medium">Pitch Word Limit</h3>
            </div>
            <CardContent className="p-4 pt-5">
              <FormField
                control={control}
                name="pitchWordLimit"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="400"
                        placeholder="Minimum 400 words"
                        className={cn(
                          "bg-background",
                          (field.value !== undefined && field.value < 400) ? "border-red-500 focus-visible:ring-red-500" : ""
                        )}
                        onChange={(e) => {
                          // Convert string value to number
                          const value = parseInt(e.target.value) || 0;
                          field.onChange(value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the maximum word count for your pitch (minimum 400)
                    </FormDescription>
                    {field.value !== undefined && field.value < 400 ? (
                      <p className="text-red-500 text-sm mt-1">Word limit must be at least 400</p>
                    ) : (
                      <FormMessage />
                    )}
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Optional Role Description */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-muted/60 hover:border-primary/60 transition-colors">
          <div className="bg-muted/30 p-3 border-b flex items-center gap-2">
            <Info className="h-5 w-5 text-primary/80" />
            <h3 className="font-medium">Role Description</h3>
          </div>
          <CardContent className="p-4 pt-5">
            <FormField
              control={control}
              name="roleDescription"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Paste or type the official role description here..."
                      {...field}
                      value={field.value || ""}
                      className="h-[80px] min-h-[80px] bg-background"
                    />
                  </FormControl>
                  <FormDescription>
                    Adding the job description helps Albert generate a more tailored pitch
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}