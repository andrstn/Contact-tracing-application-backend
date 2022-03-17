const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const EstablishmentUserSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 8,
        unique: true
    },
    name: String,
    passwordHash: String
})

EstablishmentUserSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        // the passwordHash should not be revealed
        delete returnedObject.passwordHash
    }
})

EstablishmentUserSchema.plugin(uniqueValidator)

module.exports = mongoose.model('EstablishmentUser', EstablishmentUserSchema)