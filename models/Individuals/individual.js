const mongoose = require('mongoose')
const { individualConnection } = require('../../utils/connection')

const individualSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minlength: 2,
    required: true
  },
  lastName: {
    type: String,
    minlength: 2,
    required: true
  },
  suffix: {
    type: String,
    minlength: 2
  },
  middleName: {
    type: String,
    minlength: 2,
    required: true
  },
  gender: {
    type: String,
    minlength: 2,
    required: true
  },
  birthDate: {
    type: String,
    minlength: 2,
    required: true
  },
  contactNumber: {
    type: String,
    minlength: 2,
    required: true
  },
  email: {
    type: String,
    minlength: 2
  },
  status: {
    type: String,
    minlength: 1,
    required: true
  },
  province: {
    type: String,
    minlength: 2,
    required: true
  },
  city: {
    type: String,
    minlength: 2,
    required: true
  },
  barangay: {
    type: String,
    minlength: 2,
    required: true
  },
  resident: {
    type: Boolean,
    required: true
  },
  street: {
    type: String,
    minlength: 2,
    required: true
  }
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