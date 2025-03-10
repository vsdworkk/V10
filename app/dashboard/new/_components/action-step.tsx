/**
@description
Client sub-component for the "Action" portion of a STAR example.
Allows users to add multiple sequential action steps with only one expanded at a time.
Each step can be saved and collapsed individually.

Key Features:
- React Hook Form context
- Sequential steps (Step 1, Step 2, etc.)
- Accordion UI with single-expansion behavior
- Individual save button per step
*/

"use client"

import { useFormContext } from "react-hook-form"
import { PitchWizardFormData } from "./pitch-wizard"
import { useState, useRef } from "react"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { Plus, Check } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { cn } from "@/lib/utils"

interface ActionStep {
  id: string;
  title: string;
  description: string;
  position: number;
  isCompleted: boolean;
}

interface ActionStepProps {
  exampleKey: "starExample1" | "starExample2"
}

export default function ActionStep({ exampleKey }: ActionStepProps) {
  const { setValue, getValues } = useFormContext<PitchWizardFormData>()
  const [steps, setSteps] = useState<ActionStep[]>([
    {
      id: uuidv4(),
      title: "",
      description: "",
      position: 1,
      isCompleted: false
    }
  ])
  const [openStep, setOpenStep] = useState<string | undefined>(steps[0]?.id)
  
  // Maximum number of steps allowed
  const MAX_STEPS = 5;
  const hasReachedMaxSteps = steps.length >= MAX_STEPS;
  
  // Create a function to build the combined action string from all steps
  const buildActionString = (actionSteps: ActionStep[]) => {
    return actionSteps
      .filter(step => step.isCompleted && (step.title || step.description))
      .sort((a, b) => a.position - b.position)
      .map(step => {
        let stepText = `Step ${step.position}`;
        if (step.title) {
          stepText += `: ${step.title}`;
        }
        if (step.description) {
          stepText += `\n${step.description}`;
        }
        return stepText;
      })
      .join("\n\n");
  };

  // When any step is saved, update the form data
  const updateFormValue = (updatedSteps: ActionStep[]) => {
    const actionString = buildActionString(updatedSteps);
    setValue(`${exampleKey}.action`, actionString, { shouldDirty: true });
  };

  // Handle saving a step
  const handleSaveStep = (stepId: string, title: string, description: string) => {
    const updatedSteps = steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          title,
          description,
          isCompleted: true
        };
      }
      return step;
    });
    
    setSteps(updatedSteps);
    updateFormValue(updatedSteps);
    setOpenStep(undefined); // Close the step after saving
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