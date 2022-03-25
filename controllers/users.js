const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const AdminUser = require('../models/Users/admin-users')

usersRouter.post('/', async (request, response) => {
  const body = request.body

  if(body.password.length < 3) {
      return response.status(400).json({error: 'password length is shorter than 3'})
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new AdminUser({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

usersRouter.get('/', async (request, response) => {
    const users = await AdminUser.find({})
    response.json(users)
})

module.exports = usersRouter