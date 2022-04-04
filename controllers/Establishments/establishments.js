const establishmentsRouter = require('express').Router()
const Establishment = require('../../models/Establishments/establishment')
const jwt = require('jsonwebtoken')
const EstablishmentUser = require('../../models/Users/establishment-user')
const IndividualUser = require('../../models/Users/individual-user')


const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      return authorization.substring(7)
    }
    return null
  }

// Profile Sign-up
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
  
  module.exports = establishmentsRouter