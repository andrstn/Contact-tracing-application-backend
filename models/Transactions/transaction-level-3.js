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

transactionLevelThreeSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = transactionConnection.model('TransactionLevelThree', transactionLevelThreeSchema)
