const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Establishment = require('../../models/Establishments/establishment')
const Individual = require('../../models/Individuals/individual')
const TransactionLevelOne = require('../../models/Transactions/transaction-level-1')
const TransactionLevelTwo = require('../../models/Transactions/transaction-level-2')
const TransactionLevelThree = require('../../models/Transactions/transaction-level-3')
const usersAdminRouter = require('express').Router()
const AdminUser = require('../../models/Users/admin-user')
const EstablishmentUser = require('../../models/Users/establishment-user')
const IndividualUser = require('../../models/Users/individual-user')
const decode = require('../../utils/decodeToken')

// Admin Sign-up
usersAdminRouter.post('/sign-up', async (request, response) => {
  const { username, password } = request.body

  const existingUser = await AdminUser.findOne({ username })
  if (existingUser) {
    return response.status(401).json({
      error: 'Username must be unique.'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new AdminUser({
    username,
    passwordHash,
  })

  try {
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    return response.status(400).json({
      error: 'Failed to create user.'
    })
  }
})

// Admin Log-in
usersAdminRouter.post('/log-in', async (request, response) => {
  const body = request.body

  const user = await AdminUser.findOne({username: body.username})
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
usersAdminRouter.put('/:id/change-username', async (request, response) => {
  const { username } = request.body

  const decodedToken = decode.decodeToken(request)

  const user = await AdminUser.findById(decodedToken.id)
  if (!user) {
    return response.status(401).json({
        error: 'Unauthorized user.'
      })
  }

  if (username.length < 8) {
    return response.status(400).json({
      error: 'Username must be atleast 8 characters.'
    })
  }

  const updateUser = {
    username: username
  }

  const existingUser = await AdminUser.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: 'Username must be unique.'
    })
  }
  try {
    await AdminUser.findByIdAndUpdate(request.params.id, updateUser, { new: true })
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
usersAdminRouter.put('/:id/change-password', async (request, response) => {
  const { username, oldPassword, newPassword } = request.body
  
  const decodedToken = decode.decodeToken(request)

  const aUser = await AdminUser.findById(decodedToken.id)
  if (!aUser) {
    return response.status(401).json({
        error: 'Unauthorized user.'
      })
  }

  const user = await AdminUser.findOne({username: username})
  if (!user) {
    return response.status(401).json({
        error: 'Username not exist.'
      })
  }
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
    await AdminUser.findByIdAndUpdate(request.params.id, updateUser, { new: true })
    response.status(200).json({
      message: 'Password updated.'
    })
  } catch (error) {
    return response.status(400).json({
      error: 'Failed to update user password.'
    })
  }
})

// Delete Individual user
usersAdminRouter.delete('/individual/:id', async (request, response) => {
  const decodedToken = decode.decodeToken(request)

  const admin = await AdminUser.findById(decodedToken.id)
  if (!admin) {
    return response.status(401).json({
      error: 'Unauthorized user for the action.'
    })
  }

  try {
    const deletedIndividual = await IndividualUser.findByIdAndDelete(request.params.id)
    await Individual.findByIdAndDelete(body.personId)

    const transactionOne = await TransactionLevelOne.find({person : body.personId})
    for (let index = 0; index < transactionOne.length; index++) {
        await TransactionLevelOne.findByIdAndDelete(transactionOne[index].id)      
    }

    const transactionTwo = await TransactionLevelTwo.find({person : body.personId})
    for (let index = 0; index < transactionTwo.length; index++) {
        await TransactionLevelTwo.findByIdAndDelete(transactionTwo[index].id)      
    }

    const transactionThree = await TransactionLevelThree.find({person : body.personId})
    for (let index = 0; index < transactionThree.length; index++) {
        await TransactionLevelThree.findByIdAndDelete(transactionThree[index].id)      
    }

  return response.status(200).json({
    message: `${deletedIndividual.username} deleted.`

  })
  } catch (error) {
    return response.status(400).json({
      error: 'Failed to delete.'
    })
  }


})

// Delete Establishment user
usersAdminRouter.delete('/establishment/:id', async (request, response) => {
  const decodedToken = decode.decodeToken(request)

  const admin = await AdminUser.findById(decodedToken.id)
  if (!admin) {
    return response.status(401).json({
      error: 'Unauthorized user for the action.'
    })
  }
  const establishmentDetails = await Establishment.find({accountId: request.params.id})

  try {
    const deletedEstablishment = await EstablishmentUser.findByIdAndDelete(request.params.id)
    if (deletedEstablishment=== establishmentDetails) {
      await establishmentDetails.findByIdAndDelete(request.params.id)
    }
    return response.status(200).json({
      message: `${deletedEstablishment.username} deleted.`
  })
  } catch (error) {
    return response.status(400).json({
      error: 'Failed to delete.'
    })
  }
})

module.exports = usersAdminRouter