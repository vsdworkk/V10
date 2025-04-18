#!/usr/bin/env python3
"""
Test script for the agent version selection based on STAR example count

This script tests the PromptLayer agent integration directly with the API by:
1. Creating sample data for 2, 3, and 4 STAR examples
2. Making direct API calls to PromptLayer for each test case
3. Logging the results to verify correct version selection and API calls

Run with:
python test_agent_versions.py
"""

import json
import time
import requests
from typing import Dict, List, Any

# Configuration
API_KEY = "pl_4c3ed9b8d7381ef88414569b8a3b2373"  # Same key as in agent-actions.ts
AGENT_NAME = "Master_Agent_V1"
BASE_URL = "https://api.promptlayer.com/workflows"

# Create a dummy STAR example for testing
def create_dummy_star_example(id: int) -> Dict[str, Any]:
    return {
        "id": str(id),
        "situation": f"Test situation location {id}\nTest situation challenge {id}",
        "task": f"Test responsibility {id}\nTest constraints {id}",
        "action": (
            f"Step 1: Test action step 1 for example {id}\n"
            f"How: Test methods for step 1, example {id}\n"
            f"Outcome: Test outcome for step 1, example {id}\n\n"
            f"Step 2: Test action step 2 for example {id}\n"
            f"How: Test methods for step 2, example {id}\n"
            f"Outcome: Test outcome for step 2, example {id}"
        ),
        "result": f"Test positive outcome {id}\nTest benefits {id}"
    }

# Create test data with specified number of examples
def create_test_data(num_examples: int) -> Dict[str, Any]:
    star_examples = [create_dummy_star_example(i) for i in range(1, num_examples + 1)]
    
    # Calculate word counts based on example count
    pitch_word_limit = 500
    intro_word_count = round(pitch_word_limit * 0.10)
    conclusion_word_count = round(pitch_word_limit * 0.10)
    star_word_count = round((pitch_word_limit * 0.80) / num_examples)
    
    # Create the structured input
    job_description = (
        "Role: Software Engineer\n"
        "Level: Senior\n"
        "Description: Building scalable web applications using modern frameworks"
    )
    
    star_components = json.dumps({"starExamples": star_examples})
    
    return {
        "job_description": job_description,
        "star_components": star_components,
        "Star_Word_Count": str(star_word_count),
        "User_Experience": "5 years of experience in software development",
        "Intro_Word_Count": str(intro_word_count),
        "Conclusion_Word_Count": str(conclusion_word_count),
        "ILS": "Isssdsd"  # Hardcoded value
    }

# Get the corresponding version label for the example count
def get_version_label(num_examples: int) -> str:
    if num_examples == 2:
        return "v1.2"
    elif num_examples == 3:
        return "v1.3"
    elif num_examples == 4:
        return "v1.4"
    else:
        print(f"Unexpected example count: {num_examples}, defaulting to v1.2")
        return "v1.2"

# Test function that runs the agent with the specified number of examples
def test_agent_with_star_examples(num_examples: int) -> None:
    print(f"\n======= Testing with {num_examples} STAR examples =======")
    
    version_label = get_version_label(num_examples)
    print(f"Expected version: {version_label}")
    
    try:
        # Create test data
        input_variables = create_test_data(num_examples)
        print(f"Created test data with {num_examples} STAR examples")
        
        # Configure the request
        url = f"{BASE_URL}/{AGENT_NAME}/run"
        headers = {
            "X-API-KEY": API_KEY,
            "Content-Type": "application/json"
        }
        
        payload = {
            "workflow_label_name": version_label,
            "input_variables": input_variables,
            "return_all_outputs": False
        }
        
        print(f"Sending request to {url} with version {version_label}")
        
        # Make the POST request to start the agent
        response = requests.post(url, headers=headers, json=payload)
        
        if not response.ok:
            print(f"Error: {response.status_code} - {response.text}")
            return
        
        execution_data = response.json()
        if not execution_data.get("success"):
            print(f"Error: {execution_data.get('message', 'Unknown error')}")
            return
        
        execution_id = execution_data.get("workflow_version_execution_id")
        if not execution_id:
            print("Error: No execution ID received")
            return
        
        print(f"Execution started with ID: {execution_id}")
        
        # Poll for results
        max_retries = 30  # 30 retries with 5 second intervals = 150 seconds
        result_data = None
        
        while max_retries > 0:
            time.sleep(5)  # Wait 5 seconds between checks
            
            try:
                results_url = f"{BASE_URL.replace('/workflows', '')}/workflow-version-execution-results?workflow_version_execution_id={execution_id}"
                get_response = requests.get(results_url, headers={"X-API-KEY": API_KEY})
                
                if get_response.ok:
                    data = get_response.json()
                    if isinstance(data, str):
                        result_data = data
                        break
            except Exception as e:
                print(f"Error polling for results: {e}")
            
            max_retries -= 1
        
        if result_data:
            print("Execution completed successfully")
            # Show preview of result
            preview = result_data[:100] + "..." if len(result_data) > 100 else result_data
            print(f"Result preview: {preview}")
        else:
            print("Timed out waiting for results")
    
    except Exception as e:
        print(f"Error during test: {e}")

# Main test function that runs all test cases
def run_tests() -> None:
    print("Starting agent version tests...\n")
    
    # Test with 2 STAR examples (should use v1.2)
    test_agent_with_star_examples(2)
    
    # Test with 3 STAR examples (should use v1.3)
    test_agent_with_star_examples(3)
    
    # Test with 4 STAR examples (should use v1.4)
    test_agent_with_star_examples(4)
    
    print("\nAll tests completed.")

if __name__ == "__main__":
    run_tests() 