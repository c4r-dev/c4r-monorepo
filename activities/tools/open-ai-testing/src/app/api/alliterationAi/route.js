import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { model, userMessage } = await req.json();

        const systemPrompt = `Rewrite a given sentence as closely as possible while incorporating as much alliteration as possible.

# Steps

1. Identify the main ideas or themes within the original sentence.
2. Select key words or phrases that can be replaced with alliterative alternatives.
3. Find synonyms or partial synonyms that share the same starting sound as the selected key words.
4. Construct a new sentence using these alliterative words while maintaining the meaning and structure of the original.

# Output Format

- A single sentence that mirrors the structure and meaning of the original but uses alliteration.

# Examples

**Input:** 
"The quick brown fox jumps over the lazy dog."

**Output:** 
"The swift, spry sable scampered silently over the sluggish spaniel."
(Real examples should maintain the original length and meaning more closely, where possible using placeholders: "The [adjective] [noun] [verb] [preposition] the [adjective] [noun].")

# Notes

- Retain the overall meaning and intent of the original sentence.
- Balance creativity with clarity when choosing alliterative words.
- Be mindful of word choice to ensure the rewritten sentence is still easily understood.

`;

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

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
