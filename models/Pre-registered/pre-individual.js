const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const { preRegisteredConnection } = require('../../utils/connection')

const preIndividualSchema = new mongoose.Schema({
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
        minlength: 2,
        required: true
    },
    email: {
        type: String,
        minlength: 2
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
    }
})

preIndividualSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

preIndividualSchema.plugin(uniqueValidator)

const PreIndividual = preRegisteredConnection.model('PreIndividual', preIndividualSchema)

module.exports = PreIndividual