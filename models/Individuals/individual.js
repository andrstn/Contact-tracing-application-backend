const mongoose = require('mongoose')
const { individualConnection } = require('../../utils/connection')

const individualSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  suffix: String,
  middleName: String,
  gender: String,
  birthDate: String,
  contactNumber: String,
  email: String,
  province: String,
  city: String,
  barangay: String,
  resident: Boolean,
  street: String
})

individualSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Individual = individualConnection.model('Individual', individualSchema)

module.exports = Individual