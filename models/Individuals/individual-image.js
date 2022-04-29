const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { uploadIndividualConnection } = require('../../utils/connection')

const individualImageSchema = new Schema({
  preRegisteredId: {
    type: String,
    required: true
  },
  caption: {
      type: String,
      required: true
  },
  filename: {
      type: String,
      required: true
  },
  fileId: {
      required: true,
      type: String
  },
  createdAt: {
      default: Date.now(),
      type: Date,
  },
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