const personsRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const decode = require('../../../utils/decodeToken')
const Individual = require('../../../models/Individuals/individual')
const IndividualUser = require('../../../models/Users/individual-user')
const TransactionLevelOne = require('../../../models/Transactions/transaction-level-1')
const TransactionLevelTwo = require('../../../models/Transactions/transaction-level-2')
const TransactionLevelThree = require('../../../models/Transactions/transaction-level-3')
const Establishment = require('../../../models/Establishments/establishment')
const AdminUser = require('../../../models/Users/admin-user')
const EstablishmentUser = require('../../../models/Users/establishment-user')
const PreIndividual = require('../../../models/Pre-registered/pre-individual')
const Image = require('../../../models/Images/image')

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
      error: 'Failed to retrieve all persons'
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
      error: 'Failed to retrieve person.'
    })
  }
})

//Profile Sign-up
personsRouter.post('/sign-up/:id', async (request, response) => {
  const pre = await PreIndividual.findById(request.params.id)
  const decodedToken = decode.decodeToken(request)

  const aUser = await AdminUser.findById(decodedToken.id)
  if (!aUser) {
    return response.status(401).json({
        error: 'Unauthorized user.'
      })
  } 

  const user = new IndividualUser({
    username: pre.username,
    passwordHash: pre.passwordHash,
  })

  try {
    const savedUser = await user.save()
    try {
      const person = new Individual({
        accountId: savedUser.id,
        firstName: pre.firstName,
        lastName: pre.lastName,
        middleName: pre.middleName,
        suffix: "asdf",
        gender: pre.gender,
        birthDate: pre.birthDate,
        contactNumber: pre.contactNumber,
        email: pre.email,
        status: 'negative',
        province: pre.province,
        city: pre.city,
        barangay: pre.barangay,
        street: pre.street,
        resident: pre.resident,
        special: false,
        transactionLevelOne: [],
        transactionLevelTwo: [],
        transactionLevelThree: []
      })
         const savedPerson = await person.save()
         await PreIndividual.findByIdAndDelete(request.params.id)
         response.status(201).json(savedPerson)
    } catch (error) {
        return response.status(400).json({
          error: 'Failed to create user.'
       })
     }
       response.status(201).json(savedUser)
  } catch (error) {
      return response.status(400).json({
        error: 'Failed to saved.'
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
      //special: body.special,
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