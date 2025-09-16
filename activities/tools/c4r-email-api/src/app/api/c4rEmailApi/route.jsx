import { NextResponse } from "next/server";
import connectMongoDB from '../libs/mongodb';
import Email from "../models/c4rEmail";

// Helper function to handle CORS
function corsResponse(response, request) {
  const allowedOrigins = [
    'https://c4r.io',
    'https://www.c4r.io', 
    'https://c4r-new.webflow.io',
    'https://www.c4r-new.webflow.io',
    'https://c4r-dev.github.io'
  ];
  const origin = allowedOrigins.includes(request?.headers?.get('origin')) 
    ? request?.headers?.get('origin') 
    : allowedOrigins[0];
    
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request) {
  return corsResponse(new NextResponse(null, { status: 200 }), request);
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return corsResponse(
        NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        ),
        request
      );
    }

    await connectMongoDB();
    await Email.create({ email });
    
    return corsResponse(
      NextResponse.json(
        { message: "Email saved successfully" },
        { status: 201 }
      ),
      request
    );
  } catch (error) {
    console.error("Error saving email:", error);
    return corsResponse(
      NextResponse.json(
        { error: "Failed to save email" },
        { status: 500 }
      ),
      request
    );
  }
}

export async function GET(request) {
  try {
    await connectMongoDB();
    const emails = await Email.find().sort({ createdAt: -1 });
    
    return corsResponse(
      NextResponse.json(emails),
      request
    );
  } catch (error) {
    console.error("Error fetching emails:", error);
    return corsResponse(
      NextResponse.json(
        { error: "Failed to fetch emails" },
        { status: 500 }
      ),
      request
    );
  }
}
