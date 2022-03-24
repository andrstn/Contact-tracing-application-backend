const mongoose = require('mongoose')
const { userConnection } = require('../../utils/connection')
// const uniqueValidator = require('mongoose-unique-validator')

const adminUserSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 8,
        unique: true
    },
    name: String,
    passwordHash: String
})

adminUserSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        // the passwordHash should not be revealed
        delete returnedObject.passwordHash
    }
})

// AdminUserSchema.plugin(uniqueValidator)



const AdminUser = userConnection.model('AdminUser', adminUserSchema)

//  module.exports = userConnection.model('AdminUser', adminUserSchema)

module.exports =  AdminUser
