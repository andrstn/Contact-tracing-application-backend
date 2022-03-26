const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const usersAdminRouter = require('express').Router()
const AdminUser = require('../../models/Users/admin-user')


// Admin Sign-up
usersAdminRouter.post('/sign-up', async (request, response) => {
  const { username, password } = request.body

  const existingUser = await AdminUser.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: 'Username must be unique'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new AdminUser({
    username,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

// Admin Log-in
usersAdminRouter.post('/log-in', async (request, response) => {
  const body = request.body

  const user = await AdminUser.findOne({username: body.username})
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

module.exports = usersAdminRouter