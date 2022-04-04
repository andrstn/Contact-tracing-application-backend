const establishmentsRouter = require('express').Router()
const Establishment = require('../../models/Establishments/establishment')
const jwt = require('jsonwebtoken')
const EstablishmentUser = require('../../models/Users/establishment-user')
const IndividualUser = require('../../models/Users/individual-user')
const TransactionLevelOne = require('../../models/Transactions/transaction-level-1')
const TransactionLevelTwo = require('../../models/Transactions/transaction-level-2')
const TransactionLevelThree = require('../../models/Transactions/transaction-level-3')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      return authorization.substring(7)
    }
    return null
  }

// Get all estsblishments
establishmentsRouter.get('/', async (request, response) => {
  try {
   const establishment = await Establishment
    .find({},{
      'accountId': 1,
      'name': 1,
      'type': 1,
      'level': 1,
      'mobileNumber': 1,
      'hotlineNubmer': 1,
      'barangay': 1,
      'city': 1,
      'province': 1,
      'street': 1
    })
    // .populate('accountId','', EstablishmentUser) 
    response.json(establishment)
  } catch (error) {
      return response.status(401).json({
      error: 'Failed to retrieve establishments.'
    })
   }
 })

 // Get one establishment
establishmentsRouter.get('/:id', async (request, response) => {
  try {
   const establishment = await Establishment
    .findById(request.params.id)
    .populate('accountId','', EstablishmentUser)
    .populate('transactionLevelOne',{status: 1, date: 1 , login: 1, logout: 1}, TransactionLevelOne )
    .populate('transactionLevelTwo',{status: 1, date: 1 , login: 1, logout: 1}, TransactionLevelTwo )
    .populate('transactionLevelThree',{status: 1, date: 1 , login: 1, logout: 1}, TransactionLevelThree )
    response.json(establishment)
  } catch (error) {
      return response.status(401).json({
      error: 'Failed to retrieve establishments.'
    })
   }
 })

// Establishment Sign-up
establishmentsRouter.post('/sign-up', async (request, response) => {
  const body = request.body
  const token = getTokenFrom(request)
  
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken) {
    return response.status(401).json({
        error: 'Token missing or invalid.'
    })
  }
  const user = await EstablishmentUser.findById(decodedToken.id)

  const establishment = new Establishment({
    name: body.name,
    type: body.type,
    level: body.level,
    mobileNumber: body.mobileNumber,
    hotlineNumber: body.hotlineNumber,
    barangay: body.barangay,
    province: body.province,
    city: body.city,
    street: body.street,
    transactionLevelOne: [],
    transactionLevelTwo: [],
    transactionLevelThree: [],
    accountId: user._id
  })
  try {
      const savedPerson = await establishment.save()
        response.status(201).json(savedPerson)
    } catch (error) {
        return response.status(401).json({
          error: 'Failed to complete profile.'
      })
    }
  })

  // Update establishment
  establishmentsRouter.put('/:id/update-establishment', async (request, response) => {
  const body = request.body

  const establishment = {
    name: body.name,
    type: body.type,//update?
    level: body.level,//update?
    mobileNumber: body.mobileNumber,
    hotlineNumber: body.hotlineNumber,
    barangay: body.barangay,
    province: body.province,
    city: body.city,
    street: body.street,
  }
  try {
    const updatedProfile = await Establishment.findByIdAndUpdate(request.params.id, establishment, { new: true })
      response.status(201).json(updatedProfile)
  } catch (error) {
      return response.status(401).json({
       error: 'Failed to update establishment.'
     })
   }
})

  
  module.exports = establishmentsRouter