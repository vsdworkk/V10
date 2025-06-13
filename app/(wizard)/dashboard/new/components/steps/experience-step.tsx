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
import { PitchWizardFormData } from "../wizard/schema"
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
      className="space-y-8 overflow-hidden rounded-2xl border border-gray-100 bg-white"
      style={{
        boxShadow:
          "0 4px 12px -8px rgba(0, 0, 0, 0.01), 0 2px 4px -2px rgba(0, 0, 0, 0.005)"
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-8 p-8">
        {/* Relevant Experience */}
        <div className="space-y-4">
          <FormField
            control={control}
            name="relevantExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-4 block text-sm font-medium text-gray-700">
                  Relevant Experience (Copy and Paste Your Resume Here)
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Paste your resume, CV, or describe your relevant work experience here..."
                    className="min-h-[300px] w-full resize-none rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200"
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </motion.div>
  )
}
