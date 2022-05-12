const establishmentsRouter = require('express').Router()
const Establishment = require('../../models/Establishments/establishment')
const jwt = require('jsonwebtoken')
const EstablishmentUser = require('../../models/Users/establishment-user')
const IndividualUser = require('../../models/Users/individual-user')
const TransactionLevelOne = require('../../models/Transactions/transaction-level-1')
const TransactionLevelTwo = require('../../models/Transactions/transaction-level-2')
const TransactionLevelThree = require('../../models/Transactions/transaction-level-3')
const Individual = require('../../models/Individuals/individual')
const decode = require('../../utils/decodeToken')
const AdminUser = require('../../models/Users/admin-user')
const PreEstablishment = require('../../models/Pre-registered/pre-establishment')
const { sendTextMessage } = require('../../utils/sms')


// Admin displays all establishments
establishmentsRouter.get('/', async (request, response) => {
  const decodedToken = decode.decodeToken(request)

  const user = await AdminUser.findById(decodedToken.id)
  if (!user) {
    return response.status(401).json({
        error: 'Unauthorized user.'
      })
  }

  try {
   const initialEstablishment = await Establishment
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
    .populate({
      path: 'transactionLevelOne',
      select: {
        date: 1,
        status: 1,
        login: 1,
        logout: 1
      },
      model: TransactionLevelOne,
      populate: {
        path: 'person',
        select:{
          firstName: 1,
          lastName: 1
        },
        model: Individual
      }
    })
    .populate({
      path: 'transactionLevelTwo',
      select: {
        date: 1,
        status: 1,
        login: 1,
        logout: 1
      },
      model: TransactionLevelTwo,
      populate: {
        path: 'person',
        select:{
          firstName: 1,
          lastName: 1
        },
        model: Individual
      }
    })
    .populate({
      path: 'transactionLevelThree',
      select: {
        date: 1,
        status: 1,
        login: 1,
        logout: 1
      },
      model: TransactionLevelThree,
      populate: {
        path: 'person',
        select:{
          firstName: 1,
          lastName: 1
        },
        model: Individual
      }
    })
    const establishment = initialEstablishment.map(establishment => {
      const transactions = establishment.transactionLevelOne.concat(
        establishment.transactionLevelTwo.concat(establishment.transactionLevelThree)
      )
      return ({
        id: establishment.id,
        accountId: establishment.accountId,
        name: establishment.name,
        type: establishment.type,
        level: establishment.level,
        mobileNumber: establishment.mobileNumber,
        province: establishment.province,
        city: establishment.city,
        barangay: establishment.barangay,
        street: establishment.street,
        transactions: transactions
      })
    })

    response.json(establishment)
  } catch (error) {
      return response.status(401).json({
      error: 'Failed to retrieve establishments.'
    })
   }
 })

 // Get own establishment data
establishmentsRouter.get('/:id', async (request, response) => {
  const decodedToken = decode.decodeToken(request)

  const eUser = await EstablishmentUser.findById(decodedToken.id)
  const aUser = await AdminUser.findById(decodedToken.id)
  const e = await Establishment.findById(request.params.id)
  if (!eUser && !aUser) {
    return response.status(401).json({
        error: 'Unauthorized user.'
    })
  } else if (eUser) {
      if (e.accountId.toString() !== eUser._id.toString()) {
        return response.status(401).json({
          error: 'Unauthorized establishment user.'
        })
      }
  }

  try {
   const establishment = await Establishment
    .findById(request.params.id)
    .populate('accountId','', EstablishmentUser)
    .populate({
      path: 'transactionLevelOne',
      select: {
        date: 1,
        status: 1,
        login: 1,
        logout: 1
      },
      model: TransactionLevelOne,
      populate: {
        path: 'person',
        select:{
          firstName: 1,
          lastName: 1
        },
        model: Individual
      }
    })
    .populate({
      path: 'transactionLevelTwo',
      select: {
        date: 1,
        status: 1,
        login: 1,
        logout: 1
      },
      model: TransactionLevelTwo,
      populate: {
        path: 'person',
        select:{
          firstName: 1,
          lastName: 1
        },
        model: Individual
      }
    })
    .populate({
      path: 'transactionLevelThree',
      select: {
        date: 1,
        status: 1,
        login: 1,
        logout: 1
      },
      model: TransactionLevelThree,
      populate: {
        path: 'person',
        select:{
          firstName: 1,
          lastName: 1
        },
        model: Individual
      }
    })
    
      const transactions = establishment.transactionLevelOne.concat(
        establishment.transactionLevelTwo.concat(establishment.transactionLevelThree)
      )

      response.json({
        id: establishment.id,
        accountId: establishment.accountId,
        name: establishment.name,
        type: establishment.type,
        level: establishment.level,
        mobileNumber: establishment.mobileNumber,
        province: establishment.province,
        city: establishment.city,
        barangay: establishment.barangay,
        street: establishment.street,
        transactions: transactions
    })
  } catch (error) {
      return response.status(401).json({
      error: 'Failed to retrieve establishment.'
    })
   }
 })

// Establishment Sign-up
establishmentsRouter.post('/sign-up/:id', async (request, response) => {
  const pre = await PreEstablishment.findById(request.params.id)
  const decodedToken = decode.decodeToken(request)
  const { level } = request.body

  const aUser = await AdminUser.findById(decodedToken.id)
  if (!aUser) {
    return response.status(401).json({
        error: 'Unauthorized user.'
    })
  }

  const user = new EstablishmentUser({
    username: pre.username,
    passwordHash: pre.passwordHash,
  })

  try {
    const savedUser = await user.save()
    try {
      let newEstablishment = []

      if (pre.type === 'School') {
        newEstablishment = new Establishment({
          accountId: savedUser.id,
          name: pre.name,
          type: pre.type,
          level: level,
          mobileNumber: pre.mobileNumber,
          hotlineNumber: pre.hotlineNumber,
          barangay: pre.barangay,
          province: pre.province,
          city: pre.city,
          street: pre.street,
          transactionLevelOne: [],  
          transactionLevelTwo: [],
          transactionLevelThree: [],
          rooms: [],
          teachers: [],
        })
      } else {
        newEstablishment = new Establishment({
          accountId: savedUser.id,
          name: pre.name,
          type: pre.type,
          level: level,
          mobileNumber: pre.mobileNumber,
          hotlineNumber: pre.hotlineNumber,
          barangay: pre.barangay,
          province: pre.province,
          city: pre.city,
          street: pre.street,
          transactionLevelOne: [],
          transactionLevelTwo: [],
          transactionLevelThree: [],
          // rooms: [],
          // teachers: [],
        })
      }
        const savednewEstablishment = await newEstablishment.save()
        await PreEstablishment.findByIdAndDelete(request.params.id)
        const messages = `Hey ${savednewEstablishment.name}, this account is verified!.This establishment is labeled as Level ${savednewEstablishment.level} `
        const number = savednewEstablishment.mobileNumber
        sendTextMessage(messages, number)
    return response.status(201).json(savednewEstablishment)
    } catch (error) {
      return response.status(400).json({
        error: `Failed to create user. ${error}`
      })
    }
  } catch (error) {
    return response.status(400).json({
      error: 'Failed to saved.'
    }) 
  }
})

  // Update establishment
establishmentsRouter.put('/:id/update-establishment', async (request, response) => {
  const body = request.body
  const decodedToken = decode.decodeToken(request)

  const eUser = await EstablishmentUser.findById(decodedToken.id)
  const aUser = await AdminUser.findById(decodedToken.id)
  const e = await Establishment.findById(request.params.id)
  if (!eUser && !aUser) {
    return response.status(401).json({
        error: 'Unauthorized user.'
    })
  } else if (eUser) {
      if (e?.accountId.toString() !== eUser._id.toString()) {
        return response.status(401).json({
          error: 'Unauthorized establishment user.'
        })
      }
  }

  const establishment = {
    name: body.name,
    type: body.type,
    level: body.level,
    mobileNumber: body.mobileNumber,
    hotlineNumber: body.hotlineNumber,
    barangay: body.barangay,
    province: body.province,
    city: body.city,
    street: body.street
  }
  try {
    const updatedProfile = await Establishment.findByIdAndUpdate(request.params.id, establishment, { new: true })
      response.status(201).json(updatedProfile)
  } catch (error) {
      return response.status(401).json({
       error: 'Failed to update establishment profile.'
     })
  }
})

  
  module.exports = establishmentsRouter