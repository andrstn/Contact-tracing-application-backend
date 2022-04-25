const methodOverride = require('method-override')
const multer = require('multer')
const {GridFsStorage} = require('multer-gridfs-storage')
const Grid = requrie('gridfs-stream')
const crypto = require('crypto')
require('dotenv').config()
const { uploadIndividualConnection } = require('../utils/connection')
const { config } = require('dotenv')


// const mongoose = require('mongoose');

// let gfs;
// db.once('open', ()=>{
//     gfs = Grid(uploadIndividualConnection.db, mongoose.mongo)
//     gfs.collection('uploads')
// })


//Create Storage Engine
const storage = new GridFsStorage({
    url: config.uploadIndividualConnection,
    file: (request, file) => {
        return new Promise((resolve, reject) => {
         //encrypt filename before storing it
             crypto.randomBytes(16, (err, buf) => {
             if (err) {
                return reject(err);
             }
             const filename = buf.toString('hex') + path.extname(file.originalname);
             const fileInfo = {
                 filename: filename,
                 bucketName: 'uploads'
            };
             resolve(fileInfo);
        });
      });
    }
});
  const upload = multer({ storage })





module.exports = {
    upload
}