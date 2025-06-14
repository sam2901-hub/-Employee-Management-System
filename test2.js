import dbConnect from './db.js'
import attendanceModel from './model/attendancemodel.js'
import leaveModel from './model/leaveModel.js'
import userModel from './model/usermodel.js'
import cron from 'node-cron'

await dbConnect()

const addAttendanceForAllUsers = async () => {
  try {
    const users = await userModel.find({ role: 'user' })
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]

    // Step 1: Create initial attendance records
    const attendancePromises = users.map(user => {
      const attendance = new attendanceModel({
        userid: user._id,
        date: formattedDate,
        present: false,
        leaveType: 'null',
        leaveReason: 'null',
        timeIn: null,
        timeOut: null,
        totalHours: 0
      })
      return attendance.save()
    })

    await Promise.all(attendancePromises)
    console.log('Initial attendance recorded for all users')

    // Step 2: Find all leaves for today
    const leaveRecords = await leaveModel.find({
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: 'approved'
    })

    const updatePromises = leaveRecords.map(leave => {
      return attendanceModel.findOneAndUpdate(
        { userid: leave.userId },
        {
          present: false,
          leaveType: leave.leaveType,
          leaveReason: leave.leaveReason
        },
        { new: true } // Return the updated document
      )
    })

    await Promise.all(updatePromises)
    console.log('Attendance records updated for users on leave')
  } catch (error) {
    console.error('Error processing attendance:', error)
  }
}

addAttendanceForAllUsers()
