const mongoose = require('mongoose')
const { uploadIndividualConnection } = require('../../utils/connection')

const individualImageSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IndividualUser'
  },
  caption: {
      type: String,
      minlength: 2,
      unique: true,
      required: true
  },
  fileName: {
      type: String,
      minlength: 2,
      unique: true,
      required: true
  },
  individualImg: {
      data: Buffer,
      contentType: String
  }
})

individualImageSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const IndividualImage = uploadIndividualConnection.model('IndividualImage', individualImageSchema)

module.exports = IndividualImage