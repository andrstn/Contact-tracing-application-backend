const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const { preRegisteredConnection } = require('../../utils/connection')

const preEstablishmentSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 8,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    name: {
        type: String,
        minlength: 2,
        unique: true,
        required: true
    },
    type: {
        type: String,
        minlength: 2,
        required: true
    },
    mobileNumber: {
        type: String,
        minlength: 11,
        required: true
    },
    hotlineNumber: {
        type: String,
        minlength: 6,
    },
    barangay: {
        type: String,
        minlength: 2,
        required: true
    },
    city: {
        type: String,
        minlength: 2,
        required: true
    },
    province: {
        type: String,
        minlength: 2,
        required: true
    },
    street: {
        type: String,
        minlength: 2,
        required: true
    }
})

preEstablishmentSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

preEstablishmentSchema.plugin(uniqueValidator)

const PreEstablishment = preRegisteredConnection.model('PreEstablishment', preEstablishmentSchema)

module.exports = PreEstablishment