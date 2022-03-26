const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const usersEstablishmentRouter = require('express').Router()
const EstablishmentUser = require('../../models/Users/establishment-user')

// Get all establishment users
usersEstablishmentRouter.get('/', async (request, response) => {
    const users = await EstablishmentUser
      .find({})
      .populate('establishment',{
        name: 1,
        type: 1, 
        level: 1, 
        mobileNumber: 1
      })

    response.json(users)
})

// Establishment Sign-up
usersEstablishmentRouter.post('/sign-up', async (request, response) => {
  const { username, password } = request.body

  const existingUser = await EstablishmentUser.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: 'Username must be unique.'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new EstablishmentUser({
    username,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

// Establishment Log-in
usersEstablishmentRouter.post('/log-in', async (request, response) => {
  const body = request.body

  const user = await EstablishmentUser.findOne({username: body.username})
  const passwordCorrect = user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash)

  if (!user) {
      return response.status(401).json({error: 'invalid username'})
  }

  if (!passwordCorrect) {
    return response.status(401).json({error: 'invalid password'})
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

module.exports = usersEstablishmentRouter