import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const AI_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const AI_API_KEY = process.env.GROQ_API_KEY;

export async function callAIModel(conversation) {
    try {
        const messages = conversation.map((message) => ({
            role: message.role,
            content: message.content,
        }));

        const payload = {
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages,
            temperature: 0.2,
        };

        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AI_API_KEY}`,
        };

        const response = await axios.post(AI_API_URL, payload, { headers });

        const aiMessage = response.data.choices?.[0]?.message?.content?.trim();
        return aiMessage || null;
    } catch (error) {
        console.error(
            "Error calling AI model:",
            error.response?.data || error.message
        );
        return null;
    }
}

export async function getPlan(userTask, conversationHistory) {
    conversationHistory.push({
    role: "user",
    content: `The output should include only the executable plan in this format:
      FILE: filename.js CONTENT:
      <file content here>
      
      RUN: node filename.js`,
    });
    const response = await callAIModel(conversationHistory);
    if (!response) {
        throw new Error("AI response is empty. Check your AI configuration.");
    }
    conversationHistory.push({ role: "assistant", content: response });

    return response;
}

export async function refinePlan(failureReason, conversationHistory) {
    conversationHistory.push({
        role: "user",
        content: `The previous plan did not succeed. Reason: ${failureReason}. Please refine the plan.`,
    });

    const response = await callAIModel(conversationHistory);
    if (!response) {
        throw new Error("AI refinement response is empty.");
    }

    conversationHistory.push({ role: "assistant", content: response });

    return response;
}
