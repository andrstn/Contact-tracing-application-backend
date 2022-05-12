const mongoose = require('mongoose')
const { individualConnection } = require('../../utils/connection')

const individualSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IndividualUser'
  },
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
    type: String
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
    minlength: 12,
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
  street: {
    type: String,
    minlength: 2,
    required: true
  },
  resident: {
    type: Boolean,
    required: true
  },
  special: {
    type: Boolean,
    required: true
  },
  transactionLevelOne: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransactionLevelOne'
    }
  ],
  transactionLevelTwo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransactionLevelTwo'
    }
  ],
  transactionLevelThree: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransactionLevelThree'
    }
   ]
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