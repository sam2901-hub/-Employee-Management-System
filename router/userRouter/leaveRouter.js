import { Router } from 'express'
import { successResponse, errorResponse } from '../../helper/serverResponse.js'
import leaveModel from '../../model/leaveModel.js'

const userLeaveRouter = Router()

// // profile
userLeaveRouter.get('/leavetype', getAllLeaveTypeHandler)
userLeaveRouter.get('/getleaves', getAllLeavesHandler)
userLeaveRouter.post('/createleave', createLeaveHandler)
userLeaveRouter.post('/updateleave', updateLeaveHandler)
userLeaveRouter.post('/deleteleave', deleteLeaveHandler)

export default userLeaveRouter

// // Get all Leaves
async function getAllLeavesHandler (req, res) {
  try {
    const id = res.locals.id
    if (!id) {
      return errorResponse(res, 404, 'id not found')
    }
    const data = await leaveModel.find({ userId: id })

    if (!data) {
      return errorResponse(res, 404, 'leaves not found')
    }
    successResponse(res, 200, data)
  } catch (error) {
    console.error(error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // create leave 
async function createLeaveHandler(req, res) {
  try {
    const userId = res.locals.id;
    const { leaveType, leaveReason, startDate, endDate } = req.body;

    // Check for missing parameters
    if (!userId || !leaveType || !leaveReason || !startDate || !endDate) {
      return errorResponse(res, 400, 'Some parameters are missing - create leave');
    }

    // Parse dates with specific time
    const start = new Date(`${startDate}T00:00:00`); // Start of the day
    const end = new Date(`${endDate}T12:00:00`); // Midday of the end date

    // Validate dates
    if (isNaN(start) || isNaN(end) || start >= end) {
      return errorResponse(res, 400, 'Invalid date range');
    }

    // Prepare parameters for leave creation
    const params = {
      userId,
      leaveType,
      leaveReason,
      startDate: start,
      endDate: end
    };

    // Create leave entry in the database
    const data = await leaveModel.create(params);
    return successResponse(res, 201, data);
    
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, 'Internal server error');
  }
}

// // update leave
async function updateLeaveHandler (req, res) {
  try {
    const { leaveid } = req.body
    const updateddata = req.body
    const options = { new: true }

    // Check for required parameters
    if (
      !updateddata.leaveType ||
      !updateddata.startDate ||
      !updateddata.endDate
    ) {
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

// // Delete Leave
async function deleteLeaveHandler (req, res) {
  try {
    const { leaveid } = req.body
    if (!leaveid) {
      return errorResponse(res, 404, 'id not found')
    }
    const data = await taskModel.findByIdAndDelete(leaveid)
    if (!data) {
      errorResponse(res, 400, 'data not found for delete')
      return
    }
    successResponse(res, 'Deleted Successfully', data)
  } catch (error) {
    errorResponse(res, 500, 'internal server error')
  }
}

// // Get all leaves type
async function getAllLeaveTypeHandler (req, res) {
  try {
    const leaves = [
      'Unpaid Leave',
      'Paid Leave',
      'Sick Leave',
      'Casual Leave',
      'Holiday'
    ]
    successResponse(res, 200, leaves)
  } catch (error) {
    errorResponse(res, 500, 'internal server error')
  }
}

