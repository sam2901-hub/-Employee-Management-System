import { Router } from 'express'
import { errorResponse, successResponse } from '../../helper/serverResponse.js'
import commentModel from '../../model/commentModel.js'

const admincommentRouter = Router()

admincommentRouter.post('/', getAllCommentsHandler)
admincommentRouter.post('/createcomment', createCommentHandler)
admincommentRouter.post('/updatecomment', updateCommentHandler)
admincommentRouter.post('/deletecomment', deleteCommentHandler)

export default admincommentRouter

// // get all commments
async function getAllCommentsHandler (req, res) {
  try {
    const { taskid } = req.body

    const data = await commentModel.find({ taskid })

    if (!data || data.length === 0) {
      return errorResponse(res, 404, 'Comments not found')
    }

    return successResponse(res, 200, data)
  } catch (error) {
    console.log('error', error)
    return errorResponse(res, 500, 'Internal server error')
  }
}

// // create comment
async function createCommentHandler (req, res) {
  try {
    const { taskid, comment, date } = req.body
    const createdBy = res.locals.id

    // Check for required parameters
    if (!taskid || !comment || !date || !createdBy) {
      const message = 'create comment - some params missing'
      return errorResponse(res, 400, message)
    }

    // Create the task
    const taskParams = {
      taskid,
      comment,
      date,
      createdBy
    }

    const newTask = await commentModel.create(taskParams)
    successResponse(res, 'comment created successfully', newTask)
  } catch (error) {
    console.log('error', error)
    errorResponse(res, 500, 'Internal server error')
  }
}

// // update task
async function updateCommentHandler (req, res) {
  try {
    const { id } = req.body
    const updateddata = req.body
    const options = { new: true }

    // Check for required parameters
    if (!updateddata.comment) {
      const message = 'update comment - some params missing'
      return errorResponse(res, 400, message)
    }

    const data = await commentModel.findByIdAndUpdate(id, updateddata, options)
    successResponse(res, 'success updated', data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // Delete task
async function deleteCommentHandler (req, res) {
  const { id } = req.body
  if (!id) {
    return errorResponse(res, 404, 'id not found')
  }
  const data = await commentModel.findByIdAndDelete(id)
  if (!data) {
    errorResponse(res, 500, 'internal server error')
    return
  }
  successResponse(res, 'Deleted Successfully', data)
}
