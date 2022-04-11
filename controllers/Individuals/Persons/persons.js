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

  const aUser = await AdminUser.findById(decodedToken.id)
  if (!aUser) {
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
    return response.status(400).json({
      error: 'Failed to retrieve profiles'
    })
  }
})


// Get own profile
personsRouter.get('/:id', async (request, response) => {
  const decodedToken = decode.decodeToken(request)

  const iUser = await IndividualUser.findById(decodedToken.id)
  const aUser = await AdminUser.findById(decodedToken.id)
  const i = await Individual.findById(request.params.id)
  if (!iUser && !aUser) {
    return response.status(401).json({
        error: 'Unauthorized user.'
    })
  } else if (iUser) {
      if (i.accountId.toString() !== iUser._id.toString()) {
        return response.status(401).json({
          error: 'Unauthorized individual user.'
        })
      }
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
    return response.status(400).json({
      error: 'Failed to retrieve profile'
    })
  }
})

// Profile Sign-up
personsRouter.post('/sign-up', async (request, response) => {
  const body = request.body
  const decodedToken = decode.decodeToken(request)

  const aUser = await AdminUser.findById(decodedToken.id)
  if (!aUser) {
    return response.status(401).json({
        error: 'Unauthorized user.'
      })
  } 

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
  const decodedToken = decode.decodeToken(request)

  const iUser = await IndividualUser.findById(decodedToken.id)
  const aUser = await AdminUser.findById(decodedToken.id)
  const i = await Individual.findById(request.params.id)
  if (!iUser && !aUser) {
    return response.status(401).json({
        error: 'Unauthorized user.'
    })
  } else if (iUser) {
      if (i?.accountId.toString() !== iUser._id.toString()) {
        return response.status(401).json({
          error: 'Unauthorized individual user.'
        })
      }
  }

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
  try {
    const updatedProfile = await Individual.findByIdAndUpdate(request.params.id, person, { new: true })
      response.status(201).json(updatedProfile)
  } catch (error) {
      return response.status(401).json({
      error: 'Failed to update individual profile.'
    })
   }
})

  module.exports = personsRouter