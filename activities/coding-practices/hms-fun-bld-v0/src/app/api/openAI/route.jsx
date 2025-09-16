import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { functionCode, originalCode, functionName, validationType } = await request.json();

    if (validationType === 'singleResponsibility') {
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
            content: "You are a helpful coding instructor focused on teaching clean code principles. Always respond with valid JSON as requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      });

      const responseText = completion.choices[0].message.content;
      
      try {
        const parsedResponse = JSON.parse(responseText);
        return NextResponse.json(parsedResponse);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return NextResponse.json({
          passes: false,
          explanation: "Unable to evaluate the function at this time. Please try again."
        });
      }
    }

    if (validationType === 'sideEffects') {
      const prompt = `
You are an expert code reviewer evaluating Python functions for educational purposes. This is part of a coding education activity focused on understanding side effects and function purity.

Context:
- This is an educational activity about understanding function side effects
- Students are learning about function purity and avoiding unintended consequences
- The goal is to help students understand whether their function affects variables beyond its own scope

Original unstructured code:
\`\`\`python
${originalCode}
\`\`\`

Function being evaluated (${functionName}):
\`\`\`python
${functionCode}
\`\`\`

Side Effects Definition:
A function has side effects if it:
1. Modifies global variables or variables outside its scope
2. Modifies mutable objects passed as arguments (like lists or dictionaries) in place
3. Performs I/O operations (print, file operations, network calls)
4. Modifies class attributes or instance variables from outside the class
5. Uses or modifies variables from enclosing scopes (nonlocal variables)

A "pure" function should:
- Only work with its input parameters
- Only return values without modifying external state
- Be predictable and not cause unexpected changes elsewhere

Please evaluate whether this function has side effects and respond in the following JSON format:
{
  "passes": true/false,
  "explanation": "A clear 2-3 sentence explanation of whether the function has side effects and why. If it has side effects, identify what external state it's affecting and suggest how to make it more pure. If it's pure, explain why it's good design."
}

Note: For educational purposes, focus on helping the student understand what constitutes a side effect and how to write cleaner, more predictable functions.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful coding instructor focused on teaching function purity and avoiding side effects. Always respond with valid JSON as requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 400
      });

      const responseText = completion.choices[0].message.content;
      
      try {
        const parsedResponse = JSON.parse(responseText);
        return NextResponse.json(parsedResponse);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return NextResponse.json({
          passes: false,
          explanation: "Unable to evaluate the function for side effects at this time. Please try again."
        });
      }
    }

    return NextResponse.json({ error: 'Invalid validation type' }, { status: 400 });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to validate function', details: error.message },
      { status: 500 }
    );
  }
}
