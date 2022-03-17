const mongoose = require('mongoose')

const TransactionLevelThreeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
    establishment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Establishment'
      },
    date: {
        type: Date,
        required: true
      },
      //covid Status
    status: String,
    //Time-in/Time-out
    logStatus: String
})

TransactionLevelThreeSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})


module.exports = mongoose.model('TransactionLevelThree', TransactionLevelThreeSchema)