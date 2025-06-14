import express from 'express'
import config from './config.js'
import dbConnect from './db.js'
import morgan from 'morgan'
import cors from 'cors'
import authRouter from './router/authRouter.js'
import {
  Admin,
  authMiddleware,
  isAdminMiddleware
} from './helper/helperFunction.js'
import adminRouter from './router/adminRouter/adminRouter.js'
import userRouter from './router/userRouter/userRouter.js'

const app = express()
const port = config.PORT
const prod = config.DEVPROD === 'prod'

app.set('trust proxy', true)

morgan.token('remote-addr', function (req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress
})

morgan.token('url', req => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  return req.originalUrl
})

app.use(
  morgan(
    ':remote-addr :method :url :status :res[content-length] - :response-time ms'
  )
)

//middleware
app.use(express.json())

if (!prod) {
  app.use(cors())
}

// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON input' })
  }
  next(err)
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

//routes api
app.use('/api/uploads/', express.static('./uploads'))
app.use('/api/auth', authRouter)
app.use('/api/admin', authMiddleware, isAdminMiddleware, adminRouter)
app.use('/api/user', authMiddleware, userRouter)

if (prod) {
  app.use('/', express.static(config.FRONTEND_PATH))
  app.get('/*', (req, res) => {
    res.sendFile('index.html', { root: config.FRONTEND_PATH })
  })
  console.log('staring production server')
} else {
  console.log('running development server')
}

app.use('*', (req, res) => {
  res.status(404).json({
    message: 'not found'
  })
})

dbConnect()
  .then(() => {
    app.listen(port, () => {
      Admin()
      console.log(`server is listening at ${port}`)
    })
  })
  .catch(error => {
    console.log('error connecting server', error)
  })
