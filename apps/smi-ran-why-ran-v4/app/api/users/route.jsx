import connectMongoDB from '../libs/mongodb'
import User from '../models/user'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await connectMongoDB()
    const user = await User.find()
    return NextResponse.json(user)
  } catch (error) {
    console.error(error)
    // Return an error response
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
