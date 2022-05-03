const adminsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const decode = require('../../../utils/decodeToken')
const AdminUser = require('../../models/Users/admin-user')
const Admin = require('../../models/Admin/admin')


// Admin Sign-up
adminsRouter.post('/sign-up', async (request, response) => {
  const body = request.body
  const decodedToken = decode.decodeToken(request)

  const aUser = await AdminUser.findById(decodedToken.id)
  if (!aUser) {
    return response.status(401).json({
        error: 'Unauthorized user.'
      })
  } 

  const person = new Admin({
    firstName: body.firstName,
    lastName: body.lastName,
    middleName: body.middleName,
    suffix: body.suffix,
    gender: body.gender,
    birthDate: body.birthDate,
    contactNumber: body.contactNumber,
    email: body.email,
    accountId: user._id
  })

  try {
    const savedPerson = await person.save()
      response.status(201).json(savedPerson)
  } catch (error) {
      return response.status(401).json({
        error: 'Failed to create .'
    })
  }
})


// Update admin profile
adminsRouter.put('/:id/update-profile', async (request, response) => {
  const body = request.body
  const decodedToken = decode.decodeToken(request)

  const aUser = await AdminUser.findById(decodedToken.id)
  const i = await Admin.findById(request.params.id)
  if (!aUser) {
    return response.status(401).json({
        error: 'Unauthorized user.'
    })
  } else if (aUser) {
      if (i?.accountId.toString() !==  aUser._id.toString()) {
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
  }
  try {
    const updatedProfile = await Admin.findByIdAndUpdate(request.params.id, person, { new: true })
      response.status(201).json(updatedProfile)
  } catch (error) {
      return response.status(401).json({
      error: 'Failed to update admin profile.'
    })
   }
})

module.exports = adminsRouter