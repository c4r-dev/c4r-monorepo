import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { functionCode, originalCode, functionName, validationType } =
      await request.json();

    if (validationType === "singleResponsibility") {
      const prompt = `
You are an expert code reviewer evaluating Python functions for educational purposes. This is part of a coding education activity focused on clean coding practices and refactoring code into reusable functions.

Context:
- This is an educational activity about refactoring unstructured code into well-designed functions
- Students are learning about the Single Responsibility Principle and best practices
- The goal is to help students understand whether their function follows good design patterns

Original unstructured code:
\`\`\`python
${originalCode}
\`\`\`

Function being evaluated (${functionName}):
\`\`\`python
${functionCode}
\`\`\`

Single Responsibility Principle Definition:
A function should have only one reason to change, meaning it should have only one job or responsibility. It should do one thing and do it well.

Please evaluate whether this function follows the Single Responsibility Principle and respond in the following JSON format:
{
  "passes": true/false,
  "explanation": "A clear 1-2 sentence explanation of whether the function follows SRP and why. If it fails, provide specific suggestions for improvement."
}

Be constructive and educational in your feedback. Focus on helping the student understand the principle rather than just identifying problems.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful coding instructor focused on teaching clean code principles. Always respond with valid JSON as requested.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      const responseText = completion.choices[0].message.content;

      try {
        const parsedResponse = JSON.parse(responseText);
        return NextResponse.json(parsedResponse);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return NextResponse.json({
          passes: false,
          explanation:
            "Unable to evaluate the function at this time. Please try again.",
        });
      }
    }

    if (validationType === "variableNames") {
      const prompt = `
You are an expert code reviewer evaluating Python functions for educational purposes. This is part of a coding education activity focused on clean coding practices and writing readable, maintainable code.

Context:
- This is an educational activity about writing clear and understandable functions
- Students are learning to give variables descriptive and meaningful names
- The goal is to help students understand whether their variables are named clearly and appropriately

Original unstructured code:
\`\`\`python
${originalCode}
\`\`\`

Function being evaluated (${functionName}):
\`\`\`python
${functionCode}
\`\`\`

Task:
Please evaluate whether all variables in this function have descriptive names. Respond in the following JSON format:
{
  "passes": true/false,
  "explanation": "A clear 1-2 sentence explanation of whether the variables are descriptive and why. If not, provide specific suggestions for renaming."
}

Be constructive and educational in your feedback. Focus on helping the student understand why clear variable names matter and how to improve them if needed.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful coding instructor focused on teaching clean code principles. Always respond with valid JSON as requested.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      const responseText = completion.choices[0].message.content;

      try {
        const parsedResponse = JSON.parse(responseText);
        return NextResponse.json(parsedResponse);
      } catch (parseError) {
        return NextResponse.json({
          passes: false,
          explanation:
            "Unable to evaluate the function at this time. Please try again.",
        });
      }
    }

// Simplicity/Nesting check
    if (validationType === "simplicity") {
      const prompt = `
You are an expert code reviewer evaluating Python functions for educational purposes. This is part of a coding education activity focused on clean coding practices and writing readable, maintainable code.

Context:
- This is an educational activity about writing clear and understandable functions
- Students are learning to write code that is simple, well-structured, and easy to follow
- The goal is to help students understand whether their function is sensible, avoids unnecessary complexity, and is not overly nested

Original unstructured code:
\`\`\`python
${originalCode}
\`\`\`

Function being evaluated (${functionName}):
\`\`\`python
${functionCode}
\`\`\`

Task:
Please evaluate whether this function is written in a sensible, simple way, avoiding unnecessary complexity and excessive nesting. Respond in the following JSON format:
{
  "passes": true/false,
  "explanation": "A clear 1-2 sentence explanation of whether the function is simple and well-structured. If it is overly complex or deeply nested, provide suggestions for simplification."
}

Be constructive and educational in your feedback. Focus on helping the student understand why simplicity and sensible structure matter and how to improve their code if needed.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful coding instructor focused on teaching clean code principles. Always respond with valid JSON as requested.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      const responseText = completion.choices[0].message.content;

      try {
        const parsedResponse = JSON.parse(responseText);
        return NextResponse.json(parsedResponse);
      } catch (parseError) {
        return NextResponse.json({
          passes: false,
          explanation:
            "Unable to evaluate the function at this time. Please try again.",
        });
      }
    }

    if (validationType === "logicalGrouping") {
  const prompt = `
You are an expert code reviewer evaluating Python functions for educational purposes. This is part of a coding education activity focused on clean coding practices and writing readable, maintainable code.

Context:
- This is an educational activity about writing clear and understandable functions
- Students are learning to group related lines of code together logically
- The goal is to help students understand whether their code keeps functionally related lines close, improving readability and maintainability

Original unstructured code:
\`\`\`python
${originalCode}
\`\`\`

Function being evaluated (${functionName}):
\`\`\`python
${functionCode}
\`\`\`

Task:
Please evaluate whether this function is structured so that functionally related lines of code are grouped together. Respond in the following JSON format:
{
  "passes": true/false,
  "explanation": "A clear 1-2 sentence explanation of whether related lines are grouped together. If not, provide suggestions on how to reorganize the code for better logical grouping."
}

Be constructive and educational in your feedback. Focus on helping the student understand why grouping related code matters and how to improve it if needed.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful coding instructor focused on teaching clean code principles. Always respond with valid JSON as requested.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 300,
  });

  const responseText = completion.choices[0].message.content;

  try {
    const parsedResponse = JSON.parse(responseText);
    return NextResponse.json(parsedResponse);
  } catch (parseError) {
    return NextResponse.json({
      passes: false,
      explanation:
        "Unable to evaluate the function at this time. Please try again.",
    });
  }
}

    return NextResponse.json(
      { error: "Invalid validation type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to validate function", details: error.message },
      { status: 500 }
    );
  }
}
