const bcrypt = require('bcrypt')
const individualUsersRouter = require('express').Router()
const IndividualUser = require('../models/Users/individual-user')

individualUsersRouter.get('/', async (request, response) => {
    // const users = await User.find({})
    const users = await IndividualUser
    .find({}).populate('transactions',{ content: 1, date: 1 })
    response.json(users)
  })

  individualUsersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const existingUser = await IndividualUser.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: 'username must be unique'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new IndividualUser({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = individualUsersRouter