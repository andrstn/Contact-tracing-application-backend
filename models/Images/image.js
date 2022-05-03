const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { uploadIndividualConnection } = require('../../utils/connection')

const imageSchema = new Schema({

  // preId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'PreIndividual'
  // },
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

imageSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Image = uploadIndividualConnection.model('Image', imageSchema)

module.exports = Image