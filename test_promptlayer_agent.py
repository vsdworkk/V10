#!/usr/bin/env python3
"""
Test script for PromptLayer Agent Integration
=============================================

This script tests the PromptLayer agent integration by:
1. Making a POST request to run the custom agent
2. Getting the execution ID
3. Polling for results
4. Displaying the final result

Usage:
    python test_promptlayer_agent.py
"""

import json
import requests
import time
import sys


def run_agent_test():
    # API Key (same as in the JS implementation)
    api_key = "pl_4c3ed9b8d7381ef88414569b8a3b2373"

    # Sample test data
    job_description = """
Role: Senior Project Manager
Level: EL2
Description: Lead complex IT transformation projects
Years of Experience: 8
""".strip()

    # Sample STAR examples
    star_examples = {
        "starExamples": [
            {
                "id": "1",
                "situation": "At the Department of Finance, we faced significant delays in the rollout of a new budgeting system due to poor vendor coordination.",
                "task": "As the lead project manager, I needed to restructure the project timeline while maintaining our annual budget cycle requirements.",
                "action": "I established a cross-functional team, implemented daily standups, and created a risk mitigation framework with clear escalation paths.",
                "result": "We successfully launched the system two weeks ahead of the revised schedule, with 100% data integrity and positive stakeholder feedback."
            },
            {
                "id": "2",
                "situation": "During COVID-19, our team needed to quickly digitize our citizen grant application process while maintaining strict compliance standards.",
                "task": "I was tasked with leading the transition from paper to digital within 6 weeks to meet government stimulus deadlines.",
                "action": "I conducted rapid stakeholder analysis, prioritized features based on compliance requirements, and implemented an agile delivery approach with two-week sprints.",
                "result": "We delivered a secure, compliant digital platform that processed 50,000 applications in the first month, reducing processing time by 80%."
            }
        ]
    }

    star_components = json.dumps(star_examples)
    user_experience = """
I have led IT modernization projects across three federal agencies over the past 8 years. Most recently, at the Department of Infrastructure, I managed a team of 15 to implement a new citizen-facing grant management system. I'm skilled in stakeholder management, agile methodologies, and navigating complex government procurement processes.
"""

    print("Starting PromptLayer agent test...\n")
    print(f"Job Description: {job_description}")
    print(f"STAR Examples: {json.dumps(star_examples, indent=2)}")
    print(f"User Experience: {user_experience}\n")

    # 1. Make POST request to run the agent
    print("1. Making POST request to run the agent...")
    
    post_options = {
        "method": "POST",
        "headers": {
            "X-API-KEY": api_key,
            "Content-Type": "application/json"
        },
        "json": {
            "input_variables": {
                "job_description": job_description,
                "star_components": star_components,
                "Star_Word_Count": "300",  # Hardcoded as specified
                "User_Experience": user_experience,
                "Intro_Word_Count": "200",  # Hardcoded as specified
                "Conclusion_Word_Count": "200",  # Hardcoded as specified
                "ILS": "Isssdsd"  # Hardcoded as specified
            },
            "return_all_outputs": False
        }
    }

    try:
        post_response = requests.request(
            post_options["method"],
            "https://api.promptlayer.com/workflows/Master_Agent_V1/run",
            headers=post_options["headers"],
            json=post_options["json"]
        )

        if not post_response.ok:
            print(f"Error: Failed to start agent execution: {post_response.text}")
            return
        
        post_data = post_response.json()
        
        if not post_data.get("success"):
            print(f"Error: {post_data.get('message', 'Failed to start agent execution')}")
            return
        
        # Extract the workflow_version_execution_id from the response
        execution_id = post_data.get("workflow_version_execution_id")
        
        if not execution_id:
            print("Error: No execution ID received from agent")
            return
        
        print(f"Success! Agent execution started with ID: {execution_id}\n")
        
        # 2. Poll for results (with retry logic)
        print("2. Polling for results...")
        max_retries = 30  # 30 retries with 5 second delay = up to 150 seconds of waiting
        result_data = None
        
        for attempt in range(max_retries):
            # Wait 5 seconds between checks
            time.sleep(5)
            
            # Progress indicator
            sys.stdout.write(f"\rPolling attempt {attempt + 1}/{max_retries}...")
            sys.stdout.flush()
            
            # Make GET request to check for results
            get_options = {
                "method": "GET",
                "headers": {"X-API-KEY": api_key}
            }
            
            try:
                get_response = requests.request(
                    get_options["method"],
                    f"https://api.promptlayer.com/workflow-version-execution-results?workflow_version_execution_id={execution_id}",
                    headers=get_options["headers"]
                )
                
                if get_response.ok:
                    data = get_response.json()
                    
                    # Check if processing is complete and we have a result
                    if data and isinstance(data, str):
                        result_data = data
                        break
            except Exception as error:
                print(f"\nPolling attempt failed: {error}")
            
        print("\n")
        
        if not result_data:
            print("Error: Timed out waiting for agent response. Please try again.")
            return
        
        # 3. Display the result
        print("\n===== AGENT RESULT =====\n")
        print(result_data)
        print("\n=======================\n")
        
        print("Test completed successfully!")
        
    except Exception as error:
        print(f"Error: {error}")


if __name__ == "__main__":
    run_agent_test() 