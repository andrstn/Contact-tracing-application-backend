const personsRouter = require('express').Router()
const Individual = require('../../../models/Individuals/individual')
const jwt = require('jsonwebtoken')
const IndividualUser = require('../../../models/Users/individual-user')
const TransactionLevelOne = require('../../../models/Transactions/transaction-level-1')
const TransactionLevelTwo = require('../../../models/Transactions/transaction-level-2')
const TransactionLevelThree = require('../../../models/Transactions/transaction-level-3')
const Establishment = require('../../../models/Establishments/establishment')
const decode = require('../../../utils/decodeToken')
const AdminUser = require('../../../models/Users/admin-user')

//Admin display all profiles
personsRouter.get('/', async (request, response) => {

  const decodedToken = decode.decodeToken(request)

  const user = await AdminUser.findById(decodedToken.id)
  if (!user) {
    return response.status(401).json({
        error: 'Unauthorized user.'
      })
  }

  try {
    const initialPersons = await Individual
      .find({})
      .populate({
        path: 'transactionLevelOne',
        select: {
          establishment: 1,
          date: 1,
          status: 1,
          login: 1,
          logout: 1
        },
        model: TransactionLevelOne,
        populate: {
          path: 'establishment',
          select:{
            name: 1,
            level: 1
          },
          model: Establishment
        }
      })
      .populate({
        path: 'transactionLevelTwo',
        select: {
          establishment: 1,
          date: 1,
          status: 1,
          login: 1,
          logout: 1
        },
        model: TransactionLevelTwo,
        populate: {
          path: 'establishment',
          select:{
            name: 1,
            level: 1
          },
          model: Establishment
        }
      })
      .populate({
        path: 'transactionLevelThree',
        select: {
          establishment: 1,
          date: 1,
          status: 1,
          login: 1,
          logout: 1
        },
        model: TransactionLevelThree,
        populate: {
          path: 'establishment',
          select:{
            name: 1,
            level: 1
          },
          model: Establishment
        }
      })

    const persons = initialPersons.map(person => {
      const transactions = person.transactionLevelOne.concat(
        person.transactionLevelTwo.concat(person.transactionLevelThree)
      )
      return ({
        id: person.id,
        accountId: person.accountId,
        firstName: person.firstName,
        lastName: person.lastName,
        middleName: person.middleName,
        suffix: person.suffix,
        gender: person.gender,
        birthDate: person.birthDate,
        contactNumber: person.contactNumber,
        email: person.email,
        status: person.status,
        province: person.province,
        city: person.city,
        barangay: person.barangay,
        street: person.street,
        resident: person.resident,
        special: person.special,
        transactions: transactions
      })
    })
    response.json(persons)
  } catch (error) {
    return response.status(401).json({
      error: 'Failed to retrieve profiles'
    })
  }
})

// Admin collects specific profile
personsRouter.get('/:id', async (request, response) => {

  const decodedToken = decode.decodeToken(request)

  const user = await AdminUser.findById(decodedToken.id)
  if (!user) {
    return response.status(401).json({
        error: 'Unauthorized user.'
      })
  }
  
  try {
    const person = await Individual
      .findOne({_id: request.params.id})
      .populate({
        path: 'transactionLevelOne',
        select: {
          establishment: 1,
          date: 1,
          status: 1,
          login: 1,
          logout: 1
        },
        model: TransactionLevelOne,
        populate: {
          path: 'establishment',
          select:{
            name: 1,
            level: 1
          },
          model: Establishment
        }
      })
      .populate({
        path: 'transactionLevelTwo',
        select: {
          establishment: 1,
          date: 1,
          status: 1,
          login: 1,
          logout: 1
        },
        model: TransactionLevelTwo,
        populate: {
          path: 'establishment',
          select:{
            name: 1,
            level: 1
          },
          model: Establishment
        }
      })
      .populate({
        path: 'transactionLevelThree',
        select: {
          establishment: 1,
          date: 1,
          status: 1,
          login: 1,
          logout: 1
        },
        model: TransactionLevelThree,
        populate: {
          path: 'establishment',
          select:{
            name: 1,
            level: 1
          },
          model: Establishment
        }
      })
    
    const transactions = person.transactionLevelOne.concat(
      person.transactionLevelTwo.concat(person.transactionLevelThree)
    )
    
    response.json({
      id: person.id,
      accountId: person.accountId,
      firstName: person.firstName,
      lastName: person.lastName,
      middleName: person.middleName,
      suffix: person.suffix,
      gender: person.gender,
      birthDate: person.birthDate,
      contactNumber: person.contactNumber,
      email: person.email,
      status: person.status,
      province: person.province,
      city: person.city,
      barangay: person.barangay,
      street: person.street,
      resident: person.resident,
      special: person.special,
      transactions: transactions
    })
  } catch (error) {
    return response.status(401).json({
      error: 'Failed to retrieve profile'
    })
  }
})

// Get own profile
personsRouter.get('/:id', async (request, response) => {

  const {personId} = request.body
  const decodedToken = decode.decodeToken(request)

  const user = await AdminUser.findById(decodedToken.id)
  if (!user) {
    return response.status(401).json({
        error: 'Unauthorized user.'
      })
  }

  const person = await Individual.findById(personId)
  if (!person) {
      return response.status(401).json({
          message: 'Invalid individual ID.'
      })
  }

  try {
    const person = await Individual
      .findOne({_id: request.params.id})
      .populate({
        path: 'transactionLevelOne',
        select: {
          establishment: 1,
          date: 1,
          status: 1,
          login: 1,
          logout: 1
        },
        model: TransactionLevelOne,
        populate: {
          path: 'establishment',
          select:{
            name: 1,
            level: 1
          },
          model: Establishment
        }
      })
      .populate({
        path: 'transactionLevelTwo',
        select: {
          establishment: 1,
          date: 1,
          status: 1,
          login: 1,
          logout: 1
        },
        model: TransactionLevelTwo,
        populate: {
          path: 'establishment',
          select:{
            name: 1,
            level: 1
          },
          model: Establishment
        }
      })
      .populate({
        path: 'transactionLevelThree',
        select: {
          establishment: 1,
          date: 1,
          status: 1,
          login: 1,
          logout: 1
        },
        model: TransactionLevelThree,
        populate: {
          path: 'establishment',
          select:{
            name: 1,
            level: 1
          },
          model: Establishment
        }
      })
    
    const transactions = person.transactionLevelOne.concat(
      person.transactionLevelTwo.concat(person.transactionLevelThree)
    )
    
    response.json({
      id: person.id,
      accountId: person.accountId,
      firstName: person.firstName,
      lastName: person.lastName,
      middleName: person.middleName,
      suffix: person.suffix,
      gender: person.gender,
      birthDate: person.birthDate,
      contactNumber: person.contactNumber,
      email: person.email,
      status: person.status,
      province: person.province,
      city: person.city,
      barangay: person.barangay,
      street: person.street,
      resident: person.resident,
      special: person.special,
      transactions: transactions
    })
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