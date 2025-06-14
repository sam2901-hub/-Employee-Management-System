import { Router } from 'express'
import { successResponse, errorResponse } from '../../helper/serverResponse.js'
import taskModel from '../../model/taskmodel.js'

const userTaskRouter = Router()

userTaskRouter.post('/tasks', getAllTaskHandler)
userTaskRouter.get('/getsingletask', getSingleTaskHandler)
userTaskRouter.post('/updatetask', updateTaskHandler)

export default userTaskRouter

// // get task         (task)
async function getAllTaskHandler (req, res) {
  try {
    const { pageno = 0, sortby = {}, filterby = {}, search = '' } = req.body
    const pageNo = parseInt(pageno, 10) || 0

    const limit = 100
    const skip = pageNo * limit

    let query = {}

    const userId = res.locals.id

    query.assignedTo = userId

    if (filterby.status) {
      query.status = filterby.status
    }

    // Construct search query
    if (search) {
      const escapedQuery = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const searchRegex = new RegExp(escapedQuery, 'i')
      query.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { status: { $regex: searchRegex } }
      ]
    }

    // Handle sorting
    const sortOptions =
      sortby && typeof sortby === 'object' && Object.keys(sortby).length === 0
        ? { createdAt: -1 }
        : sortby

    const data = await taskModel
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    if (!data || data.length === 0) {
      return errorResponse(res, 400, 'Data not found')
    }

    return successResponse(res, 'success', data)
  } catch (error) {
    console.error('Error:', error)
    return errorResponse(res, 500, 'Internal server error')
  }
}

// // get single task
async function getSingleTaskHandler (req, res) {
  try {
    const { taskid } = req.body

    if (!taskid) {
      return errorResponse(res, 404, 'id not found - getAllTask')
    }

    const data = await taskModel.findById(taskid)

    if (!data) {
      return errorResponse(res, 404, 'task not found')
    }

    successResponse(res, 200, data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // update task
async function updateTaskHandler (req, res) {
  try {
    const { taskid } = req.body
    const updateddata = req.body
    const options = { new: true }

    // Check for required parameters
    if (!updateddata.status) {
      const message = 'update-task - some params missing'
      return errorResponse(res, 400, message)
    }

    const data = await taskModel.findByIdAndUpdate(taskid, updateddata, options)
    successResponse(res, 'success updated', data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}
