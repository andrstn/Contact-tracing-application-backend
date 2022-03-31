const mongoose = require('mongoose')
const { transactionConnection } = require('../../utils/connection')

const transactionLevelTwoSchema = new mongoose.Schema({
    person: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Individual'
      },
    establishment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Establishment'
      },
    date: {
        type: Date,
        required: true
      },
    status: {
      type: String,
      required: true
    },
    login: {
      type: Date
    },
    logout: {
      type: Date
    }
})

transactionLevelTwoSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const TransactionLevelTwo = transactionConnection.model('TransactionLevelTwo', transactionLevelTwoSchema)

module.exports = TransactionLevelTwo