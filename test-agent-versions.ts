/**
 * Test script for the agent version selection based on STAR example count
 * 
 * This script tests the PromptLayer agent integration by:
 * 1. Creating sample data for 2, 3, and 4 STAR examples
 * 2. Calling the generateAgentPitchAction function with each test case
 * 3. Logging the results to verify correct version selection and API calls
 * 
 * Run this script with:
 * npx tsx test-agent-versions.ts
 */

import { generateAgentPitchAction, GenerateAgentPitchParams } from "./actions/agent-actions";
import { StarSchema } from "./db/schema/pitches-schema";

// Create a dummy STAR example for testing
function createDummyStarExample(id: number): StarSchema {
  return {
    situation: {
      "where-and-when-did-this-experience-occur": `Test situation location ${id}`,
      "briefly-describe-the-situation-or-challenge-you-faced": `Test situation challenge ${id}`
    },
    task: {
      "what-was-your-responsibility-in-addressing-this-issue": `Test responsibility ${id}`,
      "what-constraints-or-requirements-did-you-need-to-consider": `Test constraints ${id}`
    },
    action: {
      steps: [
        {
          "stepNumber": 1,
          "what-did-you-specifically-do-in-this-step": `Test action step 1 for example ${id}`,
          "how-did-you-do-it-tools-methods-or-skills": `Test methods for step 1, example ${id}`,
          "what-was-the-outcome-of-this-step-optional": `Test outcome for step 1, example ${id}`
        },
        {
          "stepNumber": 2,
          "what-did-you-specifically-do-in-this-step": `Test action step 2 for example ${id}`,
          "how-did-you-do-it-tools-methods-or-skills": `Test methods for step 2, example ${id}`,
          "what-was-the-outcome-of-this-step-optional": `Test outcome for step 2, example ${id}`
        }
      ]
    },
    result: {
      "what-positive-outcome-did-you-achieve": `Test positive outcome ${id}`,
      "how-did-this-outcome-benefit-your-team-stakeholders-or-organization": `Test benefits ${id}`
    }
  };
}

// Create pitch data with the specified number of STAR examples
function createTestPitchData(numExamples: number): GenerateAgentPitchParams {
  const starExamples: StarSchema[] = [];
  
  for (let i = 1; i <= numExamples; i++) {
    starExamples.push(createDummyStarExample(i));
  }
  
  return {
    roleName: "Software Engineer",
    roleLevel: "Senior",
    pitchWordLimit: 500,
    relevantExperience: "5 years of experience in software development",
    roleDescription: "Building scalable web applications using modern frameworks",
    starExamples
  };
}

// Test function that runs the agent with the specified number of examples
async function testAgentWithStarExamples(numExamples: number) {
  console.log(`\n======= Testing with ${numExamples} STAR examples =======`);
  console.log(`Expected version: v1.${numExamples}`);
  
  try {
    const testData = createTestPitchData(numExamples);
    console.log(`Created test data with ${testData.starExamples.length} STAR examples`);
    
    console.log("Calling agent action...");
    const result = await generateAgentPitchAction(testData);
    
    console.log("Result:", {
      isSuccess: result.isSuccess,
      message: result.message
    });
    
    if (result.isSuccess) {
      // Just show the first 100 chars of the generated pitch to avoid cluttering the console
      console.log("Generated pitch (preview):", result.data.substring(0, 100) + "...");
    }
  } catch (error) {
    console.error("Error during test:", error);
  }
}

// Main test function that runs all test cases
async function runTests() {
  console.log("Starting agent version tests...\n");
  
  // Test with 2 STAR examples (should use v1.2)
  await testAgentWithStarExamples(2);
  
  // Test with 3 STAR examples (should use v1.3)
  await testAgentWithStarExamples(3);
  
  // Test with 4 STAR examples (should use v1.4)
  await testAgentWithStarExamples(4);
  
  console.log("\nAll tests completed.");
}

// Run the tests
runTests()
  .then(() => console.log("Testing completed successfully"))
  .catch(error => console.error("Testing failed:", error)); 