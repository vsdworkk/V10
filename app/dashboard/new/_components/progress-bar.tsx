"use client"

import { useEffect, useState } from "react"

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  completedSteps: number[]
}

export default function ProgressBar({ currentStep, totalSteps, completedSteps }: ProgressBarProps) {
  // Calculate progress percentage
  const calculateProgress = () => {
    // If we're at the first step and nothing is completed yet, show minimal progress
    if (currentStep === 1 && completedSteps.length === 0) {
      return (1 / totalSteps) * 100;
    }
    
    // Otherwise, show progress based on the number of completed steps + current step
    return Math.min(((completedSteps.length + 1) / totalSteps) * 100, 100);
  };

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">
          {completedSteps.length} of {totalSteps} completed
        </span>
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      
      <div className="relative">
        {/* Thicker progress bar */}
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>
    </div>
  )
} 