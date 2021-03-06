const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const { userConnection } = require('../../utils/connection')

const establishmentUserSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 8,
        required: true,
        unique: true
    },
    passwordHash: String
})

establishmentUserSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        // the passwordHash should not be revealed
        delete returnedObject.passwordHash
    }
})

establishmentUserSchema.plugin(uniqueValidator)


const EstablishmentUser = userConnection.model('EstablishmentUser', establishmentUserSchema)

//  module.exports = userConnection.model('AdminUser', adminUserSchema)

module.exports =  EstablishmentUser
