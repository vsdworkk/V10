/**
 * Test script to verify the nested STAR example structure with kebab-case question fields
 * 
 * This script tests:
 * 1. Legacy format parsing to new format
 * 2. New format validation
 * 3. AI prompt generation with both formats
 */

// Mock the utility functions since we can't import them directly
// These functions simulate the behavior of the actual utility functions

function isString(value) {
  return typeof value === 'string';
}

function parseLegacySituation(situationText) {
  if (!isString(situationText)) return situationText;
  
  const lines = situationText.split('\n');
  const result = {};
  
  for (const line of lines) {
    if (line.toLowerCase().startsWith('where and when:')) {
      result['where-and-when-did-this-experience-occur'] = line.substring('where and when:'.length).trim();
    } else if (line.toLowerCase().startsWith('description:')) {
      result['briefly-describe-the-situation-or-challenge-you-faced'] = line.substring('description:'.length).trim();
    } else if (line.toLowerCase().startsWith('why it mattered:')) {
      result['why-was-this-a-problem-or-why-did-it-matter'] = line.substring('why it mattered:'.length).trim();
    }
  }
  
  return result;
}

function parseLegacyTask(taskText) {
  if (!isString(taskText)) return taskText;
  
  const lines = taskText.split('\n');
  const result = {};
  
  for (const line of lines) {
    if (line.toLowerCase().startsWith('responsibility:')) {
      result['what-was-your-responsibility-in-addressing-this-issue'] = line.substring('responsibility:'.length).trim();
    } else if (line.toLowerCase().startsWith('how it would help:')) {
      result['how-would-completing-this-task-help-solve-the-problem'] = line.substring('how it would help:'.length).trim();
    } else if (line.toLowerCase().includes('constraints')) {
      result['what-constraints-or-requirements-did-you-need-to-consider'] = line.trim();
    }
  }
  
  return result;
}

function parseLegacyResult(resultText) {
  if (!isString(resultText)) return resultText;
  
  const lines = resultText.split('\n');
  const result = {};
  
  for (const line of lines) {
    if (line.toLowerCase().startsWith('outcome:')) {
      result['what-positive-outcome-did-you-achieve'] = line.substring('outcome:'.length).trim();
    } else if (line.toLowerCase().startsWith('benefit:')) {
      result['how-did-this-outcome-benefit-your-team-stakeholders-or-organization'] = line.substring('benefit:'.length).trim();
    } else if (line.toLowerCase().startsWith('lessons:')) {
      result['what-did-you-learn-from-this-experience'] = line.substring('lessons:'.length).trim();
    }
  }
  
  return result;
}

// Test data in legacy format
const legacySituation = `Where and when: At XYZ Company in 2023
Description: The team was facing a critical deadline with a major software release
Why it mattered: Missing the deadline would cost the company a major client`;

const legacyTask = `Responsibility: I was tasked with optimizing the database queries
How it would help: Improving query performance would speed up the entire application
We had constraints of limited server resources and only 2 weeks to complete the work`;

const legacyResult = `Outcome: I improved query performance by 75%
Benefit: The team was able to meet the deadline and retain the client
Lessons: I learned the importance of query optimization and index management`;

// Test data in new format
const newSituation = {
  "where-and-when-did-this-experience-occur": "At ABC Corp in 2022",
  "briefly-describe-the-situation-or-challenge-you-faced": "We needed to migrate a legacy system to a new cloud platform",
  "why-was-this-a-problem-or-why-did-it-matter": "The legacy system was becoming unstable and expensive to maintain"
};

const newTask = {
  "what-was-your-responsibility-in-addressing-this-issue": "I was responsible for designing the migration strategy",
  "how-would-completing-this-task-help-solve-the-problem": "A good migration plan would minimize downtime and risk",
  "what-constraints-or-requirements-did-you-need-to-consider": "We needed to maintain data integrity and stay within budget"
};

const newAction = {
  steps: [
    {
      stepNumber: 1,
      "what-did-you-specifically-do-in-this-step": "I analyzed the current system architecture",
      "how-did-you-do-it-tools-methods-or-skills": "Used system documentation and code analysis tools",
      "what-was-the-outcome-of-this-step-optional": "Created a complete map of system dependencies"
    },
    {
      stepNumber: 2,
      "what-did-you-specifically-do-in-this-step": "I designed the new cloud architecture",
      "how-did-you-do-it-tools-methods-or-skills": "Used AWS Well-Architected Framework",
      "what-was-the-outcome-of-this-step-optional": "Produced a scalable, resilient design"
    }
  ]
};

const newResult = {
  "what-positive-outcome-did-you-achieve": "Successfully migrated with only 2 hours of downtime",
  "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": "Reduced hosting costs by 40% and improved system reliability",
  "what-did-you-learn-from-this-experience": "I learned the importance of thorough planning and testing in migrations"
};

// Test 1: Legacy format parsing
console.log('=== TEST 1: Legacy Format Parsing ===');

console.log('\nTesting parseLegacySituation:');
const parsedSituation = parseLegacySituation(legacySituation);
console.log('Original:', legacySituation);
console.log('Parsed:', JSON.stringify(parsedSituation, null, 2));

console.log('\nTesting parseLegacyTask:');
const parsedTask = parseLegacyTask(legacyTask);
console.log('Original:', legacyTask);
console.log('Parsed:', JSON.stringify(parsedTask, null, 2));

console.log('\nTesting parseLegacyResult:');
const parsedResult = parseLegacyResult(legacyResult);
console.log('Original:', legacyResult);
console.log('Parsed:', JSON.stringify(parsedResult, null, 2));

// Test 2: Type guards
console.log('\n=== TEST 2: Type Guards ===');

console.log('\nTesting isString:');
console.log('isString(legacySituation):', isString(legacySituation));
console.log('isString(newSituation):', isString(newSituation));

// Test 3: Simulate AI prompt generation
console.log('\n=== TEST 3: AI Prompt Generation Simulation ===');

// Function to simulate the buildPitchPrompt logic
function simulateBuildPitchPrompt(starExample) {
  let prompt = 'Base prompt text...\n\n';
  
  if (starExample) {
    // Check if we're using the new nested structure
    if (typeof starExample.situation === 'object') {
      // Extract situation data from nested structure
      const situation = starExample.situation;
      const situationText = [
        situation["where-and-when-did-this-experience-occur"] || "",
        situation["briefly-describe-the-situation-or-challenge-you-faced"] || "",
        situation["why-was-this-a-problem-or-why-did-it-matter"] || ""
      ].filter(Boolean).join("\n");
      
      // Extract task data from nested structure
      const task = starExample.task;
      const taskText = [
        task["what-was-your-responsibility-in-addressing-this-issue"] || "",
        task["how-would-completing-this-task-help-solve-the-problem"] || "",
        task["what-constraints-or-requirements-did-you-need-to-consider"] || ""
      ].filter(Boolean).join("\n");
      
      // Extract action data from nested structure
      const action = starExample.action;
      let actionText = "";
      if (action && typeof action === 'object' && 'steps' in action && Array.isArray(action.steps)) {
        actionText = action.steps.map((step, index) => {
          return `Step ${index + 1}: ${step["what-did-you-specifically-do-in-this-step"] || ""}\n` +
                 `How: ${step["how-did-you-do-it-tools-methods-or-skills"] || ""}\n` +
                 (step["what-was-the-outcome-of-this-step-optional"] ? 
                  `Outcome: ${step["what-was-the-outcome-of-this-step-optional"]}` : "");
        }).join("\n\n");
      }
      
      // Extract result data from nested structure
      const result = starExample.result;
      const resultText = [
        result["what-positive-outcome-did-you-achieve"] || "",
        result["how-did-this-outcome-benefit-your-team-stakeholders-or-organization"] || "",
        result["what-did-you-learn-from-this-experience"] || ""
      ].filter(Boolean).join("\n");
      
      prompt += `
Here's my STAR example:
Situation: ${situationText}
Task: ${taskText}
Action: ${actionText}
Result: ${resultText}
`;
    }
    // Legacy format support
    else {
      prompt += `
Here's my STAR example:
Situation: ${starExample.situation || ""}
Task: ${starExample.task || ""}
Action: ${starExample.action || ""}
Result: ${starExample.result || ""}
`;
    }
  }

  return prompt;
}

// Test with new format
const newFormatExample = {
  situation: newSituation,
  task: newTask,
  action: newAction,
  result: newResult
};

console.log('\nSimulated AI Prompt with New Format:');
console.log(simulateBuildPitchPrompt(newFormatExample));

// Test with legacy format
const legacyFormatExample = {
  situation: legacySituation,
  task: legacyTask,
  action: "Step 1: I analyzed the database queries\nHow: Used query analyzer tools\nOutcome: Identified slow queries\n--\nStep 2: I optimized the indexes\nHow: Added appropriate indexes\nOutcome: Improved performance",
  result: legacyResult
};

console.log('\nSimulated AI Prompt with Legacy Format:');
console.log(simulateBuildPitchPrompt(legacyFormatExample));

console.log('\n=== TESTS COMPLETED ==='); 