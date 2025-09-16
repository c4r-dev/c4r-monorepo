import connectMongoDB from '../libs/mongodb'
import Group from '../models/group'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose';


//post request to create a unique grp id and add it to DB
export async function POST(request) {
    try {
        await connectMongoDB();

        const { grp_id, name, assignedVariable,selectedOption,selectedSecondOption } = await request.json();

        if (!grp_id || !name || !assignedVariable || !selectedOption || !selectedSecondOption) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Find the group by grp_id
        const group = await Group.findOne({ grp_id });

        if (!group) {
            return NextResponse.json(
                { message: 'Group not found' },
                { status: 404 }
            );
        }

        // Generate a new ObjectId for the student_id
        const student_id = new mongoose.Types.ObjectId();

        // Add the new student to the students array
        group.students.push({ student_id, name, assignedVariable, selectedOption,selectedSecondOption });

        // Save the updated group
        await group.save();

        // Return the updated group
        return NextResponse.json(
            { message: 'Student added successfully', group },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}


//perfect deleting student inside array of student
export async function DELETE(request) {
    try {
        await connectMongoDB();

        const { grp_id, name } = await request.json();

        if (!grp_id || !name) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Find the group by grp_id
        const group = await Group.findOne({ grp_id });

        if (!group) {
            return NextResponse.json(
                { message: 'Group not found' },
                { status: 404 }
            );
        }

        // Find the student in the students array by name and remove them
        const updatedStudents = group.students.filter(
            (student) => student.name !== name
        );

        // If the student was not found, return an error
        if (updatedStudents.length === group.students.length) {
            return NextResponse.json(
                { message: 'Student not found' },
                { status: 404 }
            );
        }

        // Update the group's students array
        group.students = updatedStudents;

        // Save the updated group
        await group.save();

        // Return the updated group
        return NextResponse.json(
            { message: 'Student deleted successfully', group },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
