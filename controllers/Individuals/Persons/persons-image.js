const personsImageRouter = require('express').Router()
const mongoose = require('mongoose');
const IndividualImage = require('../../../models/Individuals/individual-image')
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


personsImageRouter.post('/profile', upload.single('file') , async (request, response, next)=>{
    const body = request.body
    const file = request.file
        const image = new IndividualImage({
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

personsImageRouter.get('/view/:filename',async (req, res, next) => {
    
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


module.exports = personsImageRouter