const bcrypt = require('bcrypt')
const usersAdminRouter = require('express').Router()
const AdminUser = require('../models/Users/admin-user')

usersAdminRouter.get('/', async (request, response) => {
    // const users = await User.find({})
    const users = await User
    .find({}).populate('notes',{ content: 1, date: 1 })
    response.json(users)
  })

  usersAdminRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const existingUser = await AdminUser.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: 'username must be unique'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new AdminUser({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersAdminRouter