
import connectMongoDB from '../libs/mongodb'
import Group from '../models/group'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose';

export async function POST(req) {
    try {
        // Connect to MongoDB
        await connectMongoDB();

        // Parse the request body to get the grp_id
        const { grp_id } = await req.json();

        // Find the group by grp_id
        const group = await Group.findOne({ grp_id });

        if (!group) {
            // If no group found, return an error response without updating __v
            return NextResponse.json(
                { message: `Group with grp_id ${grp_id} does not exist.` },
                { status: 404 }
            );
        }

        // If __v is 0, update the group and return a success message
        if (group.__v === 0) {
            group.__v += 1;
            group.firstVisitedUser = true;
            await group.save();

            return NextResponse.json(
                { message: `You are the first visited user for the group with grp_id ${grp_id} and it has been updated successfully.` },
                { status: 200 }
            );
        } else {
            // Increment __v and get the updated document
            await Group.updateOne({ grp_id }, { $inc: { __v: 1 } });

            // Find the updated group to get the new __v
            const updatedGroup = await Group.findOne({ grp_id });

            return NextResponse.json(
                { message: `Group with grp_id ${grp_id} and __v ${updatedGroup.__v} has already been visited.` },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error updating group:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

  