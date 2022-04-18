const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const { adminConnection } = require('../../utils/connection')

const adminSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
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
      type: String,
      minlength: 2
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
    }
})

adminSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

adminSchema.plugin(uniqueValidator)


const Admin = adminConnection.model('Admin', adminSchema)


module.exports =  Admin