import { NextResponse } from "next/server";
import connectMongoDB from "../libs/mongodb";
import RandomizationIdeas from "../models/randomizationIdeas";
import Session from "../models/session";
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionID = searchParams.get('sessionID');

    if (!sessionID) {
      return NextResponse.json({ message: "Missing sessionID parameter." }, { status: 400 });
    }

    await connectMongoDB();

    // First, check if we already have summarized ideas for this session
    let session = await Session.findOne({ sessionID });
    
    if (!session) {
      return NextResponse.json({ message: "Session not found." }, { status: 404 });
    }

    // If we already have summarized ideas, return them immediately
    if (session.summarizedIdeas) {
      return NextResponse.json({
        ideas: session.summarizedIdeas,
        status: 'complete'
      });
    }

    // If summarization is in progress, return status
    if (session.isSummarizing) {
      return NextResponse.json({
        status: 'in_progress'
      });
    }

    // If we get here, we need to start the summarization process
    // Mark the session as being summarized
    await Session.findOneAndUpdate(
      { sessionID },
      { $set: { isSummarizing: true } }
    );

    // Get all ideas for this session
    const ideasData = await RandomizationIdeas.findOne({ sessionID });
    
    if (!ideasData || !ideasData.ideas || ideasData.ideas.length === 0) {
      // Reset the summarizing flag if no ideas found
      await Session.findOneAndUpdate(
        { sessionID },
        { $set: { isSummarizing: false } }
      );
      return NextResponse.json({ message: "No ideas found to summarize." }, { status: 404 });
    }

    try {
      // Call OpenAI API to summarize ideas
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert at combining similar ideas into concise, clear statements. Your task is to:
- Analyze the given list of randomization ideas.
- Combine similar or related ideas into new, concise statements.
- Keep unique ideas that don't have clear matches.
- Reduce the total number of ideas by about 30-40% through smart combinations.
- Each output should be a single, clear, specific idea, as if it were a direct answer.
- Do NOT include any instructions, explanations, or references to the process.
- Only output the final list of combined ideas, one per line.

For example, if given:
Apples, Bananas, Pears, Grapes, Oranges, Carrots
Houses, Hotels, Apartments
Fire

You should output:
Apples, bananas, pears, grapes, oranges, and carrots
Houses, hotels, and apartments
Fire`
          },
          {
            role: "user",
            content: `Combine and condense the following randomization ideas into a shorter list of clear, direct answers. Only output the final list, one idea per line, with no explanations or instructions:\n\n${ideasData.ideas.join('\n')}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      // Extract the summarized ideas from the response
      const summarizedIdeas = completion.choices[0].message.content
        .split('\n')
        .map(idea => idea.trim())
        .filter(idea => idea.length > 0)
        // Remove any potential numbering, dashes, or bullet points
        .map(idea => idea.replace(/^[\d\-\*\.]+[\s]*/, ''));

      // Save the summarized ideas to the session
      await Session.findOneAndUpdate(
        { sessionID },
        { 
          $set: { 
            summarizedIdeas,
            isSummarizing: false
          }
        }
      );

      return NextResponse.json({
        ideas: summarizedIdeas,
        status: 'complete'
      });

    } catch (error) {
      // Reset the summarizing flag if there's an error
      await Session.findOneAndUpdate(
        { sessionID },
        { $set: { isSummarizing: false } }
      );
      throw error;
    }

  } catch (error) {
    console.error("Error in getSummarizedIdeas:", error);
    return NextResponse.json({ 
      message: "Error getting summarized ideas.", 
      error: error.message 
    }, { status: 500 });
  }
} 