const bcrypt = require('bcrypt')
const usersEstablishmentRouter = require('express').Router()
const EstablishmentUser = require('../models/Users/establishment-user')

usersEstablishmentRouter.get('/', async (request, response) => {
    // const users = await User.find({})
    const users = await User
    .find({}).populate('notes',{ content: 1, date: 1 })
    response.json(users)
  })

  usersEstablishmentRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const existingUser = await EstablishmentUser.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: 'username must be unique'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new EstablishmentUser({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersEstablishmentRouter