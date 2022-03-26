const mongoose = require('mongoose')
const { userConnection } = require('../../utils/connection')

const individualUserSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Individual'
  }
})

individualUserSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const IndividualUser = userConnection.model('IndividualUser', individualUserSchema)

module.exports = IndividualUser