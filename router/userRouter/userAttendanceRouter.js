import { Router } from 'express'
import attendanceModel from '../../model/attendancemodel.js'

const attendanceRouter = Router()

attendanceRouter.get('/timein', timeinattendanceHandler)
attendanceRouter.get('/timeout', timeoutattendanceHandler)

export default attendanceRouter

// // time in

async function timeinattendanceHandler (req, res) {
  const userid = res.locals.id

  const today = new Date()
  const dateKey = today.toISOString().split('T')[0] // Current date in YYYY-MM-DD format
  const timein = today.toLocaleTimeString()

  try {
    const updatedAttendance = await attendanceModel.findOneAndUpdate(
      { userid: userid, date: dateKey },
      { timeIn: timein },
      { new: true, runValidators: true }
    )

    if (!updatedAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' })
    }

    res.status(200).json(updatedAttendance)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// // time out
async function timeoutattendanceHandler (req, res) {
  const userid = res.locals.id

  const today = new Date()
  const dateKey = today.toISOString().split('T')[0] // Current date in YYYY-MM-DD format
  const timeout = today.toLocaleTimeString()

  try {
    const updatedAttendance = await attendanceModel.findOneAndUpdate(
      { userid: userid, date: dateKey },
      { timeOut: timeout },
      { new: true, runValidators: true }
    )

    if (!updatedAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' })
    }

    res.status(200).json(updatedAttendance)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
