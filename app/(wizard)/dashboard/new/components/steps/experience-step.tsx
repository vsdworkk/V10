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
    <div className="px-2 py-1 sm:p-6">
      {/* Mobile-optimized scrollable container with proper bottom padding for mobile nav */}
      <div className="flex h-[calc(100vh-200px)] flex-col overflow-y-auto pb-20 sm:h-auto sm:pb-2">
        <div className="mx-auto w-full max-w-4xl">
          <motion.div
            className="space-y-4 sm:space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Relevant Experience */}
            <motion.div
              variants={itemVariants}
              className="space-y-3 sm:space-y-4"
            >
              <FormField
                control={control}
                name="relevantExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-3 block text-sm font-medium text-gray-700 sm:mb-4 sm:text-base">
                      Relevant Experience
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Paste your resume, old pitches or any past work experience information here."
                        className="min-h-[250px] w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm transition-all duration-200 focus:outline-none sm:min-h-[300px] sm:p-4 sm:text-base lg:min-h-[350px]"
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
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Mobile helper text */}
            <motion.div
              variants={itemVariants}
              className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 sm:mt-6 sm:p-4 lg:hidden"
            >
              <p className="text-xs leading-relaxed text-blue-800 sm:text-sm">
                💡 <strong>Tip:</strong> Include as much relevant experience as
                possible. This helps our AI provide better suggestions for your
                pitch examples.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
