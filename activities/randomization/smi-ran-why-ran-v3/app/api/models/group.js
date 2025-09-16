import mongoose, { Schema } from 'mongoose'


const studentSchema = new Schema(
    {
      student_id: {
        type: Schema.Types.ObjectId,
        default: new mongoose.Types.ObjectId(),
      },
      name: String,
      assignedVariable: String, // Or Number, depending on your use case
      selectedOption:Number,
      selectedSecondOption:Number
    },
    { _id: false } // Prevents automatic generation of _id field for students
  );

const groupSchema = new Schema({
    grp_id: String,
    firstVisitedUser: Boolean,
    name: String,
    students: [studentSchema],
    name: String,
    assignedVariable: String,
    counter : Number
    }
  )

export default mongoose.models.Group || mongoose.model('Group', groupSchema)


