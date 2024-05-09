import BaseAppLayout from "../../../components/base-app-layout";
import Chat from "../../../components/chatbot/chat";

import { Link, useParams } from "react-router-dom";
import { Header, HelpPanel } from "@cloudscape-design/components";
import TaskChat from "../../../components/chatbot/task-chat";
import TaskPriming from "../../../components/chatbot/task";
import { ChatBotTask } from "../../../components/chatbot/types";
import { TaskOptions } from "../../../common/constants";

export default function TaskPlayground() {
  const { sessionId } = useParams();
  const { prompt } = useParams(); 
  
  
  

  // const { task } = useParams();

  // const findTask = TaskPriming(prompt); THIS WAS CAUSING AN ERROR FOR SOME REASON

  // NEXT STEP IS IMPORT THE CONSTANTS IN HERE TO FIND THE MAP
  const promptOptions = TaskOptions.taskPromptMap; 

  // HARDCODED
  const cbTask: ChatBotTask = {
    name: "Summarize",
    instructions: "Enter the text to be summarized below", 
    apiPrompt: "You are an AI specialized in key-point text summarization. Your task is to read extensive texts and distill them into concise summaries that emphasize the most critical points and central ideas. Aim to highlight significant facts, conclusions, and insights, stripping away any extraneous details. This enables users to grasp the essence of the content swiftly and effectively. Handle various document types, from academic articles to business reports, with precision. If the input text is ambiguous or the instruction lacks specifics, seek further clarification to ensure your summary aligns perfectly with the user's expectations.",
  }
  

  // console.log(prompt + "testing #85")
  return (
    <BaseAppLayout
      info={
        <HelpPanel header={<Header variant="h3">Using the chat</Header>}>
          <p>
           "react"playground allows user to interact with a chosen LLM and
            optional RAG retriever. You can create new RAG workspaces via the{" "}
            <Link to="/rag/workspaces">Workspaces</Link> console.
          </p>
          <h3>Settings</h3>
          <p>
            You can configure additional settings for the LLM via the setting
            action at the bottom-right. You can change the Temperature and Top P
            values to be used for the answer generation. You can also enable and
            disable streaming mode for those models that support it (the setting
            is ignored if the model does not support streaming). Turning on
            Metadata displays additional information about the answer, such as
            the prompts being used to interact with the LLM and the document
            passages that might have been retrieved from the RAG storage.
          </p>
          <h3>Multimodal chat</h3>
          <p>
            If you select a multimodal model (like Anthropic Claude 3), you can
            upload images to use in the conversation.
          </p>
          <h3>Session history</h3>
          <p>
            All conversations are saved and can be later accessed via the{" "}
            <Link to="/chatbot/sessions">Session</Link> in the navigation bar.
          </p>
        </HelpPanel>
      }
      toolsWidth={300}
      // 
      content={<TaskChat sessionId={sessionId} prompt={prompt} taskOb={cbTask} />}
    />
  ); //send prompt here : prompt = {}
}
