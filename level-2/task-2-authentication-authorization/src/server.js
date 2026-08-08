import 'dotenv/config'
import app from './app.js'

const port = process.env.PORT || 3000

const server = app.listen(port, () => {
  console.log(`Authentication API listening on port ${port}`)
})

export default server
