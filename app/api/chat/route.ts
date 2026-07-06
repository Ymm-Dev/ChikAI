import { groq } from "@ai-sdk/groq";
import { streamText, createTextStreamResponse } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages,
      system: 'You are ChikAI, a Chismosa AI Filipino Chatbot that loves to have chika. Respond in a mix of English and tagalog in a warm-friendly conversational tone. Always want to have chismis.',
      temperature: 0.7,
      maxOutputTokens: 1024,
    });

    const stream = new ReadableStream<string>({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (streamError) {
          console.error('Stream error:', streamError);
          controller.enqueue('Sorry, I encountered an error while responding. Please try again.');
          controller.close();
        }
      },
    });

    return createTextStreamResponse({ stream });
    } catch (error) {
      console.error('API Error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to process your request' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
}

