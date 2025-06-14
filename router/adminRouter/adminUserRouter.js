import { Router } from 'express'
import userModel from '../../model/usermodel.js'
import { successResponse, errorResponse } from '../../helper/serverResponse.js'
import { bcryptPassword } from '../../helper/helperFunction.js'
import profileModel from '../../model/profilemodel.js'

const adminUserRouter = Router()

// // users
adminUserRouter.get('/userslist', getuserlistHandler)
adminUserRouter.get('/getuserprofile', getSingleusersHandler)
adminUserRouter.post('/createuser', createUserHandler)
adminUserRouter.post('/updateuser', updateUserHandler)
adminUserRouter.post('/deleteuser', deleteUserHandler)

export default adminUserRouter

// // Get user list
async function getuserlistHandler (req, res) {
  try {
    const data = await userModel.find({ role: 'user' }).select({
      tokenotp: 0,
      password: 0,
      mobile: 0,
      email: 0,
      role: 0,
      __v: 0,
      profileStatus: 0
    })
    if (!data) {
      return errorResponse(res, 404, 'user list not found')
    }
    successResponse(res, 'success', data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // // get single user
async function getSingleusersHandler (req, res) {
  try {
    const { id } = req.body
    if (!id) {
      return errorResponse(res, 404, 'id not found')
    }
    const data = await profileModel
      .find({ userid: id })
      .select({ tokenotp: 0, password: 0 })

    if (!data) {
      return errorResponse(res, 404, 'User not found')
    }
    successResponse(res, 'success', data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // create user
async function createUserHandler (req, res) {
  try {
    const { firstname, lastname, email, designation, mobile, password } =
      req.body
    if (
      !firstname ||
      !lastname ||
      !email ||
      !designation ||
      !mobile ||
      !password
    ) {
      const message = 'adduser - some params missing'
      errorResponse(res, 400, message)
      return
    }

    // Check if the email already exists
    const existingUser = await userModel.findOne({ email })
    if (existingUser) {
      return errorResponse(res, 400, 'Email already in use')
    }

    const hashedpassword = bcryptPassword(password)

    const params = {
      firstname,
      lastname,
      email,
      designation,
      mobile,
      password: hashedpassword
    }

    await userModel.create(params)
    successResponse(res, 'success added', params)
  } catch (error) {
    console.log('error', error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // update user
async function updateUserHandler (req, res) {
  try {
    const { id } = req.body
    const updateddata = req.body
    const options = { new: true }
    if (
      !updateddata.firstname ||
      !updateddata.lastname ||
      !updateddata.email ||
      !updateddata.designation ||
      !updateddata.mobile
    ) {
      errorResponse(res, 500, 'params missing at updated data')
      return
    }

    const data = await userModel.findByIdAndUpdate(id, updateddata, options)
    successResponse(res, 'success updated', data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}

// // Delete user
async function deleteUserHandler (req, res) {
  try {
    const { id } = req.body
    const updateddata = req.body
    const options = { new: true }
    if (!updateddata.userdeleted) {
      errorResponse(res, 500, 'params missing at deletedata')
      return
    }

    const data = await userModel.findByIdAndUpdate(id, updateddata, options)
    successResponse(res, 'success updated', data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}
