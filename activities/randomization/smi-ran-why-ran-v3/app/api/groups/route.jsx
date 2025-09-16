import connectMongoDB from '../libs/mongodb'
import Group from '../models/group'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose';


//working code to get empty students array
export async function GET() {
    try {
      await connectMongoDB();
  
      // Fetch all groups
      const groups = await Group.find({}).lean();
  
      // Ensure each group has a students array (even if it's empty)
      const groupsWithStudents = groups.map(group => {
        if (!group.students) {
          group.students = [];
        }
        return group;
      });
  
      return NextResponse.json(groupsWithStudents);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }

  //perfect adding student inside array of student

//   export async function POST(request) {
//     try {
//       await connectMongoDB();
  
//       const { grp_id, student_id, name, assignedVariable } = await request.json();
  
//       if (!grp_id || !student_id || !name || !assignedVariable) {
//         return NextResponse.json(
//           { message: 'Missing required fields' },
//           { status: 400 }
//         );
//       }
  
//       // Find the group by grp_id
//       const group = await Group.findOne({ grp_id });
//       console.log(group,"this is the group")
  
//       if (!group) {
//         return NextResponse.json(
//           { message: 'Group not found' },
//           { status: 404 }
//         );
//       }
  
//       // Add the new student to the students array
//       group.students.push({ student_id, name, assignedVariable });
  
//       // Save the updated group
//       await group.save();
  
//       // Return the updated group
//       return NextResponse.json(
//         { message: 'Student added successfully', group },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error(error);
//       return NextResponse.json(
//         { message: 'Internal Server Error' },
//         { status: 500 }
//       );
//     }
//   }


// export async function POST(request) {
//     try {
//         await connectMongoDB();

//         const { grp_id, name, assignedVariable,selectedOption,selectedSecondOption } = await request.json();

//         if (!grp_id || !name || !assignedVariable || !selectedOption || !selectedSecondOption) {
//             return NextResponse.json(
//                 { message: 'Missing required fields' },
//                 { status: 400 }
//             );
//         }

//         // Find the group by grp_id
//         const group = await Group.findOne({ grp_id });

//         if (!group) {
//             return NextResponse.json(
//                 { message: 'Group not found' },
//                 { status: 404 }
//             );
//         }

//         // Generate a new ObjectId for the student_id
//         const student_id = new mongoose.Types.ObjectId();

//         // Add the new student to the students array
//         group.students.push({ student_id, name, assignedVariable, selectedOption,selectedSecondOption });

//         // Save the updated group
//         await group.save();

//         // Return the updated group
//         return NextResponse.json(
//             { message: 'Student added successfully', group },
//             { status: 200 }
//         );
//     } catch (error) {
//         console.error(error);
//         return NextResponse.json(
//             { message: 'Internal Server Error' },
//             { status: 500 }
//         );
//     }
// }




//post request to create a unique grp id and add it to DB
export async function POST(req) {
    try {
      await connectMongoDB();
  
      // Parse the request body to get the new group data
      const body = await req.json();
      const { grp_id } = body;

       // Check if the grp_id already exists
    const existingGroup = await Group.findOne({ grp_id });

    if (existingGroup) {
      // If grp_id already exists, return an error response
      return NextResponse.json(
        { message: `Group with grp_id ${grp_id} already exists.` },
        { status: 400 }
      );
    }
  
      // Create a new group document
      const newGroup = new Group({
        grp_id,
        students:[]
      });
  
      // Save the new group to the database
      await newGroup.save();
  
      // Respond with the newly created group
      return NextResponse.json(newGroup);
    } catch (error) {
      console.error('Error creating group:', error);
      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }

    //perfect deleting student inside array of student
//   export async function DELETE(request) {
//     try {
//         await connectMongoDB();

//         const { grp_id, name } = await request.json();

//         if (!grp_id || !name) {
//             return NextResponse.json(
//                 { message: 'Missing required fields' },
//                 { status: 400 }
//             );
//         }

//         // Find the group by grp_id
//         const group = await Group.findOne({ grp_id });

//         if (!group) {
//             return NextResponse.json(
//                 { message: 'Group not found' },
//                 { status: 404 }
//             );
//         }

//         // Find the student in the students array by name and remove them
//         const updatedStudents = group.students.filter(
//             (student) => student.name !== name
//         );

//         // If the student was not found, return an error
//         if (updatedStudents.length === group.students.length) {
//             return NextResponse.json(
//                 { message: 'Student not found' },
//                 { status: 404 }
//             );
//         }

//         // Update the group's students array
//         group.students = updatedStudents;

//         // Save the updated group
//         await group.save();

//         // Return the updated group
//         return NextResponse.json(
//             { message: 'Student deleted successfully', group },
//             { status: 200 }
//         );
//     } catch (error) {
//         console.error(error);
//         return NextResponse.json(
//             { message: 'Internal Server Error' },
//             { status: 500 }
//         );
//     }
// }

//delete the unique grp id in the object
export async function DELETE(req) {
    try {
      await connectMongoDB();
  
      // Parse the request body to get the grp_id
      const body = await req.json();
      const { grp_id } = body;
  
      if (!grp_id) {
        return NextResponse.json(
          { message: 'grp_id is required' },
          { status: 400 }
        );
      }
  
      // Find the group by grp_id and delete it
      const deletedGroup = await Group.findOneAndDelete({ grp_id });
  
      if (!deletedGroup) {
        return NextResponse.json(
          { message: 'Group not found' },
          { status: 404 }
        );
      }
  
      // Respond with a success message
      return NextResponse.json(
        { message: `Group with grp_id ${grp_id} deleted successfully` },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error deleting group:', error);
      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }
