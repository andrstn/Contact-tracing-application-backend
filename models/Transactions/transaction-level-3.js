const mongoose = require('mongoose')
const { transactionConnection } = require('../../utils/connection')

const transactionLevelThreeSchema = new mongoose.Schema({
     person: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Individual'
      },
    establishment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Establishment'
      },
    date: {
        type: Number,
        required: true
      },
    status: {
      type: String,
      required: true
    },
    login: {
      type: Number
    },
    logout: {
      type: Number
    }
})

transactionLevelThreeSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const TransactionLevelThree = transactionConnection.model('TransactionLevelThree', transactionLevelThreeSchema)

module.exports = TransactionLevelThree