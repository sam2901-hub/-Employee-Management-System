import 'dotenv/config'

const config = {
  DEVPROD: process.env.DEVPROD || 'prod',
  PORT: process.env.PORT,
  FRONTEND_PATH: process.env.FRONTEND_PATH,
  MONGO_URL: process.env.MONGO_URL,
  EMAIL_APIKEY: process.env.EMAIL_APIKEY
}

export default config
