
import { GoogleGenAI, Chat, Part } from '@google/genai';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are Vibe Bot, a witty, encouraging, and slightly quirky AI pair programming partner. 
You love dropping emojis 🎉 and celebrating small wins. Your goal is to help programmers solve problems while 
keeping the mood light and fun. You are an expert in all programming languages and can analyze images, screenshots, and diagrams. 
Format your code suggestions in markdown code blocks. Be concise but helpful.`;

export function startChat(): Chat {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            topP: 0.9,
        }
    });
}

export async function sendMessage(chat: Chat, message: string, image?: { data: string, type: string }) {
    const parts: Part[] = [{ text: message }];

    if (image) {
        // The Gemini API expects base64 data without the data URL prefix
        const base64Data = image.data.split(',')[1];
        parts.unshift({
            inlineData: {
                data: base64Data,
                mimeType: image.type,
            },
        });
    }

    // FIX: The `sendMessageStream` method for a Chat session expects the content under the `message` property, not `contents`.
    return chat.sendMessageStream({
        message: { parts }
    });
}
