require('dotenv').config()

const PORT = process.env.PORT

// let MONGODB_URI = {}

// if (process.env.NODE_ENV === "development") {
//   MONGODB_URI = {
//     user: process.env.MONGODB_USER_URI,
//     transaction: process.env.MONGODB_TRANSACTION_URI
//   }
// } else {
//   MONGODB_URI = process.env.TEST_MONGODB_URI
// }

// const MONGODB_URI = process.env.MONGODB_URI

// const MONGODB_USER_URI = process.env.NODE_ENV === 'test' 
//   ? process.env.TEST_MONGODB_URI
//   : process.env.MONGODB_USER_URI

module.exports = {
  // MONGODB_URI,
  PORT
}