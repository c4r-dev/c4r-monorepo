
import { type NextRequest } from 'next/server';
import connectMongoDB from "../../libs/mongodb"
import User from "../../models/User"

export async function GET(request: NextRequest) {

  const searchParams = request.nextUrl.searchParams
  const name = searchParams.get("name")

  await connectMongoDB();

  try {
    const data = await User.findOne({ name: name });
    if (!data) {
      return Response.json({ error: 'Name is not found' });
    }
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Internal Server Error' });
  }
}