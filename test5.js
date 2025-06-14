import dbConnect from './db.js'
import attendanceModel from './model/attendancemodel.js'
import holidayModel from './model/holidaymodel.js'
import leaveModel from './model/leaveModel.js'
import userModel from './model/usermodel.js'
import cron from 'node-cron'

await dbConnect()

const addAttendanceForAllUsers = async () => {
  try {
    const users = await userModel.find({ role: 'user' })
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]

    // Step 1: Check if today is a holiday
    const holidayRecord = await holidayModel.findOne({
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: 'approved'
    })

    console.log('Holiday records:', holidayRecord)

    // Step 2: Create initial attendance records if they don't exist
    const attendancePromises = users.map(async user => {
      const existingAttendance = await attendanceModel.findOne({
        userid: user._id,
        date: formattedDate
      })
      if (!existingAttendance) {
        const attendance = new attendanceModel({
          userid: user._id,
          date: formattedDate,
          present: false, // Default to false
          leaveType: holidayRecord ? holidayRecord.leaveType : null,
          leaveReason: holidayRecord ? holidayRecord.leaveReason : null,
          timeIn: null,
          timeOut: null,
          totalHours: 0
        })
        try {
          return await attendance.save()
        } catch (err) {
          console.error(`Error saving attendance for user ${user._id}:`, err)
        }
      }
    })

    await Promise.all(attendancePromises)
    console.log(
      'Initial attendance recorded for all users if not already present'
    )

    // If today is a holiday, update today's attendance records
    if (holidayRecord) {
      const updatePromises = users.map(async user => {
        try {
          return await attendanceModel.findOneAndUpdate(
            { userid: user._id, date: formattedDate },
            {
              present: false,
              leaveType: holidayRecord.leaveType,
              leaveReason: holidayRecord.leaveReason
            },
            { new: true }
          )
        } catch (err) {
          console.error(`Error updating attendance for user ${user._id}:`, err)
        }
      })

      await Promise.all(updatePromises)
      console.log('Attendance records updated for holiday for today')

      // Skip checking for leaves if a holiday is present
      return
    }

    // Step 3: Find all leaves for today only if no holiday
    const leaveRecords = await leaveModel.find({
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: 'approved'
    })

    const updateLeavePromises = leaveRecords.map(async leave => {
      try {
        return await attendanceModel.findOneAndUpdate(
          { userid: leave.userId, date: formattedDate },
          {
            present: false,
            leaveType: leave.leaveType,
            leaveReason: leave.leaveReason
          },
          { new: true }
        )
      } catch (err) {
        console.error(
          `Error updating attendance for user ${leave.userId}:`,
          err
        )
      }
    })

    await Promise.all(updateLeavePromises)
    console.log('Attendance records updated for users on leave for today')
  } catch (error) {
    console.error('Error processing attendance:', error)
  }
}

// Schedule the cron job
cron.schedule('30 2 17 * * *', () => {
  console.log('Running cron job to add attendance for all users...')
  addAttendanceForAllUsers()
})

// Initial invocation (if needed)
addAttendanceForAllUsers()
