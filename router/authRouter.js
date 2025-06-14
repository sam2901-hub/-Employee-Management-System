import { Router } from 'express'
import usermodel from '../model/usermodel.js'
import {
  bcryptPassword,
  comparePassword,
  generateAccessToken,
  getEmailOTP,
  getSessionData,
  validatetoken,
  checkRateLimit
} from '../helper/helperFunction.js'
import { successResponse, errorResponse } from '../helper/serverResponse.js'

const authRouter = Router()

authRouter.post('/signin', signinHandler)
authRouter.post('/forgotpassword', forgetpasswordHandler)
authRouter.post('/resetpassword', resetpasswordHandler)
authRouter.post('/publictoken', refreshtokenHandler)
authRouter.post('/signup', signupHandler)

export default authRouter

//signin
async function signinHandler (req, res) {
  try {
    const email = req.body.email
    const password = req.body.password
    const users = await usermodel.findOne({ email })

    if (!users) {
      errorResponse(res, 404, 'email not found')
      return
    }
    const comparepassword = comparePassword(password, users.password)

    if (!comparepassword) {
      return errorResponse(res, 404, 'invalid password')
    }
    const userid = users._id.toString()

    const { encoded_token, public_token } = generateAccessToken(
      userid,
      users.email,
      users.role
    )

    successResponse(res, 'SignIn successfully', {
      encoded_token,
      public_token
    })
  } catch (error) {
    console.log(error)
    errorResponse(res, 500, 'internal server error')
  }
}

//forget password
async function forgetpasswordHandler (req, res) {
  try {
    const { email } = req.body
    const usersotp = await usermodel.findOne({ email })
    if (!usersotp) {
      errorResponse(res, 400, 'email id not found')
      return
    }
    const isWithinRateLimit = await checkRateLimit(email)
    if (!isWithinRateLimit) {
      return errorResponse(
        res,
        429,
        'Too many requests, please try again later'
      )
    }
    usersotp.tokenotp = await getEmailOTP(email)
    await usersotp.save()

    successResponse(res, 'OTP successfully sent')
  } catch (error) {
    console.log('error', error)
    errorResponse(res, 400, 'internal server error')
  }
}

//Reset password
async function resetpasswordHandler (req, res) {
  try {
    const { email, tokenotp, password } = req.body
    const userReset = await usermodel.findOne({ email })

    if (!userReset) {
      errorResponse(res, 400, 'email id not found')
      return
    }

    if (tokenotp != userReset.tokenotp) {
      errorResponse(res, 400, 'invalid otp')
      return
    }
    userReset.password = bcryptPassword(password)
    userReset.save()
    successResponse(res, 'password set successfully')
  } catch (error) {
    console.log('error', error)
  }
}

//refresh token
async function refreshtokenHandler (req, res) {
  try {
    const token = req.body.public_token

    if (!token) {
      errorResponse(res, 400, 'token not found')
      return
    }
    let decoded = validatetoken(token)

    const sessionid = decoded ? getSessionData(decoded.id) : null

    if (!sessionid || sessionid != decoded.sessionid) {
      console.log('session refresh token reused', decoded.id)
      throw new Error('refresh token expired')
    }

    const { encoded_token, public_token } = generateAccessToken(
      decoded.id,
      decoded.email,
      decoded.role
    )
    successResponse(res, 'refresh tokens successfully', {
      encoded_token,
      public_token
    })
  } catch (error) {
    console.log(error.message)
    errorResponse(res, 401, 'refresh token expired, signin')
  }
}

// // user signup
async function signupHandler (req, res) {
  try {
    const { firstname, lastname, email, mobile, password } = req.body

    if (!firstname || !lastname || !mobile || !password) {
      return errorResponse(res, 400, 'some params are missing at signup')
    }
    const existingUser = await usermodel.findOne({ email })
    if (existingUser) {
      return errorResponse(res, 409, 'User with this email already exists')
    }

    const hashedpassword = bcryptPassword(password)

    const newUser = await usermodel.create({
      firstname,
      lastname,
      email,
      mobile,
      password: hashedpassword
    })

    await newUser.save()

    return successResponse(res, 'Successfully signed up')
  } catch (error) {
    console.log('Error:', error.message)
    return errorResponse(res, 500, 'Internal server error')
  }
}

// const isAuthenticated = async (req, res, next) => {
//   try {
//     const email = req.body.email
//     const password = req.body.password
//     const users = await usermodel.findOne({ email })

//     if (!users) {
//       errorResponse(res, 404, 'email not found')
//       return
//     }
//     const comparepassword = comparePassword(password, users.password)

//     if (!comparepassword) {
//       return errorResponse(res, 404, 'invalid password')
//     }
//     const userid = users._id.toString()

//     const { encoded_token, public_token } = generateAccessToken(
//       userid,
//       users.email,
//       users.role
//     )

//     // Store the user ID in res.locals
//     res.locals.id = userid
//     res.locals.encoded_token = encoded_token
//     res.locals.public_token = public_token
//     next()
//   } catch (error) {
//     console.log(error)
//     errorResponse(res, 500, 'internal server error')
//   }
// }

// authRouter.post('/signin', isAuthenticated, signinHandler)

// async function signinHandler (req, res) {
//   const userId = res.locals.id
//   const encoded_token = res.locals.encoded_token
//   const public_token = res.locals.public_token

//   const today = new Date()
//   const dateKey = today.toISOString().split('T')[0] // Current date in YYYY-MM-DD format
//   const timein = today.toLocaleTimeString()

//   try {
//     let attendance = await attendanceModel.findOne({
//       userid: userId,
//       date: dateKey
//     })

//     let isonleave = await leaveModel.findOne({
//       userId: userId,
//       status: 'approved'
//     })

//     console.log('isonleave', isonleave)

//     if (isonleave) {
//       return successResponse(res, 'Sign In successfully, User is on leave', {
//         encoded_token,
//         public_token
//       })
//     }

//     if (!attendance) {
//       // If no attendance record exists for today, create a new one
//       attendance = new attendanceModel({
//         userid: userId,
//         date: dateKey,
//         timeIn: timein,
//         present: true
//       })
//       await attendance.save()
//       return successResponse(
//         res,
//         'SignIn successfully with attendance for today',
//         {
//           encoded_token,
//           public_token
//         }
//       )
//     } else {
//       // If an attendance record exists, update it
//       attendance.timeIn = timein
//       attendance.present = true
//       await attendance.save()
//       return successResponse(res, 'Attendance updated for today.', {
//         encoded_token,
//         public_token
//       })
//     }
//   } catch (error) {
//     console.error(error)
//     return res.status(500).send('Error processing attendance.')
//   }
// }
