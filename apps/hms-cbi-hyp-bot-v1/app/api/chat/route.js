// import { OpenAI } from "openai";
// import { NextResponse } from "next/server";

// export async function GET(req) {

//     try {
//         const openai = new OpenAI({
//             apiKey: process.env.OPENAI_API_KEY,
//     });

//     const completion = await openai.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [
//             { role: "system", content: "You are a helpful assistant." },
//             {
//                 role: "user",
//                 content: "Write a haiku about recursion in programming.",
//             },
//         ],
//     });

//         return NextResponse.json(completion.choices[0].message);
//     } catch (error) {
//         console.error(error);
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }

import { openai } from "@ai-sdk/openai";
import { StreamingTextResponse, streamText } from "ai";

export async function POST(req) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    messages,
  });
  return new StreamingTextResponse(result.toAIStream());
}
