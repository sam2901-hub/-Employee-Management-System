import { Router } from 'express'
import { successResponse, errorResponse } from '../../helper/serverResponse.js'
import taskModel from '../../model/taskmodel.js'

const adminTaskRouter = Router()

// // task
adminTaskRouter.post('/tasks', getAlltaskHandler)
adminTaskRouter.post('/singletask', getSingletaskHandler)
adminTaskRouter.post('/createtask', createtaskHandler)
adminTaskRouter.post('/updatetask', updatetaskHandler)
adminTaskRouter.post('/deletetask', deletetaskHandler)

export default adminTaskRouter

// // Get all task          (Tasks..)
async function getAlltaskHandler (req, res) {
  try {
    const { pageno = 0, sortby = {}, filterby = {}, search = '' } = req.body
    const pageNo = parseInt(pageno, 10) || 0

    const limit = 100
    const skip = pageNo * limit

    let query = {}

    // Construct filter query
    if (filterby.assignedTo) {
      query.assignedTo = filterby.assignedTo
    }

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
        // { taskno: { $regex: searchRegex } },
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

// // // get single Task
async function getSingletaskHandler (req, res) {
  try {
    const { id } = req.body
    if (!id) {
      return errorResponse(res, 404, 'id not found')
    }
    const data = await taskModel.findById(id)
    if (!data) {
      return errorResponse(res, 404, 'task not found')
    }
    successResponse(res, 'success', data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // create task
async function createtaskHandler (req, res) {
  try {
    const { title, description, taskno, status, assignedTo, priority, duedate } = req.body
    const createdBy = res.locals.id

    // Check for required parameters
    if (
      !title ||
      !description ||
      !taskno ||
      !assignedTo ||
      !createdBy ||
      !priority ||
      !duedate
    ) {
      const message = 'create-task - some params missing'
      return errorResponse(res, 400, message)
    }

    // Create the task
    const taskParams = {
      title,
      description,
      taskno,
      status,
      assignedTo,
      createdBy,
      priority,
      duedate
    }

    const newTask = await taskModel.create(taskParams)
    successResponse(res, 'Task created successfully', newTask)
  } catch (error) {
    console.log('error', error)
    errorResponse(res, 500, 'Internal server error')
  }
}

// // update task
async function updatetaskHandler (req, res) {
  try {
    const { id } = req.body
    const updateddata = req.body
    const options = { new: true }

    // Check for required parameters
    if (
      !updateddata.title ||
      !updateddata.description ||
      !updateddata.taskno ||
      !updateddata.status ||
      !updateddata.assignedTo ||
      !updateddata.priority ||
      !updateddata.duedate
    ) {
      const message = 'update-task - some params missing'
      return errorResponse(res, 400, message)
    }

    const data = await taskModel.findByIdAndUpdate(id, updateddata, options)
    successResponse(res, 'success updated', data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // Delete task
async function deletetaskHandler (req, res) {
  const { id } = req.body
  if (!id) {
    return errorResponse(res, 404, 'id not found')
  }
  const data = await taskModel.findByIdAndDelete(id)
  if (!data) {
    errorResponse(res, 500, 'internal server error')
    return
  }
  successResponse(res, 'Deleted Successfully', data)
}
