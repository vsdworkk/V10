/**
@description
Client sub-component for wizard Step 2: Experience Information.
Collects:
- yearsExperience
- relevantExperience
- optional resume file selection (WITHOUT a manual upload button).
When the user clicks "Next" in the main wizard, the file is automatically
uploaded to Supabase if present.

@dependencies
- React Hook Form context from the wizard
- Shadcn UI form components
@notes
We removed the old "Upload Resume" button and manual upload flow. Instead,
when the user clicks "Next" from Step 2, pitch-wizard.tsx will handle the
actual file upload if a file is present.
*/
"use client"
import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard/schema"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"

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

export default function ExperienceStep() {
  const { control } = useFormContext<PitchWizardFormData>()

  return (
    <motion.div
      className="space-y-8 bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{
        boxShadow:
          "0 4px 12px -8px rgba(0, 0, 0, 0.01), 0 2px 4px -2px rgba(0, 0, 0, 0.005)"
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="p-4 sm:p-8 space-y-8">
        {/* Relevant Experience */}
        <div className="space-y-4">
          <FormField
            control={control}
            name="relevantExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 mb-4 block">
                  Relevant Experience (Copy and Paste Your Resume Here)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe achievements, responsibilities, and skills relevant to this role..."
                    className="w-full min-h-[300px] p-6 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </motion.div>
  )
}
