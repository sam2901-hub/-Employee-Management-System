import { Router } from 'express'
import userTaskRouter from './userTaskRouter.js'
import userLeaveRouter from './leaveRouter.js'
import userProfileRouter from './userProfileRouter.js'
import usercommentRouter from './userCommentRouter.js'
import attendanceRouter from './userAttendanceRouter.js'

const userRouter = Router()

userRouter.use('/profile', userProfileRouter)
userRouter.use('/task', userTaskRouter)
userRouter.use('/comment', usercommentRouter)
userRouter.use('/leave', userLeaveRouter)
userRouter.use('/attendance', attendanceRouter)

export default userRouter
