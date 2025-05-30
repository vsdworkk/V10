data.get("Writer", "")

To get the code from previous nodes^.

Summary of Key Points:
	1.	Writer Output as JSON vs. Python Dict
	•	Often, we see JSON data in logs or console outputs, but it might still be a string in Python. You must call json.loads() on that string to convert it into a Python dictionary. Without that conversion, writer_output remains a string, and checks like isinstance(writer_output, dict) will fail.
	2.	Key Names Must Match Exactly
	•	If the JSON keys (“SituationandTask”, “Action”, “Result”) don’t precisely match what your code looks for, the code block that extracts and concatenates them will never run. Check for typos or mismatched case.
	3.	Code Flow: Fallback
	•	Because of the if/elif structure, if writer_output is not recognized as a dict, the code automatically falls back to returning writer_output as-is. That’s why you might see no joined paragraph if the data isn’t a dictionary.
	4.	Usage of " ".join(...)
	•	This approach merges the text from each section with a space. Alternatively, you could merge with line breaks or other delimiters if needed.
	5.	Typical Fix
	•	Make sure to do something like:

import json

writer_output_str = data.get("Writer", "")
try:
  writer_output_dict = json.loads(writer_output_str)
except json.JSONDecodeError:
  writer_output_dict = {}

	•	Then proceed with the dictionary-based logic (like extracting and concatenating) only if it’s truly a dictionary.

This helps avoid confusion between JSON string data and Python dictionary objects.

# Prompt Layer API Docs

# Run Agent

Initiate the execution of a specific Agent by its name. You can specify input variables, metadata, and choose which version of the Agent to run.

Please note that this feature was previously called “Workflows” and is now called “Agents”. Some references to “Workflows” remain in our SDK and will be updated before the feature exits beta.

## **HTTP Request**

**`POST /workflows/{workflow_name}/run`**

## **Path Parameters**

- **workflow_name** (string, required): The name of the Agent you wish to execute.

```jsx
curl --request POST \
  --url https://api.promptlayer.com/workflows/{workflow_name}/run \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: <x-api-key>' \
  --data '{
  "workflow_label_name": "<string>",
  "workflow_version_number": 123,
  "metadata": {},
  "input_variables": {},
  "return_all_outputs": false
}'
```

```jsx
import requests

url = "https://api.promptlayer.com/workflows/{workflow_name}/run"

payload = {
    "workflow_label_name": "<string>",
    "workflow_version_number": 123,
    "metadata": {},
    "input_variables": {},
    "return_all_outputs": False
}
headers = {
    "X-API-KEY": "<x-api-key>",
    "Content-Type": "application/json"
}

response = requests.request("POST", url, json=payload, headers=headers)

print(response.text)
```

```jsx
const options = {
  method: 'POST',
  headers: {'X-API-KEY': '<x-api-key>', 'Content-Type': 'application/json'},
  body: '{"workflow_label_name":"<string>","workflow_version_number":123,"metadata":{},"input_variables":{},"return_all_outputs":false}'
};

fetch('https://api.promptlayer.com/workflows/{workflow_name}/run', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
```

## **Request Body**

The request body expects a JSON object with the following structure:

### **Schema**

```jsx
{  "workflow_label_name": "string (optional)",  "workflow_version_number": "integer (optional)",  "metadata": {    "string": "string"  },  "input_variables": {    "string": "any"  },  "return_all_outputs": "boolean (default: false)"}
```

### **Headers**

**X-API-KEY**

**stringrequired**

Your API key for authentication.

### **Path Parameters**

**workflow_name**

**stringrequired**

The name of the workflow to execute.

### **Body**

**application/json**

Parameters to run a workflow.

**workflow_label_name**

**string | null**

Specify a workflow label name to run a specific labeled version.

**workflow_version_number**

**integer | null**

Specify a workflow version number to run a specific version.

**metadata**

**object | null**

A dictionary of metadata key-value pairs.

Show child attributes

**input_variables**

**object**

A dictionary of input variables required by the workflow.

**return_all_outputs**

**booleandefault:false**

If set to **`true`**, all outputs from the workflow execution will be returned.

### **Response**

**201201400401404**

**application/json**

Workflow execution created successfully

Response after initiating a workflow execution.

**success**

**booleanrequired**

Indicates if the request was successful.

**message**

**stringrequired**

A message describing the result.

**workflow_version_execution_id**

**integerrequired**

The ID of the created workflow execution.

**warning**

**string | null**

Any warnings about missing input variables.

# Get Agent Version Execution Results

### **Get Agent Version Execution Results**

Retrieve the execution results of a specific Agent version. You can include all output nodes by setting the **`return_all_outputs`** query parameter to **`true`**.

Please note that this feature was previously called “Workflows” and is now called “Agents”. Some references to “Workflows” remain in our SDK and will be updated before the feature exits beta.

Curl

```jsx
curl --request GET \
  --url https://api.promptlayer.com/workflow-version-execution-results \
  --header 'X-API-KEY: <x-api-key>'
```

Python

```jsx
import requests

url = "https://api.promptlayer.com/workflow-version-execution-results"

headers = {"X-API-KEY": "<x-api-key>"}

response = requests.request("GET", url, headers=headers)

print(response.text)
```

Javascript

```jsx
const options = {method: 'GET', headers: {'X-API-KEY': '<x-api-key>'}};

fetch('https://api.promptlayer.com/workflow-version-execution-results', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
```

### **Headers**

**X-API-KEY**

**stringrequired**

Your API key for authentication.

### **Query Parameters**

**workflow_version_execution_id**

**integerrequired**

The unique identifier of the workflow version execution whose results you want to retrieve.

**return_all_outputs**

**booleandefault:false**

When set to true, the response includes all output nodes' results. If omitted or set to false, only the main output is returned.

### **Response**

**200200400401403404**

**application/json**

Successful response with execution results.

### **Response**

**200200400401403404**

**application/json**

Successful response with execution results.

- **Option 1**
- **Option 2**

The main output value of the workflow execution when return_all_outputs is false.