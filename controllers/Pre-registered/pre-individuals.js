const prePersonRouter = require('express').Router()
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



// Get all pre-registered persons
prePersonRouter.get('/', async (request, response) => {
    const decodedToken = decode.decodeToken(request)

    const aUser = await AdminUser.findById(decodedToken.id)
    if (!aUser) {
        return response.status(401).json({
            error: 'Unauthorized user.'
        })
    }

    try {
        const prePersons = await PreIndividual.find({})
        return response.status(200).json(prePersons)
    } catch (error) {
        return response.status(400).json({
            error: 'Failed to retrieve all pre-registered persons'
        })
    }
})

// Get specific pre-registered person
prePersonRouter.get('/:id', async (request, response) => {
    const decodedToken = decode.decodeToken(request)

    const aUser = await AdminUser.findById(decodedToken.id)
    if (!aUser) {
        return response.status(401).json({
            error: 'Unauthorized user.'
        })
    }

    try {
        const prePerson = await PreIndividual.findById(request.params.id)
        return response.status(200).json(prePerson)
    } catch (error) {
        return response.status(400).json({
            error: `Failed to retrieve pre-registered person.`
        })
    }
})

// Pre-register a person
prePersonRouter.post('/', async (request, response) => {

    const body = request.body

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

    const prePerson = new PreIndividual({
        username: body.username,
        passwordHash: passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        middleName: body.middleName,
        suffix: body.suffix,
        gender: body.gender,
        birthDate: body.birthDate,
        contactNumber: body.contactNumber,
        email: body.email,
        province: body.province,
        city: body.city,
        barangay: body.barangay,
        street: body.street,
        resident: body.resident
    })

    try {
        const savedPrePerson = await prePerson.save()
        response.status(201).json(savedPrePerson)
    } catch (error) {
        return response.status(400).json({
            error: `${error}. Failed to pre-register.`
        })
    }
})

// Update pre-registered person
prePersonRouter.put('/:id', async (request, response) => {
    const body = request.body
    const decodedToken = decode.decodeToken(request)

    const aUser = await AdminUser.findById(decodedToken.id)
    if (!aUser) {
        return response.status(401).json({
            error: 'Unauthorized user.'
        })
    }

    const prePerson = {
        firstName: body.firstName,
        lastName: body.lastName,
        middleName: body.middleName,
        suffix: body.suffix,
        gender: body.gender,
        birthDate: body.birthDate,
        contactNumber: body.contactNumber,
        email: body.email,
        province: body.province,
        city: body.city,
        barangay: body.barangay,
        street: body.street,
        resident: body.resident
    }

    try {
        const updatedPrePerson = await PreIndividual.findByIdAndUpdate(request.params.id, prePerson, { new: true })
        response.status(201).json(updatedPrePerson)
    } catch (error) {
        return response.status(401).json({
        error: 'Failed to update pre-registered person.'
        })
    }
})

// Delete pre-registered person
prePersonRouter.delete('/:id', async (request, response) => {
    const decodedToken = decode.decodeToken(request)

    const aUser = await AdminUser.findById(decodedToken.id)
    if(!aUser) {
        return response.status(401).json({
            error: 'Unauthorized user.'
        })
    }

    try {
        const deletedPrePerson = await PreIndividual.findByIdAndDelete(request.params.id)
        return response.status(200).json({
            message: `${deletedPrePerson.username} deleted`
        })
    } catch (error) {
        return response.status(400).json({
            error: `Failed to delete pre-registered person.`
        })
    }
})

/*****************/

//Upload image
prePersonRouter.post('/profile', upload.single('file') , async (request, response, next)=>{
    const body = request.body
    const file = request.file
        const image = new Image({
            // preId: pre-registed._id,
            preRegisteredId: body.preRegisteredId,
            caption: body.caption,
            filename: file.filename,
            fileId: file.id
        })

        try {
            const savedImage = await image.save()
                response.status(201).json(savedImage)
        } catch (error) {
            return response.status(401).json({
                error: 'Failed to upload profile.'
            })
     }
})


//GET: Fetches a particular image and render on browser
prePersonRouter.get('/view/image/:filename',async (req, res, next) => {
    
    await gfs.find({ filename: req.params.filename }).toArray((err, files) => {
        console.log(files);
        if (!files[0]) {
            return res.status(200).json({   
                success: false,
                message: 'No files available',
            });
        }

        if (files[0].contentType === 'image/jpeg' || files[0].contentType === 'image/png' || files[0].contentType === 'image/svg+xml') {
            // render image to browser
            gfs.openDownloadStreamByName(req.params.filename).pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image',
            });
        }
    });
});


// GET: Fetches a particular file by filename
prePersonRouter.get('/view/image-details/:filename', async (req, res, next) => {

  await gfs.find({ filename: req.params.filename }).toArray((err, files) => {
        if (!files[0]) {
            return res.status(200).json({
                success: false,
                message: 'No files available',
            });
        }

        res.status(200).json({
            success: true,
            file: files[0],
        });
    });
});

      //  GET: Fetches all the files in the uploads collection
prePersonRouter.get('/view/image-details',async (req, res, next) => {
    await gfs.find().toArray((err, files) => {
        if (!files) {
            return res.status(200).json({
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

        res.status(200).json({
            success: true,
            files,
        });
    });
});


//  DELETE: Delete a particular file by an ID
prePersonRouter.delete('/file/del/:id',async (req, res, next) => {
    console.log(req.params.id);
    await  gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
        if (err) {
            return res.status(404).json({ err: err });
        }

        res.status(200).json({
            success: true,
            message: `File with ID ${req.params.id} is deleted`,
        });
    });
});

//DELETE: Delete an image from the collection
prePersonRouter.delete('/delete/:id',async (req, res, next) => {
    Image.findOne({ _id: req.params.id })
        .then((image) => {
            if (image) {
                Image.deleteOne({ _id: req.params.id })
                    .then(() => {
                        return res.status(200).json({
                            success: true,
                            message: `File with ID: ${req.params.id} deleted`,
                        });
                    })
                    .catch(err => { return res.status(500).json(err) });
            } else {
                res.status(200).json({
                    success: false,
                    message: `File with ID: ${req.params.id} not found`,
                });
            }
        })
        .catch(err => res.status(500).json(err));
});

module.exports = prePersonRouter