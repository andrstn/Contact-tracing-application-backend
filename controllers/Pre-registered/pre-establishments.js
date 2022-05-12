const preEstablishmentRouter = require('express').Router()
const bcrypt = require('bcrypt')
const decode = require('../../utils/decodeToken')
const PreIndividual = require('../../models/Pre-registered/pre-individual')
const PreEstablishment = require('../../models/Pre-registered/pre-establishment')
const EstablishmentUser = require('../../models/Users/establishment-user')
const IndividualUser = require('../../models/Users/individual-user')
const AdminUser = require('../../models/Users/admin-user')
const mongoose = require('mongoose');
const Image = require('../../models/Images/image')
const multer = require('multer')
const path = require('path')
const {GridFsStorage} = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const crypto = require('crypto');

const mongoURI = process.env.MONGODB_UPLOAD_URI
const conn = mongoose.createConnection(mongoURI);


let gfs;


conn.once('open', () => {
    // initialize stream
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "uploads"
    });
});


const storage = new GridFsStorage({
        url: mongoURI,
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

// Get all pre-registered establishments
preEstablishmentRouter.get('/', async (request, response) => {
    const decodedToken = decode.decodeToken(request)

    const aUser = await AdminUser.findById(decodedToken.id)
    if (!aUser) {
        return response.status(401).json({
            error: 'Unauthorized user.'
        })
    }

    try {
        const preEstablishments = await PreEstablishment.find({})
        return response.status(200).json(preEstablishments)
    } catch (error) {
        return response.status(400).json({
            error: 'Failed to retrieve all pre-registered establishments'
        })
    }
})

// Get specific pre-registered establishment
preEstablishmentRouter.get('/:id', async (request, response) => {
    const decodedToken = decode.decodeToken(request)

    const aUser = await AdminUser.findById(decodedToken.id)
    if (!aUser) {
        return response.status(401).json({
            error: 'Unauthorized user.'
        })
    }

    try {
        const preEstablishment = await PreEstablishment.findById(request.params.id)
        return response.status(200).json(preEstablishment)
    } catch (error) {
        return response.status(400).json({
            error: `Failed to retrieve pre-registered establishment.`
        })
    }
})

// Pre-register an establishment
preEstablishmentRouter.post('/',upload.single('file'), async (request, response) => {

    const body = request.body
    const file = request.file


    const existingEstablishmentUser = await EstablishmentUser.findOne({ username: body.username })
    if (existingEstablishmentUser) {
        return response.status(400).json({
          error: 'Username must be unique.'
        })
    }

    const existingIndividualUser = await IndividualUser.findOne({ username: body.username })
    if (existingIndividualUser) {
        return response.status(400).json({
          error: 'Username must be unique.'
        })
    }
    
    const existingPreIndividual = await PreIndividual.findOne({ username: body.username })
    if (existingPreIndividual) {
        return response.status(400).json({
          error: 'Username must be unique.'
        })
    }

    const existingPreEstablishment = await PreEstablishment.findOne({ username: body.username })
    if (existingPreEstablishment) {
        return response.status(400).json({
          error: 'Username must be unique.'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const preEstablishment = new PreEstablishment({
        username: body.username,
        passwordHash: passwordHash,
        name: body.name,
        type: body.type,
        // needs to be in a 12-digit format (63**********)
        mobileNumber: body.mobileNumber,
        hotlineNumber: body.hotlineNumber,
        province: body.province,
        city: body.city,
        barangay: body.barangay,
        street: body.street,
    })

    try {
        const savedPreEstablishment = await preEstablishment.save()
        try {
            const image = Image({
                preRegisteredId: savedPreEstablishment.id,
                filename: file.filename,
                fileId: file.id
            })
            const savedImage = await image.save()
            response.status(201).json({
                message: `${body.name} establishment is now Pre-registered.`,
                data: {
                    id: savedPreEstablishment.id,
                    imageId: savedImage.id
                }
            })
        } catch (error) {
            await PreEstablishment.findByIdAndDelete(savedPreEstablishment.id)
                return response.status(401).json({
                     error: `Failed to upload image.Pre-registered data of ${body.name} will be deleted .`
                })
        }
    } catch (error) {
        return response.status(400).json({
            error: `${error}. Failed to pre-register.`
        })
    }
})

// Update pre-registered establishment
preEstablishmentRouter.put('/:id', async (request, response) => {
    const body = request.body
    const decodedToken = decode.decodeToken(request)

    const aUser = await AdminUser.findById(decodedToken.id)
    if (!aUser) {
        return response.status(401).json({
            error: 'Unauthorized user.'
        })
    }

    const preEstablishment = {
        name: body.name,
        mobileNumber: body.mobileNumber,
        hotlineNumber: body.hotlineNumber,
        province: body.province,
        city: body.city,
        barangay: body.barangay,
        street: body.street
    }

    try {
        const updatedPreEstablishment = await PreEstablishment.findByIdAndUpdate(request.params.id, preEstablishment, { new: true })
        response.status(201).json(updatedPreEstablishment)
    } catch (error) {
        return response.status(401).json({
        error: 'Failed to update pre-registered establishment.'
        }) 
    }
})

// Delete pre-registered establishment
preEstablishmentRouter.delete('/:id', async (request, response) => {
    const decodedToken = decode.decodeToken(request)

    const aUser = await AdminUser.findById(decodedToken.id)
    if(!aUser) {
        return response.status(401).json({
            error: 'Unauthorized user.'
        })
    }

    try {
        const deletedPreEstablishment = await PreEstablishment.findByIdAndDelete(request.params.id)
        return response.status(200).json({
            message: `${deletedPreEstablishment.username} deleted`
        })
    } catch (error) {
        return response.status(400).json({
            error: `Failed to delete pre-registered establishment.`
        })
    }
})


/************** */

//GET: Fetches a particular image and render on browser
preEstablishmentRouter.get('/view/image/:filename',async (request, response, next) => {
    const decodedToken = decode.decodeToken(request)

    const aUser = await AdminUser.findById(decodedToken.id)
    if (!aUser) {
      return response.status(401).json({
          error: 'Unauthorized user.'
        })
    } 
    
    await gfs.find({ filename: request.params.filename }).toArray((err, files) => {
        console.log(files);
        if (!files[0]) {
            return response.status(200).json({   
                success: false,
                message: 'No files available',
            });
        }

        if (files[0].contentType === 'image/jpeg' || files[0].contentType === 'image/png' || files[0].contentType === 'image/svg+xml') {
            // render image to browser
            gfs.openDownloadStreamByName(request.params.filename).pipe(response);
        } else {
            response.status(404).json({
                err: 'Not an image',
            });
        }
    });
});


// GET: Fetches a particular file by filename
preEstablishmentRouter.get('/view/image-details/:filename', async (request, response, next) => {
    const decodedToken = decode.decodeToken(request)

    const aUser = await AdminUser.findById(decodedToken.id)
    if (!aUser) {
      return response.status(401).json({
          error: 'Unauthorized user.'
        })
    } 

    await gfs.find({ filename: request.params.filename }).toArray((err, files) => {
          if (!files[0]) {
              return response.status(200).json({
                  success: false,
                  message: 'No files available',
              });
          }
  
          response.status(200).json({
              success: true,
              file: files[0],
          });
      });
  });
  
        //  GET: Fetches all the files in the uploads collection
preEstablishmentRouter.get('/view/image-details',async (request, response, next) => {
    const decodedToken = decode.decodeToken(request)

    const aUser = await AdminUser.findById(decodedToken.id)
    if (!aUser) {
      return response.status(401).json({
          error: 'Unauthorized user.'
        })
    } 
      await gfs.find().toArray((err, files) => {
          if (!files) {
              return response.status(200).json({
                  success: false,
                  message: 'No files available'
              });
          }
  
          files.map(file => {
              if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/svg') {
                  file.isImage = true;
              } else {
                  file.isImage = false;
              }
          });
  
          response.status(200).json({
              success: true,
              files,
          });
      });
  });
  
  
  //  DELETE: Delete a particular file by an ID
  preEstablishmentRouter.delete('/file/del/:id',async (request, response, next) => {
    const decodedToken = decode.decodeToken(request)

    const aUser = await AdminUser.findById(decodedToken.id)
    if (!aUser) {
      return response.status(401).json({
          error: 'Unauthorized user.'
        })
    } 
      console.log(request.params.id);
      await  gfs.delete(new mongoose.Types.ObjectId(request.params.id), (err, data) => {
          if (err) {
              return response.status(404).json({ err: err });
          }
  
          response.status(200).json({
              success: true,
              message: `File with ID ${request.params.id} is deleted`,
          });
      });
  });
  
  //DELETE: Delete an image from the collection
  preEstablishmentRouter.delete('/delete/:id',async (request, response, next) => {
    const decodedToken = decode.decodeToken(request)

    const aUser = await AdminUser.findById(decodedToken.id)
    if (!aUser) {
      return response.status(401).json({
          error: 'Unauthorized user.'
        })
    } 
      Image.findOne({ _id: request.params.id })
          .then((image) => {
              if (image) {
                  Image.deleteOne({ _id: request.params.id })
                      .then(() => {
                          return response.status(200).json({
                              success: true,
                              message: `File with ID: ${request.params.id} deleted`,
                          });
                      })
                      .catch(err => { return response.status(500).json(err) });
              } else {
                  response.status(200).json({
                      success: false,
                      message: `File with ID: ${request.params.id} not found`,
                  });
              }
          })
          .catch(err => response.status(500).json(err));
  });


module.exports = preEstablishmentRouter