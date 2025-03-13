/**
@description
Client sub-component for the "Action" portion of a STAR example.
Updated to use the new StarSchema structure with kebab-case question fields for each step.
This component allows users to add multiple action steps, where each step has three components:
1) What did you specifically do in this step?
2) How did you do it? (tools, methods, or skills)
3) What was the outcome of this step? (optional)

Key Features:
- React Hook Form context
- Multiple steps with add/edit functionality
- Stores data directly in nested structure with an array of steps
- Example ID (starExample1 or starExample2) is determined by props
*/

"use client"

import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Check } from "lucide-react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { isString } from "@/types"
import type { ActionStep } from "@/types/action-steps-types"

interface ActionStepProps {
  exampleKey: "starExample1" | "starExample2"
}

export default function ActionStep({ exampleKey }: ActionStepProps) {
  const { watch, setValue, getValues } = useFormContext<PitchWizardFormData>()
  
  // State for our accordion steps
  const [steps, setSteps] = useState<ActionStep[]>([])
  const [openStep, setOpenStep] = useState<string | undefined>(undefined)
  
  // Watch the current values from the form
  const storedAction = watch(`${exampleKey}.action`)
  
  // Maximum steps limit
  const MAX_STEPS = 5
  const hasReachedMaxSteps = steps.length >= MAX_STEPS
  
  // Initial setup to create a default step if none exists
  useEffect(() => {
    if (steps.length === 0) {
      // If we have the new structure with steps
      if (storedAction && typeof storedAction === 'object' && 'steps' in storedAction && Array.isArray(storedAction.steps)) {
        // Convert to our UI format with unique IDs
        const parsedSteps = storedAction.steps.map((step, index) => {
          return {
            id: uuidv4(),
            position: index + 1,
            "what-did-you-specifically-do-in-this-step": step["what-did-you-specifically-do-in-this-step"] || "",
            "how-did-you-do-it-tools-methods-or-skills": step["how-did-you-do-it-tools-methods-or-skills"] || "",
            "what-was-the-outcome-of-this-step-optional": step["what-was-the-outcome-of-this-step-optional"] || "",
            isCompleted: Boolean(
              step["what-did-you-specifically-do-in-this-step"] &&
              step["how-did-you-do-it-tools-methods-or-skills"]
            ),
            // Include legacy properties for backward compatibility
            title: step["what-did-you-specifically-do-in-this-step"] || "",
            description: `How: ${step["how-did-you-do-it-tools-methods-or-skills"] || ""}\nOutcome: ${step["what-was-the-outcome-of-this-step-optional"] || ""}`
          };
        });
        
        if (parsedSteps.length > 0) {
          setSteps(parsedSteps);
          return;
        }
      }
      // Legacy support for old format
      else if (isString(storedAction)) {
        try {
          const sections = storedAction.split('--');
          if (sections.length > 1) {
            const parsedSteps = sections.map((section: string, index: number) => {
              const lines = section.trim().split('\n');
              let title = "";
              let howText = "";
              let outcomeText = "";
              
              lines.forEach((line: string) => {
                if (line.startsWith("Step ") && line.includes(":")) {
                  title = line.split(":")[1].trim();
                } else if (line.startsWith("How:")) {
                  howText = line.replace("How:", "").trim();
                } else if (line.startsWith("Outcome:")) {
                  outcomeText = line.replace("Outcome:", "").trim();
                }
              });
              
              return {
                id: uuidv4(),
                position: index + 1,
                "what-did-you-specifically-do-in-this-step": title,
                "how-did-you-do-it-tools-methods-or-skills": howText,
                "what-was-the-outcome-of-this-step-optional": outcomeText,
                isCompleted: Boolean(title && howText),
                // Include legacy properties
                title,
                description: `How: ${howText}\n${outcomeText ? `Outcome: ${outcomeText}` : ''}`
              };
            });
            
            if (parsedSteps.length > 0) {
              setSteps(parsedSteps);
              return;
            }
          }
        } catch (e) {
          console.error("Error parsing legacy action steps:", e);
        }
      }
      
      // If we couldn't parse existing data, create a default step
      setSteps([
        {
          id: uuidv4(),
          position: 1,
          "what-did-you-specifically-do-in-this-step": "",
          "how-did-you-do-it-tools-methods-or-skills": "",
          "what-was-the-outcome-of-this-step-optional": "",
          isCompleted: false,
          title: "",
          description: ""
        }
      ]);
    }
  }, [steps.length, storedAction]);
  
  // Function to update form values
  const updateActionValue = (updatedSteps: ActionStep[]) => {
    // Create an array of step objects for the new structure
    const stepData = updatedSteps
      .filter(step => 
        step["what-did-you-specifically-do-in-this-step"]?.trim() || 
        step["how-did-you-do-it-tools-methods-or-skills"]?.trim()
      )
      .map(step => ({
        stepNumber: step.position,
        "what-did-you-specifically-do-in-this-step": step["what-did-you-specifically-do-in-this-step"] || "",
        "how-did-you-do-it-tools-methods-or-skills": step["how-did-you-do-it-tools-methods-or-skills"] || "",
        "what-was-the-outcome-of-this-step-optional": step["what-was-the-outcome-of-this-step-optional"] || ""
      }));
    
    // Store in the new nested structure
    setValue(`${exampleKey}.action`, {
      steps: stepData
    }, { shouldDirty: true });
  }
  
  // Handle saving a step
  const handleSaveStep = (
    stepId: string, 
    what: string, 
    how: string, 
    outcome: string
  ) => {
    const updatedSteps = steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          "what-did-you-specifically-do-in-this-step": what,
          "how-did-you-do-it-tools-methods-or-skills": how,
          "what-was-the-outcome-of-this-step-optional": outcome,
          isCompleted: Boolean(what.trim() && how.trim()),
          // Update legacy properties
          title: what,
          description: `How: ${how}\n${outcome ? `Outcome: ${outcome}` : ''}`
        };
      }
      return step;
    });
    
    setSteps(updatedSteps);
    updateActionValue(updatedSteps);
    
    // Close the accordion after saving
    setOpenStep(undefined);
  };

  // Handle adding a new step
  const handleAddStep = () => {
    if (hasReachedMaxSteps) return;
    
    const newStep: ActionStep = {
      id: uuidv4(),
      position: steps.length + 1,
      "what-did-you-specifically-do-in-this-step": "",
      "how-did-you-do-it-tools-methods-or-skills": "",
      "what-was-the-outcome-of-this-step-optional": "",
      isCompleted: false,
      title: "",
      description: ""
    };
    
    const updatedSteps = [...steps, newStep];
    setSteps(updatedSteps);
    setOpenStep(newStep.id); // Open the newly added step
  };

  // Handle opening a step
  const handleValueChange = (value: string) => {
    if (value === "") {
      setOpenStep(undefined);
      return;
    }
    setOpenStep(value);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Document your actions in sequential steps. Add each step one by one, filling in the details and saving before moving to the next.
        </p>
      </div>
      
      <div className="bg-muted/40 p-4 rounded-lg">
        <Accordion
          type="single"
          collapsible
          value={openStep}
          onValueChange={handleValueChange}
          className="space-y-3"
        >
          {steps.map((step) => (
            <StepItem
              key={step.id}
              step={step}
              onSave={handleSaveStep}
            />
          ))}
        </Accordion>
        
        <div className="mt-4">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={hasReachedMaxSteps}
            onClick={handleAddStep}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Step {steps.length + 1}
          </Button>
          {hasReachedMaxSteps && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Maximum of {MAX_STEPS} steps reached
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface StepItemProps {
  step: ActionStep;
  onSave: (
    stepId: string,
    what: string,
    how: string,
    outcome: string
  ) => void;
}

function StepItem({ step, onSave }: StepItemProps) {
  const [what, setWhat] = useState(step["what-did-you-specifically-do-in-this-step"] || "");
  const [how, setHow] = useState(step["how-did-you-do-it-tools-methods-or-skills"] || "");
  const [outcome, setOutcome] = useState(step["what-was-the-outcome-of-this-step-optional"] || "");
  
  useEffect(() => {
    setWhat(step["what-did-you-specifically-do-in-this-step"] || "");
    setHow(step["how-did-you-do-it-tools-methods-or-skills"] || "");
    setOutcome(step["what-was-the-outcome-of-this-step-optional"] || "");
  }, [step]);
  
  const handleSave = () => {
    onSave(step.id, what, how, outcome);
  };

  return (
    <AccordionItem
      value={step.id}
      className={cn(
        "border rounded-md p-0 overflow-hidden",
        step.isCompleted ? "border-green-200 bg-green-50" : "border-muted"
      )}
    >
      <AccordionTrigger className="px-4 py-2 hover:no-underline">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className={cn(
              "w-6 h-6 rounded-full mr-3 flex items-center justify-center text-xs",
              step.isCompleted ? "bg-green-500 text-white" : "bg-muted-foreground/20"
            )}>
              {step.position}
            </div>
            <span className={cn(
              "font-medium flex-grow text-left",
              !step.isCompleted && "text-muted-foreground"
            )}>
              {step.isCompleted 
                ? what 
                : `Step ${step.position}: ${what || "Not yet completed"}`}
            </span>
          </div>
          {step.isCompleted && (
            <div className="flex-shrink-0 mr-2">
              <Check className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-4 pb-4 pt-2">
        <div className="space-y-3">
          <div className="space-y-1">
            <FormLabel htmlFor={`step-${step.id}-what`}>
              What did you specifically do in this step?
            </FormLabel>
            <div className="text-xs text-muted-foreground">
              • Example: "I analyzed the log files to identify patterns in the errors."
            </div>
            <Textarea
              id={`step-${step.id}-what`}
              value={what}
              onChange={e => setWhat(e.target.value)}
              placeholder="Describe what you did in this step..."
              className="resize-none"
            />
          </div>
          
          <div className="space-y-1">
            <FormLabel htmlFor={`step-${step.id}-how`}>
              How did you do it? (tools, methods, or skills)
            </FormLabel>
            <div className="text-xs text-muted-foreground">
              • Example: "I used log analysis tools and applied my expertise in debugging to trace the error patterns."
            </div>
            <Textarea
              id={`step-${step.id}-how`}
              value={how}
              onChange={e => setHow(e.target.value)}
              placeholder="Describe how you approached this step..."
              className="resize-none"
            />
          </div>
          
          <div className="space-y-1">
            <FormLabel htmlFor={`step-${step.id}-outcome`}>
              What was the outcome of this step? (optional)
            </FormLabel>
            <div className="text-xs text-muted-foreground">
              • Example: "I successfully identified that the issue was related to a memory leak in a specific module."
            </div>
            <Textarea
              id={`step-${step.id}-outcome`}
              value={outcome}
              onChange={e => setOutcome(e.target.value)}
              placeholder="Describe the result of this step..."
              className="resize-none"
            />
          </div>
          
          <Button 
            type="button" 
            size="sm" 
            className="mt-2"
            onClick={handleSave}
          >
            Save Step {step.position}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}