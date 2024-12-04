# GENIE Developer Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Getting Started](#getting-started)
3. [Adding New Models](#adding-new-models)
4. [Customizing Prompts](#customizing-prompts)
5. [Creating New Tasks](#creating-new-tasks)
6. [Working with RAG](#working-with-rag)

## Architecture Overview

GENIE is a multi-model and multi-RAG powered chatbot built using AWS CDK. The main components are:

### Frontend

- **React-based UI**: Located in `lib/user-interface/react-app/`

### Backend

- **Model interfaces**: Built using LangChain
- **Multiple RAG options**:
  - Aurora
  - OpenSearch
  - Kendra
- **AWS AppSync**: For real-time features

### Models

- Supports various LLMs through:
  - **Amazon Bedrock**
  - **SageMaker endpoints**
  - **Third-party APIs**

## Getting Started

1. Environment setup

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install && npm run build

# Configure the solution
npm run config
```

2. Development Environment

- Github actions will automatically deploy the latest changes when pushed to the branches. Push to the 'prod' branch to deploy to the production environment.

## Adding new models

Add new Sagemaker models in `lib/model-interfaces/sagemaker/models.ts`

```js if (props.config.llms?.sagemaker.includes(SupportedSageMakerModels.NewModel)) {
  const NEW_MODEL_ID = "organization/model-name";
  const NEW_MODEL_ENDPOINT_NAME = NEW_MODEL_ID.split("/")
    .join("-")
    .split(".")
    .join("-");

  const newModel = new HuggingFaceSageMakerEndpoint(this, "NewModel", {
    modelId: NEW_MODEL_ID,
    vpcConfig: {
      securityGroupIds: [props.shared.vpc.vpcDefaultSecurityGroup],
      subnets: props.shared.vpc.privateSubnets.map((subnet) => subnet.subnetId),
    },
    container: DeepLearningContainerImage.HUGGINGFACE_PYTORCH_TGI_INFERENCE_2_0_1_TGI1_1_0_GPU_PY39_CU118_UBUNTU20_04,
    instanceType: SageMakerInstanceType.ML_G5_2XLARGE,
    endpointName: NEW_MODEL_ENDPOINT_NAME,
    environment: {
      SM_NUM_GPUS: JSON.stringify(1),
      MAX_INPUT_LENGTH: JSON.stringify(2048),
      MAX_TOTAL_TOKENS: JSON.stringify(4096),
    },
  });
}
```

## 2. Third-Party models

To add third-party models (like OpenAI, Anthropic):

1. Create an adapter in `lib/model-interfaces/langchain/functions/request-handler/adapters/`
2. Update the model registry in `lib/model-interfaces/langchain/models.ts`
3. Add API keys to AWS Secrets Manager

## Customizing Prompts

### Base prompt:

Make edits to the 'get_prompt' method in `lib/model-interfaces/langchain/functions/request-handler/adapters/base.py`

```python
def get_prompt(self):
    template = """The following is a friendly conversation between a human and an AI.
    Current conversation:
    {chat_history}
    Question: {input}"""

    return PromptTemplate(
        template=template,
        input_variables=["input", "chat_history"]
    )
```

## Enhanced Prompt

To make changes to the enhanced prompt, edit the `get_enhanced_prompt` method in `lib/model-interfaces/langchain/functions/request-handler/adapters/base.py`

- This method is responsible for extracting keywords and phrases from the chat history and user prompt to improve the semantic search.

```python
    def get_enhanced_prompt(self, user_prompt, chat_history):
        print('running get_enhanced_prompt')
        llm = self.get_llm({"streaming": False})
        chat_history = chat_history[-3:]  #limiting to last 3 messages

        # Enhanced prompt template
        base_prompt = f"""Prompt Enhancement Task:

                Context: Extract specific keywords and phrases from the chat history and user prompt that best capture the user's intent and context for optimal semantic search.

                Chat History:
                {chat_history}

                User Prompt:
                {user_prompt}

                Task: Generate a list of search-optimized keywords and key phrases relevant to the user prompt and chat history, formatted as a comma-separated list. Limit the response to essential terms only, focusing on Kendra search optimization, and keep it under 150 characters."""

        print('base_prompt', base_prompt)

        # Call the LLM to get the enhanced prompt on Sonnet 3.5
        bedrock = genai_core.clients.get_bedrock_client()
        try:
            response = bedrock.invoke_model(
                modelId="anthropic.claude-3-5-sonnet-20240620-v1:0",  # Change for different model
                body=json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 50,  # SARAH - Testing here 100,
                    "messages": [{"role": "user", "content": base_prompt}],
                })
            )
            # Response from bedrock
            result = json.loads(response.get("body").read())
            print("Response from Bedrock:", result)

            # Extract and print the enhanced prompt from the content list
            content_list = result.get("content", [])
            if content_list:
                enhanced_prompt = content_list[0].get("text", "")

                # # Ensure the enhanced prompt is a substring if the length is greater than 1000
                # if len(enhanced_prompt) > 1000:
                #     enhanced_prompt = enhanced_prompt[:980]

                print("Enhanced Prompt Text:", enhanced_prompt)  # Print only the text from content
                return enhanced_prompt
```

## Creating New Tasks

Tasks are predefined prompts with specific instructions (for basic users of GENIE).
To add new tasks:

1. Define the task in `lib/user-interface/react-app/src/common/constants.ts`:

```js
export abstract class TaskOptions {
  static taskPromptMap: Record<string, {
    taskTitle: string;
    prompt: string;
    instructions: string;
    sendPromptOnlyOnce: boolean
  }> = {
    // ... existing tasks ...
    "new-task-name": {
      taskTitle: "Display Title",
      prompt: "System prompt that defines the AI's role and behavior",
      instructions: "Instructions shown to the user",
      sendPromptOnlyOnce: true // Set to true if prompt should only be sent once
    }
  };
}
```

2. Add the task to Navigation Panel in `lib/user-interface/react-app/src/components/navigation-panel.tsx`:

```js
{
    type: "section",
    text: "Explore Task Based AI Solutions",
    items: [
        // ... existing items ...
        {
            type: "link",
            text: "Your New Task Name",
            href: `/chatbot/task-playground/${uuidv4()}/new-task-name`
        },
    ],
}
```

3. Add to Carousel in `lib/user-interface/react-app/src/components/carousel.tsx`:

```js
const taskCards = [
  // ... existing cards ...
  {
    name: "new-task-name",
    cardTitle: "Display Title",
    taskDescription: "Brief description of what the task does",
    instructions: "Instructions for the user",
    url: `/chatbot/task-playground/${uuidv4()}/new-task-name`,
    apiPrompt: "System prompt that defines behavior...",
  },
];
```

### Task Configuration Guidelines

1. Task Names:

- Use kebab-case for task names (e.g., daily-planning)
- Keep names descriptive but concise

2. Task Instructions:

- Provide clear and concise instructions for the user
- Include any specific guidelines or constraints

3. Instructions:

- Keep instructions concise and relevant to the task

4. sendPromptOnlyOnce:

- Set to true if the system prompt should only be sent at the start of conversation
- Set to false if the prompt should be included with each message

### Example: Adding a New Task

Here's an example of adding a "Meeting Minutes" task:

```js "meeting-minutes": {
  taskTitle: "Meeting Minutes",
  prompt: "You are an AI specialized in creating detailed meeting minutes. Format the minutes with clear headers, attendees, discussion points, and action items. Ask for any missing critical information.",
  instructions: "Please provide the meeting details and discussion points:",
  sendPromptOnlyOnce: true
}
```

Remember to add corresponding entries in both the navigation panel and carousel components as shown above.

## Working with RAG

GENIE supports three RAG options:

- Aurora
- OpenSearch
- Kendra
