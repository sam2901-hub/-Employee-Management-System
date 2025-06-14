import { Router } from 'express'
import adminTaskRouter from './adminTaskRouter.js'
import adminUserRouter from './adminuserRouter.js'
import adminLeaveRouter from './adminLeaveRouter.js'
import compProfileRouter from './compProfileRouter.js'

const adminRouter = Router()

adminRouter.use('/user', adminUserRouter)
adminRouter.use('/task', adminTaskRouter)
adminRouter.use('/leave', adminLeaveRouter)
adminRouter.use('/compprofile', compProfileRouter)

export default adminRouter
