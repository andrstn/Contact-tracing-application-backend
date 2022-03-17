const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const IndividualUserSchema = new mongoose.Schema({
    usernam: {
        type: String,
        minlength: 8,
        unique: true
    },
    name: String,
    passwordHash: String
})

IndividualUserSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        // the passwordHash should not be revealed
        delete returnedObject.passwordHash
    }
})

IndividualUserSchema.plugin(uniqueValidator)

module.exports = mongoose.model('IndividualUser', IndividualUserSchema)