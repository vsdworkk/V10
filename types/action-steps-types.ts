/*
Contains types for the action steps feature.
*/

export interface ActionStep {
  id: string;
  title: string;
  description: string;
  position: number;
  isCompleted: boolean;
}

export type ActionStepFormData = Omit<ActionStep, 'id' | 'position' | 'isCompleted'>; 