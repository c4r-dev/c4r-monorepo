import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { model, userMessage } = await req.json();

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        let systemPrompt = `I would like a model that suggests the end of a sentence or phrase, where the text "..." is written. 
        It will receive a sentence or a paragraph ending in "..." must return ONLY the text that would best fit there, completing the current sentence. 
        If the model has any conflict or refusal to comply, it will simply respond with a blank message. `;

        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
            ],
        });

        return NextResponse.json(completion.choices[0].message);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
