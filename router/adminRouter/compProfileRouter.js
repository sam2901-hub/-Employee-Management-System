import { Router } from 'express'
import compProfileModel from '../../model/compProfileModel.js'
import { successResponse, errorResponse } from '../../helper/serverResponse.js'

const compProfileRouter = Router()

// // users
compProfileRouter.get('/compdetails', getCompDetailsHandler)
compProfileRouter.post('/compprofile', createCompProfileHandler)
compProfileRouter.post('/updatecompprofile', updateCompProfileHandler)
compProfileRouter.post('/deletecompprofile', deleteCompProfileHandler)

export default compProfileRouter

// // Get user list
async function getCompDetailsHandler (req, res) {
  try {
    const data = await compProfileModel.find({})
    if (!data) {
      return errorResponse(res, 404, 'company details not found')
    }
    successResponse(res, 'success', data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // create user
async function createCompProfileHandler (req, res) {
  try {
    const {
      name,
      registrationNo,
      gstNo,
      address,
      email,
      contactNo,
      fyStart,
      fyEnd
    } = req.body

    if (
      !name ||
      !registrationNo ||
      !gstNo ||
      !address ||
      !email ||
      !contactNo ||
      !fyStart ||
      !fyEnd
    ) {
      const message = 'add company details - some params missing'
      errorResponse(res, 400, message)
      return
    }

    const params = {
      name,
      registrationNo,
      gstNo,
      address,
      email,
      contactNo,
      fyStart,
      fyEnd
    }

    await compProfileModel.create(params)
    successResponse(res, 'success added', params)
  } catch (error) {
    console.log('error', error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // update user
async function updateCompProfileHandler (req, res) {
  try {
    const { id } = req.body
    const updateddata = req.body
    const options = { new: true }
    if (
      !updateddata.name ||
      !updateddata.registrationNo ||
      !updateddata.gstNo ||
      !updateddata.address ||
      !updateddata.email ||
      !updateddata.contactNo ||
      !updateddata.fyStart ||
      !updateddata.fyEnd
    ) {
      errorResponse(res, 500, 'params missing at updated data')
      return
    }

    const data = await compProfileModel.findByIdAndUpdate(
      id,
      updateddata,
      options
    )
    successResponse(res, 'success updated', data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // Delete user
async function deleteCompProfileHandler (req, res) {
  try {
    const { id } = req.body
    if (!id) {
      return errorResponse(res, 400, 'id not found for delete')
    }

    const data = await compProfileModel.findByIdAndDelete(id)
    if (!data) {
      return errorResponse(res, 400, 'data not found')
    }
    successResponse(res, 'data deleted successfully', data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}
