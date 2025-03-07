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
      <h2 className="text-xl font-semibold mb-4">Action Steps</h2>
      <div className="text-sm text-muted-foreground mb-4">
        Add sequential steps to document your actions clearly and concisely.
      </div>
      
      <Accordion
        type="single"
        collapsible
        value={openStep}
        onValueChange={handleValueChange}
        className="space-y-4"
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
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Step
      </Button>
    </div>
  )
}

interface StepItemProps {
  step: ActionStep;
  onSave: (stepId: string, title: string, description: string) => void;
}

function StepItem({ step, onSave }: StepItemProps) {
  const [title, setTitle] = useState(step.title);
  const [description, setDescription] = useState(step.description);
  const isComplete = step.isCompleted;
  
  const handleSave = () => {
    onSave(step.id, title, description);
  };
  
  return (
    <AccordionItem value={step.id} className="border rounded-lg p-0 overflow-hidden">
      <AccordionTrigger className={cn(
        "px-4 py-3 hover:no-underline", 
        isComplete ? "text-green-600" : ""
      )}>
        <div className="flex items-center text-left">
          <div className="flex-1">
            {isComplete && title ? title : `Step ${step.position}`}
          </div>
          {isComplete && (
            <Check className="h-4 w-4 text-green-600 ml-2 mr-4" />
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-2">
        <div className="space-y-4">
          <FormField
            name={`step-${step.id}-title`}
            render={() => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What did you do? (e.g., 'Implemented automated testing')"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    rows={1}
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            name={`step-${step.id}-description`}
            render={() => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the actions you took in detail..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="button" 
            onClick={handleSave}
            className="w-full mt-2"
          >
            Save
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}