import express from 'express'
import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import profileModel from '../../model/profilemodel.js'

const uploadRouter = Router()

// Set up storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  }
})

// Allowed file types
const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']

// Initialize upload with validation
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (!allowedTypes.includes(ext)) {
      return cb(new Error('Only images and PDFs are allowed'))
    }
    cb(null, true)
  }
})

// Create uploads directory if it doesn't exist
const dir = './uploads'
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}

// Endpoint to upload files and update user
uploadRouter.post(
  '/:id',
  upload.fields([
    { name: 'img_adhar', maxCount: 1 },
    { name: 'pan_img', maxCount: 1 },
    { name: 'photo_img', maxCount: 1 },
    { name: 'edu_certificate_img', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const userId = req.params.id
      const updateData = { images: {} }

      if (req.files) {
        // Update the image fields based on incoming file names
        if (req.files['img_adhar'] && req.files['img_adhar'][0]) {
          updateData.images.adhar = req.files['img_adhar'][0].filename
        }
        if (req.files['pan_img'] && req.files['pan_img'][0]) {
          updateData.images.pan = req.files['pan_img'][0].filename
        }
        if (req.files['photo_img'] && req.files['photo_img'][0]) {
          updateData.images.photo = req.files['photo_img'][0].filename
        }
        if (
          req.files['edu_certificate_img'] &&
          req.files['edu_certificate_img'][0]
        ) {
          updateData.images.edu_certificate =
            req.files['edu_certificate_img'][0].filename
        }
      }

      // Update the user document
      const updatedUser = await profileModel.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      )

      if (!updatedUser) {
        return res.status(404).json({ error: 'profile not found' })
      }

      res.json({
        status: 'success',
        user: updatedUser
      })
    } catch (err) {
      console.error(err)
      res
        .status(500)
        .json({ error: 'An error occurred while updating the user' })
    }
  }
)

export default uploadRouter

// import { Router } from 'express'
// import multer from 'multer'
// import path from 'path'
// import { fileURLToPath } from 'url'
// import { dirname } from 'path'
// import fs from 'fs'
// import mongoose from 'mongoose'
// import profileModel from '../../model/profilemodel.js'
// import { successResponse , errorResponse } from '../../helper/serverResponse.js'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     //const uploadPath = path.join(__dirname, '../uploads')
//     const uploadPath = './uploads'
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath)
//     }
//     cb(null, uploadPath)
//   },
//   filename: async (req, file, cb) => {
//     try {
//       const id = Math.floor(Math.random() * 900000) + 1000
//       const ext = path.extname(file.originalname)
//       const filename = `doc__${id}${ext}`
//       cb(null, filename)
//     } catch (error) {
//       cb(error)
//     }
//   }
// })

// const fileFilter = (req, file, cb) => {
//   const allowedExtensions = ['.png', '.jpeg', '.jpg']
//   const ext = path.extname(file.originalname).toLowerCase()
//   if (allowedExtensions.includes(ext)) {
//     cb(null, true)
//   } else {
//     cb(new Error(`File ${file.originalname} has an invalid extension.`), false) // Reject file
//   }
// }

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter
// }).array('docimages', 5)

// const uploadRouter = Router()

// uploadRouter.post('/:id', (req, res) => {
//   upload(req, res, async err => {
//     try {
//       if (err) {
//         return errorResponse(res, 400, err.message || 'Upload error')
//       }

//       // if (!req.files || req.files.length === 0) {
//       //   return errorResponse(res, 400, 'No files were uploaded.')
//       // }

//       const userId = req.params.id.trim()

//       if (!mongoose.Types.ObjectId.isValid(userId)) {
//         return errorResponse(res, 400, 'Invalid order ID')
//       }

//       const allowedExtensions = ['.png', '.jpeg', '.jpg']

//       const docimages = []
//       const errors = []

//       req.files.forEach(file => {
//         const ext = path.extname(file.originalname).toLowerCase()

//         if (allowedExtensions.includes(ext)) {
//           docimages.push(file.filename)
//         } else {
//           errors.push(`File ${file.originalname} has an invalid extension.`)
//         }
//       })

//       if (errors.length > 0) {
//         errors.forEach(error => {
//           errorResponse(res, 400, error)
//         })
//         return
//       }

//       const product = await profileModel.findByIdAndUpdate(
//         userId,
//         { $push: { docimages: { $each: docimages } } },
//         { new: true }
//       )

//       if (!product) {
//         return errorResponse(res, 404, `Order with ID ${userId} not found`)
//       }

//       successResponse(res, 'docimages successfully uploaded', product)
//     } catch (error) {
//       console.error('Error:', error)

//       if (error.message && error.message.includes('server is disconnect')) {
//         return errorResponse(res, 503, 'Server disconnected during operation')
//       }

//       return errorResponse(res, 500, 'Internal server error')
//     }
//   })
// })
// export default uploadRouter
