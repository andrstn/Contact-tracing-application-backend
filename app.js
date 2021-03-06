const config = require('./utils/config')
const connections = require('./utils/connection')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const sms = require('./utils/sms')
const autoUntag = require('./controllers/Scheduled/auto-untag')
const transactionDelete = require('./controllers/Scheduled/transaction-delete')
const floatingTransaction = require('./controllers/Scheduled/logout')

// const GridFs = require('./utils/gridFs')
// const {GridFsStorage} = require('multer-gridfs-storage')
// const multer = require('multer')
// const Grid = require('gridfs-stream')




// Import Routers
const usersRouter = require('./controllers/Users/users')
const usersAdminRouter = require('./controllers/Users/admin-users')
const usersEstablishmentRouter = require('./controllers/Users/establishment-users')
const usersIndividualRouter = require('./controllers/Users/individual-users')
const loginTransactionRouter = require('./controllers/Transactions/add-transaction')
const logoutTransactionRouter = require('./controllers/Transactions/logout-transaction')
const personsRouter = require('./controllers/Individuals/Persons/persons')
const establishmentsRouter = require('./controllers/Establishments/establishments')
const prePersonRouter = require('./controllers/Pre-registered/pre-individuals')
const preEstablishmentRouter = require('./controllers/Pre-registered/pre-establishments')
const schoolEstablishmentRouter = require('./controllers/Establishments/school')
const adminsRouter = require('./controllers/Admins/admins')
const tagRouter = require('./controllers/Admins/tag')
const untagRouter = require('./controllers/Admins/untag')


morgan.token('body', (request, response) => {
    return JSON.stringify(request.body) 
})  

app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use('/api/users', usersRouter)
app.use('/api/admin-users', usersAdminRouter)
app.use('/api/establishment-users', usersEstablishmentRouter)
app.use('/api/individual-users', usersIndividualRouter)
app.use('/api/admins', adminsRouter)


// Transactions Router
app.use('/api/transactions/login', loginTransactionRouter)
app.use('/api/transactions/logout', logoutTransactionRouter)

// Persons Router
app.use('/api/persons', personsRouter)

// Establishments Router
app.use('/api/establishments', establishmentsRouter)

// Pre-register Router
app.use('/api/pre-register/persons', prePersonRouter)
app.use('/api/pre-register/establishments', preEstablishmentRouter)

// School Establishments Router
app.use('/api/establishments/school', schoolEstablishmentRouter)

// Tag Router
app.use('/api/tag/positive', tagRouter)
app.use('/api/tag/negative', untagRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
