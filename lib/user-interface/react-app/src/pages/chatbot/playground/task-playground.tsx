import BaseAppLayout from "../../../components/base-app-layout";
import Chat from "../../../components/chatbot/chat";

import  {TaskPrompts } from "../../../common/constants.ts"; 
import { Link, useParams } from "react-router-dom";


export default function TaskPlayground() {

const prompt = useParams; 

/*
/ ideas:
/ make session with the prompt and then go to that sessions
/ the way you navigate to session with playground/{ uuivd}
/ want to do a similar way with the prompt 
*/

return (
    <BaseAppLayout
    

    toolsWidth={300}
    content={<Chat sessionId={sessionId} />}

    />
    
    
    
    

) 
}
