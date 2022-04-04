const personsRouter = require('express').Router()
const Individual = require('../../../models/Individuals/individual')
const jwt = require('jsonwebtoken')
const IndividualUser = require('../../../models/Users/individual-user')
const TransactionLevelOne = require('../../../models/Transactions/transaction-level-1')
const TransactionLevelTwo = require('../../../models/Transactions/transaction-level-2')
const TransactionLevelThree = require('../../../models/Transactions/transaction-level-3')
const Establishment = require('../../../models/Establishments/establishment')

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      return authorization.substring(7)
    }
    return null
  }

// Get all profiles
personsRouter.get('/', async (request, response) => {
  try {
    const persons = await Individual
      .find({})
      .populate('transactionLevelOne','date', TransactionLevelOne )
      .populate('transactionLevelTwo','date', TransactionLevelTwo )
      .populate('transactionLevelThree','date', TransactionLevelThree )
    response.json(persons)
  } catch (error) {
    return response.status(401).json({
      error: 'Failed to retrieve profiles'
    })
  }
})

//Gets specific profile
personsRouter.get('/:id', async (request, response) => {
  try {
    const person = await Individual
      .findById(request.params.id)
      .populate('transactionLevelOne', {
        establishment: 1,
        date: 1,
        status: 1,
        login: 1,
        logout: 1
      }, TransactionLevelOne)
      .populate('transactionLevelTwo', {
        establishment: 1,
        date: 1,
        status: 1,
        login: 1,
        logout: 1
      }, TransactionLevelTwo)
      .populate('transactionLevelThree', {
        establishment: 1,
        date: 1,
        status: 1,
        login: 1,
        logout: 1
      }, TransactionLevelThree)
    
    response.json(person)
  } catch (error) {
    return response.status(401).json({
      error: 'Failed to retrieve profile'
    })
  }
})

// Profile Sign-up
personsRouter.post('/sign-up', async (request, response) => {
  const body = request.body
  const token = getTokenFrom(request)

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken) {
    return response.status(401).json({
      error: 'Token missing or invalid.'
    })
  }

  const user = await IndividualUser.findById(decodedToken.id)

  const person = new Individual({
    firstName: body.firstName,
    lastName: body.lastName,
    middleName: body.middleName,
    suffix: body.suffix,
    gender: body.gender,
    birthDate: body.birthDate,
    contactNumber: body.contactNumber,
    email: body.email,
    status: body.status,
    province: body.province,
    city: body.city,
    barangay: body.barangay,
    street: body.street,
    resident: body.resident,
    special: body.special,
    transactionLevelOne: [],
    transactionLevelTwo: [],
    transactionLevelThree: [],
    accountId: user._id
  })

  try {
    const savedPerson = await person.save()
      response.status(201).json(savedPerson)
  } catch (error) {
      return response.status(401).json({
        error: 'Failed to complete profile.'
    })
  }
})

// Update profile
personsRouter.put('/:id/update-profile', async (request, response) => {
  const body = request.body

  const person = {
      firstName: body.firstName,
      lastName: body.lastName,
      middleName: body.middleName,
      suffix: body.suffix,
      gender: body.gender,
      birthDate: body.birthDate,
      contactNumber: body.contactNumber,
      email: body.email,
      status: body.status,
      province: body.province,
      city: body.city,
      barangay: body.barangay,
      street: body.street,
      resident: body.resident,
      special: body.special,
  }

  const updatedProfile = await Individual.findByIdAndUpdate(request.params.id, person, { new: true })
  response.status(201).json(updatedProfile)
})

  module.exports = personsRouter