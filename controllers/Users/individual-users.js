const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const usersIndividualRouter = require('express').Router()
const IndividualUser = require('../../models/Users/individual-user')
const EstablishmentUser = require('../../models/Users/establishment-user')
const AdminUser = require('../../models/Users/admin-user')
const decode = require('../../utils/decodeToken')

// Get all individual users
usersIndividualRouter.get('/', async (request, response) => {
  const decodedToken = decode.decodeToken(request)

  const aUser = await AdminUser.findById(decodedToken.id)
  if (!aUser) {
    return response.status(401).json({
      error: 'Unauthorized user.'
    })
  }

  try {
    const users = await IndividualUser
     .find({})
     .populate('person',{ 
       firstName: 1,
       middleName:1,
       lastName: 1,
       contactNumber: 1,
       status: 1,
     })
    response.json(users)
  } catch (error) {
    return response.status(400).json({
      error: 'Failed to retrieve individual users.'
    })
   }
 })

 // Individual Sign-up
usersIndividualRouter.post('/sign-up', async (request, response) => {
  const { username, password } = request.body

  const decodedToken = decode.decodeToken(request)

  const aUser = await AdminUser.findById(decodedToken.id)
  if (!aUser) {
    return response.status(401).json({
      error: 'Unauthorized user.'
    })
  }

  const existingEstablishmentUser = await EstablishmentUser.findOne({ username })
  if (existingEstablishmentUser) {
    return response.status(400).json({
      error: 'Username must be unique.'
    })
  }

  const existingIndividualUser = await IndividualUser.findOne({ username })
  if (existingIndividualUser) {
    return response.status(400).json({
      error: 'Username must be unique.'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new IndividualUser({
    username,
    passwordHash,
  })

  try {
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    return response.status(400).json({
      error: `Failed to create user.`
    })
  }
})

// Individual Log-in
usersIndividualRouter.post('/log-in', async (request, response) => {
  const body = request.body

  const user = await IndividualUser.findOne({username: body.username})
  const passwordCorrect = user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash)

  if (!user) {
      return response.status(401).json({error: 'Invalid username.'})
  }

  if (!passwordCorrect) {
    return response.status(401).json({error: 'Invalid password.'})
  }

  const userForToken = {
      username: user.username,
      id: user._id
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  response.status(200).send({
      token,
      username: user.username,
      id: user._id
  })
})

// Update username
usersIndividualRouter.put('/:id/change-username', async (request, response) => {
  const { username } = request.body

  const decodedToken = decode.decodeToken(request)

  const iUser = await IndividualUser.findById(decodedToken.id)
  const i = await IndividualUser.findById(request.params.id)
  if (!iUser) {
    return response.status(401).json({
      error: 'Unauthorized user.'
    })
  } else if (iUser) {
    if (i?._id.toString() !== iUser._id.toString()) {
      return response.status(401).json({
        error: 'Unauthorized individual user.'
      })
    }
  }
  
  const updateUser = {
    username: username
  }

  const existingIndividualUser = await IndividualUser.findOne({ username })
  if (existingIndividualUser) {
    return response.status(400).json({
      error: 'Username must be unique.'
    })
  }

  const existingEstablishmentUser = await EstablishmentUser.findOne({ username })
  if (existingEstablishmentUser) {
    return response.status(400).json({
      error: 'Username must be unique.'
    })
  }

  try {
    await IndividualUser.findByIdAndUpdate(request.params.id, updateUser, { new: true })
    response.status(200).json({
      message: 'Username updated.'
    })
  } catch (error) {
    return response.status(400).json({
      error: 'Failed to update username.'
    })
  }
})

// Update password
usersIndividualRouter.put('/:id/change-password', async (request, response) => {
  const { username, oldPassword, newPassword } = request.body

  const decodedToken = decode.decodeToken(request)

  const iUser = await IndividualUser.findById(decodedToken.id)
  const i = await IndividualUser.findById(request.params.id)
  if (!iUser) {
    return response.status(401).json({
      error: 'Unauthorized user.'
    })
  } else if (iUser) {
    if (i?._id.toString() !== iUser._id.toString()) {
      return response.status(401).json({
        error: 'Unauthorized individual user.'
      })
    }
  }

  const user = await IndividualUser.findOne({username: username})
  const oldPasswordCorrect = user === null
      ? false
      : await bcrypt.compare(oldPassword, user.passwordHash)

  if (!oldPasswordCorrect) {
    return response.status(400).json({error: 'Invalid old password.'})
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(newPassword, saltRounds)

  const updateUser = {
    username: username,
    passwordHash: passwordHash
  }

  try {
    await IndividualUser.findByIdAndUpdate(request.params.id, updateUser, { new: true })
    response.status(200).json({
      message: 'Password updated.'
    })
  } catch (error) {
    return response.status(400).json({
      error: 'Failed to update password.'
    })
  }
})

module.exports = usersIndividualRouter