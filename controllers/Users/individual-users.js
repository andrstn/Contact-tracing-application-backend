const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const usersIndividualRouter = require('express').Router()
const IndividualUser = require('../../models/Users/individual-user')
const EstablishmentUser = require('../../models/Users/establishment-user')

// Get all individual users
usersIndividualRouter.get('/', async (request, response) => {
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
    return response.status(401).json({
      error: 'Failed to retrieve individual user.'
    })
   }
 })

 // Individual Sign-up
  usersIndividualRouter.post('/sign-up', async (request, response) => {
  const { username, password } = request.body

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
    return response.status(401).json({
      error: 'Failed to create user.'
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

  await IndividualUser.findByIdAndUpdate(request.params.id, updateUser, { new: true })
  response.status(201).json({
    message: 'Username updated.'
  })

})

// Update password
usersIndividualRouter.put('/:id/change-password', async (request, response) => {
  const { username, oldPassword, newPassword } = request.body

  const user = await IndividualUser.findOne({username: username})
  const oldPasswordCorrect = user === null
      ? false
      : await bcrypt.compare(oldPassword, user.passwordHash)

  if (!oldPasswordCorrect) {
    return response.status(401).json({error: 'Invalid old password.'})
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(newPassword, saltRounds)

  const updateUser = {
    username: username,
    passwordHash: passwordHash
  }

  await IndividualUser.findByIdAndUpdate(request.params.id, updateUser, { new: true })
  response.status(201).json({
    message: 'Password updated.'
  })
})

module.exports = usersIndividualRouter