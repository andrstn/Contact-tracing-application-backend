const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const { establishmentConnection } = require('../../utils/connection')

const establishmentSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EstablishmentUser'
    },
    name: {
        type: String,
        minlength: 2,
        unique: true,
        require: true
    },
    type: {
        type: String,
        require: true
    },
    level: {
        type: String,
        require: true
    },
    mobileNumber: {
        type: String,
        minlength: 11,
        require: true
    },
    hotlineNumber: {
        type: String,
        minlength: 6,
    },
    barangay: {
        type: String,
        minlength: 2,
        require: true
    },
    city: {
        type: String,
        minlength: 2,
        require: true
    },
    province: {
        type: String,
        minlength: 2,
        require: true
    },
    street: {
        type: String,
        minlength: 2,
        require: true
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

establishmentSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

establishmentSchema.plugin(uniqueValidator)


const Establishment = establishmentConnection.model('Establishment', establishmentSchema)


module.exports =  Establishment
