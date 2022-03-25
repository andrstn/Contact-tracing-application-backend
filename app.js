const config = require('./utils/config')
const connections = require('./utils/connection')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const usersRouter = require('./controllers/Users/users')
const adminUsersRouter = require('./controllers/Users/admin-users')
const establishmentUsersRouter = require('./controllers/Users/establishment-users')
const individualUsersRouter = require('./controllers/Users/individual-users')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

// logger.info('Connecting to', config.MONGODB_USER_URI)
// logger.info('Connecting to', config.MONGODB_TRANSACTIONS_URI)

// logger.info('Connecting to', 'mongodb+srv://sudowoodo:spelven22@cluster0.2eqnt.mongodb.net/Users?retryWrites=true&w=majority')
// logger.info('Connecting to', 'mongodb+srv://sudowoodo:spelven22@cluster0.2eqnt.mongodb.net/Transactions?retryWrites=true&w=majority')


// logger.info('Connecting to', config.MONGODB_USER_URI)
// mongoose.connect(config.MONGODB_USER_URI)
//     .then(() => {
//         logger.info('Connected to MongoDB')
//     })
//     .catch((error) => {
//         logger.error('error connecting to MongoDB:', error.message)
//     })


morgan.token('body', (request, response) => {
    return JSON.stringify(request.body)
})

app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use('/api/users', usersRouter)
app.use('/api/admin-user', adminUsersRouter)
app.use('/api/establishment-user', establishmentUsersRouter)
app.use('/api/individual-user', individualUsersRouter)

app.use(middleware.requestLogger)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


module.exports = app
