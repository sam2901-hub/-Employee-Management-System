import { Router } from 'express'
import leaveModel from '../../model/leaveModel.js'
import { successResponse, errorResponse } from '../../helper/serverResponse.js'
import holidayModel from '../../model/holidaymodel.js'

const adminLeaveRouter = Router()

adminLeaveRouter.get('/getleaves', getAllLeaveHandler)
adminLeaveRouter.post('/approveleave', approveLeaveHandler)
adminLeaveRouter.post('/addholiday', addHolidayHandler)
adminLeaveRouter.post('/updateholiday', updateHolidayHandler)
adminLeaveRouter.get('/getallholidays', getAllHolidaysHandler)

export default adminLeaveRouter

// // get all leaves
async function getAllLeaveHandler (req, res) {
  try {
    const data = await leaveModel.find({})
    if (!data) {
      return errorResponse(res, 404, 'leaves not found')
    }
    successResponse(res, 'success', data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // update leave
async function approveLeaveHandler (req, res) {
  try {
    const { leaveid } = req.body
    const updateddata = req.body
    const options = { new: true }

    // Check for required parameters
    if (!updateddata.status) {
      const message = 'update-leave - some params missing'
      return errorResponse(res, 400, message)
    }

    const data = await leaveModel.findByIdAndUpdate(
      leaveid,
      updateddata,
      options
    )
    successResponse(res, 'success updated', data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // // holiday
// // add holiday
async function addHolidayHandler (req, res) {
  try {
    const { leaveReason, startDate, endDate } = req.body
    if (!leaveReason || !startDate || !endDate) {
      return errorResponse(res, 400, 'some params missing - add holiday')
    }
    const params = {
      leaveReason,
      startDate,
      endDate
    }
    const data = await holidayModel.create(params)
    successResponse(res, 200, data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // update holiday
async function updateHolidayHandler (req, res) {
  try {
    const { holidayid } = req.body
    const updateddata = req.body
    const options = { new: true }

    // Check for required parameters
    if (
      !updateddata.leaveReason ||
      !updateddata.startDate ||
      !updateddata.endDate
    ) {
      const message = 'update-leave - some params missing'
      return errorResponse(res, 400, message)
    }

    const data = await holidayModel.findByIdAndUpdate(
      holidayid,
      updateddata,
      options
    )
    successResponse(res, 'success updated', data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // get all holidays
async function getAllHolidaysHandler (req, res) {
  try {
    const data = await holidayModel.find({})
    if (!data) {
      return errorResponse(res, 400, 'holidays not found')
    }
    successResponse(res, 200, data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}
