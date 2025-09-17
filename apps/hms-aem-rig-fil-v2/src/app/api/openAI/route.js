import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { model } = await req.json();

        const systemPrompt = `
        You are a helpful assistant that generates hints for a clinical trial study.
        `

        const oldUserMessage = `
        
Please read the following study description. Then, suggest ways that this study could become unmasked. Then, write 3 questions that could prompt a student to identify those potential causes of unmasking.

CLINICAL TRIAL FOR A NEW DRUG (DISCUSSION)
A pharmaceutical company is conducting a phase II clinical trial to evaluate the safety and efficiacy of a novel drug for treating hypertension The drug aims to lower blood pressure without significant side effects.
STUDY TEAM
Principal Investigator (PI): Dr. Emily Carter
Research Coordinator: Sarah Patel
Data Analyst: Dr. Mark Johnson
DATA ACCUMULATION
Blood pressure measurements (systolic and diastolic) at baselline, weekly intervals, and study endpoint
Adverse events reporting
Laboratory tests (e.g., kidney function, liver enzymes)
PARTICIPANTS
500 adult participants (aged 40-65) with diagnosed hypertension.
Randomly assigned to either the experimental drug group or a placebo group.
ENVIRONMENTAL CONDITIONS
Clinical research center with controlled temperature, humidity, and lighting.
Standardized examination rooms.
Compliance with Good Clinical Practice (GCP) guidelines.
`;

const userMessage = `
        
Please read the following study description. Then, think of ways that this study could become unmasked. Then, write 3 questions that could prompt a student to identify those potential causes of unmasking.

CLINICAL TRIAL FOR A NEW DRUG (DISCUSSION)
    A pharmaceutical company is conducting a phase II clinical trial to evaluate the safety and efficiacy of a novel drug for treating hypertension The drug aims to lower blood pressure without significant side effects.
STUDY TEAM
    Principal Investigator (PI): Dr. Emily Carter
    Research Coordinator: Sarah Patel
    Data Analyst: Dr. Mark Johnson
DATA ACCUMULATION
    Blood pressure measurements (systolic and diastolic) at baselline, weekly intervals, and study endpoint
    Adverse events reporting
    Laboratory tests (e.g., kidney function, liver enzymes)
PARTICIPANTS
    500 adult participants (aged 40-65) with diagnosed hypertension.
    Randomly assigned to either the experimental drug group or a placebo group.
ENVIRONMENTAL CONDITIONS
    Clinical research center with controlled temperature, humidity, and lighting.
    Standardized examination rooms.
    Compliance with Good Clinical Practice (GCP) guidelines

Format your response as a json object with 1 key: "question1". Each key should have a value that is a string.

`;

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });


        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
            ],
            response_format: {
              "type": "json_schema",
              "json_schema": {
                "name": "questionnaire",
                "strict": true,
                "schema": {
                  "type": "object",
                  "properties": {
                    "question1": {
                      "type": "string",
                      "description": "The first question in the questionnaire."
                    }
                  },
                  "required": [
                    "question1"
                  ],
                  "additionalProperties": false
                }
              }
            },
            temperature: 1,
            max_completion_tokens: 2048,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
          });

          return NextResponse.json(response.choices[0].message);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
