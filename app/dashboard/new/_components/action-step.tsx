/**
@description
Client sub-component for the "Action" portion of a STAR example.
Updated to use the new StarSchema structure with detailed sub-fields.
This component uses an accordion to allow the user to add multiple steps
and describe each one in detail. The steps are stored both in the main action field
and in the actionDetails.steps array.

Key Features:
- React Hook Form context
- Multiple steps with add/edit functionality
- Stores data in both the main action field and in the actionDetails sub-object
- Example ID (starExample1 or starExample2) is determined by props
@notes
The action step is more complex than other steps as it allows for multiple
nested items rather than just text fields.
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
  const storedDetails = watch(`${exampleKey}.actionDetails`)
  
  // Maximum steps limit
  const MAX_STEPS = 5
  const hasReachedMaxSteps = steps.length >= MAX_STEPS
  
  // Initial setup to create a default step if none exists
  useEffect(() => {
    if (steps.length === 0) {
      // If we have structured details with steps, convert them to our UI format
      if (storedDetails?.steps?.length) {
        const parsedSteps = storedDetails.steps.map((stepText, index) => {
          const parts = stepText.split('\n');
          let title = "";
          let description = "";
          
          // Process the text to extract title and description
          parts.forEach(part => {
            if (part.startsWith("What: ")) {
              title = part.replace("What: ", "").trim();
            } else if (part.startsWith("How: ") || part.startsWith("Outcome: ")) {
              description += part + "\n";
            }
          });
          
          return {
            id: uuidv4(),
            title,
            description: description.trim(),
            position: index + 1,
            isCompleted: Boolean(title && description)
          };
        });
        
        if (parsedSteps.length > 0) {
          setSteps(parsedSteps);
          return;
        }
      }
      // Otherwise, try to parse from the combined string (legacy support)
      else if (storedAction) {
        try {
          const sections = storedAction.split('--');
          if (sections.length > 1) {
            const parsedSteps = sections.map((section, index) => {
              const lines = section.trim().split('\n');
              let title = "";
              let description = "";
              
              lines.forEach(line => {
                if (line.startsWith("Step ") && line.includes(":")) {
                  title = line.split(":")[1].trim();
                } else {
                  description += line + "\n";
                }
              });
              
              return {
                id: uuidv4(),
                title,
                description: description.trim(),
                position: index + 1,
                isCompleted: Boolean(title && description)
              };
            });
            
            if (parsedSteps.length > 0) {
              setSteps(parsedSteps);
              return;
            }
          }
        } catch (e) {
          console.error("Error parsing action steps:", e);
        }
      }
      
      // If we couldn't parse existing data, create a default step
      setSteps([
        {
          id: uuidv4(),
          title: "",
          description: "",
          position: 1,
          isCompleted: false
        }
      ]);
    }
  }, [steps.length, storedAction, storedDetails]);
  
  // Function to build the final action string and update form values
  const updateActionValue = (updatedSteps: ActionStep[]) => {
    // Build the combined string for the main action field
    let finalActionText = "";
    const validSteps = updatedSteps.filter(step => step.title.trim() || step.description.trim());
    
    validSteps.forEach((step, index) => {
      finalActionText += `Step ${step.position}: ${step.title.trim()}\n`;
      if (step.description.trim()) {
        finalActionText += `${step.description.trim()}`;
      }
      
      // Add separator between steps
      if (index < validSteps.length - 1) {
        finalActionText += "\n--\n";
      }
    });

    // Create an array of step details for the structured data
    const stepDetails = validSteps.map(step => {
      let stepText = `What: ${step.title.trim()}`;
      if (step.description.trim()) {
        stepText += `\n${step.description.trim()}`;
      }
      return stepText;
    });
    
    // Store both the main action field and the detailed sub-fields
    setValue(`${exampleKey}.action`, finalActionText, { shouldDirty: true });
    setValue(`${exampleKey}.actionDetails`, {
      steps: stepDetails,
      approach: stepDetails.join("\n\n"), // Store a combined approach as well
    }, { shouldDirty: true });
  }
  
  // Handle saving a step
  const handleSaveStep = (stepId: string, title: string, description: string) => {
    const updatedSteps = steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          title,
          description,
          isCompleted: Boolean(title.trim() && description.trim())
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
      title: "",
      description: "",
      position: steps.length + 1,
      isCompleted: false
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
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleAddStep}
          className="w-full mt-4"
          disabled={hasReachedMaxSteps}
        >
          <Plus className="h-4 w-4 mr-2" />
          {hasReachedMaxSteps ? "Maximum Steps Reached" : "Add Step"}
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground italic">
        Note: Only one step can be edited at a time. Save each step before proceeding to the next.
      </div>
    </div>
  )
}

interface StepItemProps {
  step: ActionStep;
  onSave: (stepId: string, title: string, description: string) => void;
}

function StepItem({ step, onSave }: StepItemProps) {
  const [whatDidYouDo, setWhatDidYouDo] = useState(step.title);
  const [howDidYouDoIt, setHowDidYouDoIt] = useState(step.description);
  const [outcome, setOutcome] = useState("");
  const isComplete = step.isCompleted;
  
  // Parse existing description if it exists
  useEffect(() => {
    if (step.description) {
      const parts = step.description.split('\n');
      
      parts.forEach(part => {
        if (part.startsWith("How: ")) {
          setHowDidYouDoIt(part.replace("How: ", "").trim());
        } else if (part.startsWith("Outcome: ")) {
          setOutcome(part.replace("Outcome: ", "").trim());
        }
      });
    }
  }, [step.description]);
  
  const handleSave = () => {
    // Combine the description from both fields
    const combinedDescription = [
      howDidYouDoIt.trim() ? `How: ${howDidYouDoIt}` : "",
      outcome.trim() ? `Outcome: ${outcome}` : ""
    ].filter(Boolean).join("\n");
    
    onSave(step.id, whatDidYouDo, combinedDescription);
  };
  
  return (
    <AccordionItem value={step.id} className="border rounded-lg p-0 overflow-hidden">
      <AccordionTrigger className={cn(
        "px-4 py-3 hover:no-underline", 
        isComplete ? "text-green-600" : ""
      )}>
        <div className="flex items-center justify-between text-left w-full">
          <div className="flex-1 font-medium">
            Step {step.position} {isComplete && <Check className="inline h-4 w-4 text-green-600 ml-1" />}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-2">
        <div className="space-y-4">
          <FormField
            name={`step-${step.id}-what`}
            render={() => (
              <FormItem>
                <FormLabel>What did you specifically do in this step?</FormLabel>
                <div className="text-sm text-muted-foreground mb-2">
                  • Example: "I spoke with industry experts to get different viewpoints."
                </div>
                <FormControl>
                  <Textarea
                    value={whatDidYouDo}
                    onChange={e => setWhatDidYouDo(e.target.value)}
                    rows={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            name={`step-${step.id}-how`}
            render={() => (
              <FormItem>
                <FormLabel>How did you do it? (tools, methods, or skills)</FormLabel>
                <div className="text-sm text-muted-foreground mb-2">
                  • Example: "I arranged interviews and reviewed recent industry reports."
                </div>
                <FormControl>
                  <Textarea
                    value={howDidYouDoIt}
                    onChange={e => setHowDidYouDoIt(e.target.value)}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            name={`step-${step.id}-outcome`}
            render={() => (
              <FormItem>
                <FormLabel>What was the outcome of this step? (optional)</FormLabel>
                <div className="text-sm text-muted-foreground mb-2">
                  • Example: "I gathered valuable insights that helped shape our final solution."
                </div>
                <FormControl>
                  <Textarea
                    value={outcome}
                    onChange={e => setOutcome(e.target.value)}
                    rows={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="button" 
            onClick={handleSave} 
            className="w-full"
          >
            Save Step
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}