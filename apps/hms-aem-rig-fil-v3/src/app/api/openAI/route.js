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

STUDY DESCRIPTION
* A research team is investigating the impact of blue light exposure on sleep quality. Participants are exposed to different light conditions before bedtime.
STUDY TEAM
* Lead Researcher: Dr. Alex Ramirez
* Graduate Research Assistants: Maria Humboldt and James Chen
PARTICIPANTS
* 100 healthy adults (ages 18-35) recruited from the university community.
* Randomly assigned to one of three groups: blue light exposure, red light exposure, or no light exposure (control).
DATA ACCUMULATION
* Handwritten sleep logs (self-reported bedtime, sleeping location, quality of sleep, wake time, sleep duration).
* Actigraphy (wrist-worn devices tracking movement during sleep).
* Melatonin levels (saliva samples).
ENVIRONMENTAL CONDITIONS
* Participants' homes (naturalistic setting).
* Controlled light exposure in a dark room.
* Compliance with ethical guidelines for human research.

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
