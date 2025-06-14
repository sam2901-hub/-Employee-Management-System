import { Router } from 'express'
import userModel from '../../model/usermodel.js'
import { successResponse, errorResponse } from '../../helper/serverResponse.js'
import path from 'path'
import fs from 'fs'
import profileModel from '../../model/profilemodel.js'
import uploadRouter from './uploadRouter.js'

const userProfileRouter = Router()

// // profile
userProfileRouter.get('/getlogindata', getlogindataHandler)
userProfileRouter.get('/getprofile', getProfileHandler)
userProfileRouter.post('/createprofile', createProfileHandler)
userProfileRouter.use('/upload/', uploadRouter)
userProfileRouter.post('/deleteprofile', deleteProfileHandler)

export default userProfileRouter

// // get login     (user)
async function getlogindataHandler (req, res) {
  try {
    const id = res.locals.id
    if (!id) {
      return errorResponse(res, 404, 'id not foud- getUserProfile')
    }
    const data = await userModel
      .findById(id)
      .select({ tokenotp: 0, password: 0, role: 0 })
    if (!data) {
      return errorResponse(res, 404, 'user profile not found')
    }
    successResponse(res, 200, data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 404, 'internal server error')
  }
}

// // get profile
async function getProfileHandler (req, res) {
  try {
    const id = res.locals.id
    if (!id) {
      return errorResponse(res, 404, 'id not foud- getUserProfile')
    }
    const data = await profileModel.find({ userid: id })
    if (!data) {
      return errorResponse(res, 404, 'user profile not found')
    }
    successResponse(res, 200, data)
  } catch (error) {
    console.log(error)
    errorResponse(res, 404, 'internal server error')
  }
}

// // create profile
async function createProfileHandler (req, res) {
  try {
    const userid = res.locals.id

    // Check if profile already exists
    const existingUser = await profileModel.findOne({ userid })
    if (existingUser) {
      return errorResponse(res, 400, 'Profile already exists for this user.')
    }

    // Create the profile with minimal data
    const {
      doj,
      adhar,
      pan,
      bankDetails,
      education,
      address,
      city,
      state,
      country,
      blood_group,
      emergency_no
    } = req.body

    // Validate bank details
    const { branchName, accountNumber, IFSC_code } = bankDetails || {}
    if (!branchName || !accountNumber || !IFSC_code) {
      return errorResponse(res, 400, 'Incomplete bank details.')
    }

    // validate education details

    const { degree, stream, passout_year } = education || {}
    if (!degree || !stream || !passout_year) {
      return errorResponse(res, 400, 'Incomplete education details.')
    }

    // Create the profile
    const profileData = {
      userid,
      doj,
      adhar,
      pan,
      bankDetails,
      education,
      address,
      city,
      state,
      country,
      blood_group,
      emergency_no
    }

    const newProfile = await profileModel.create(profileData)

    const userDetails = await userModel.find({ _id: userid })

    if (!userDetails.length) {
      return errorResponse(res, 404, 'User not found')
    }
    const { firstname, lastname, mobile, email } = userDetails[0]

    await profileModel.findByIdAndUpdate(newProfile._id, {
      firstname,
      lastname,
      email,
      mobile
    })

    // Optionally update the user's profile status
    await userModel.findByIdAndUpdate(
      userid,
      { profileStatus: 'completed' },
      { new: true }
    )

    return successResponse(res, 'Profile created successfully', {
      ...profileData,
      firstname,
      lastname,
      email,
      mobile
    })
  } catch (error) {
    console.error('Error creating profile:', error)
    return errorResponse(res, 500, 'Internal server error')
  }
}

// //delete profile
async function deleteProfileHandler (req, res) {
  try {
    const { id } = req.body
    const order = await profileModel.findById(id)
    if (!order) {
      return errorResponse(res, 400, 'Profile not found')
    }

    const images = order.images

    // Iterate over the values of the images object
    for (const filename of Object.values(images)) {
      // Check if filename is defined and not empty
      if (filename) {
        const filePath = path.join('./uploads', filename)
        try {
          await fs.promises.unlink(filePath)
          console.log('Deleted file:', filePath)
        } catch (error) {
          console.error('Error deleting file:', error)
        }
      } else {
        console.warn('Filename is undefined or empty:', filename)
      }
    }

    // Optionally delete the profile from the database
    await profileModel.findByIdAndDelete(id)
    successResponse(
      res,
      200,
      'Profile and associated images deleted successfully'
    )
  } catch (error) {
    console.error('Error in deleteProfileHandler:', error)
    return errorResponse(res, 500, 'Internal server error')
  }
}
