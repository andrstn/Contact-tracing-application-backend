const personsImageRouter = require('express').Router()
const decode = require('../../../utils/decodeToken')
const Individual = require('../../../models/Individuals/individual')
const IndividualUser = require('../../../models/Users/individual-user')
const AdminUser = require('../../../models/Users/admin-user')
const IndividualImage = require('../../../models/Individuals/individual-image')
const { response } = require('../../../app')
const { GridFsStorage } = require('multer-gridfs-storage')



// Fetch a single file
personsImageRouter.get('file/:filename',async (request, response ,next)=>{
    const decodedToken = decode.decodeToken(request)

    const iUser = await IndividualUser.findById(decodedToken.id)
    const aUser = await AdminUser.findById(decodedToken.id)
    const i = await Individual.findById(request.params.id)
    if (!iUser && !aUser) {
      return response.status(401).json({
          error: 'Unauthorized user.'
      })
    } else if (iUser) {
        if (i.accountId.toString() !== iUser._id.toString()) {
          return response.status(401).json({
            error: 'Unauthorized individual user.'
          })
        }
    }

    try {
        const image = await IndividualImage
        .find({fileName: request.params.fileName})
        .toArray((err, files) => {
            if(!files[0] || files.length === 0){
                return response.status(200).json({
                    success: false,
                    message: 'No files available'
                })
            }
            response.status(200).json({
                succes: true,
                file: files[0]
            })
        })
    } catch (error) {
        return response.status(401).json({
            error: 'Failed retrieve file.'
        })
    }
})

// Get a particular image and render it
personsImageRouter.get('file/:filename',async (request, response ,next)=>{
    const decodedToken = decode.decodeToken(request)

    const iUser = await IndividualUser.findById(decodedToken.id)
    const aUser = await AdminUser.findById(decodedToken.id)
    const i = await Individual.findById(request.params.id)
    if (!iUser && !aUser) {
      return response.status(401).json({
          error: 'Unauthorized user.'
      })
    } else if (iUser) {
        if (i.accountId.toString() !== iUser._id.toString()) {
          return response.status(401).json({
            error: 'Unauthorized individual user.'
          })
        }
    }

    try {
        const image = await IndividualImage
        .find({fileName: request.params.fileName})
        .toArray((err, files) => {
            if(!files[0] || files.length === 0){
                return response.status(200).json({
                    success: false,
                    message: 'No files available'
                })
            }
            if(files[0].contentType === 'image/jpeg'
            ||files[0].contentType === 'image/png'
            ||files[0].contentType === 'image/svg+xml'){
                gfs.openDownloadStreamByName(request. params.fileName).pipe(request)
            }else {
                response.status(404).json({
                    err: 'Not an image.'
                })
            }
        })
    } catch (error) {
        return response.status(401).json({
            error: 'Failed retrieve file.'
        })
    }
})

// Upload single valid id for verification
personsImageRouter.post(upload.single('/file'), async (request, response , next)=>{
  const body = request.body
  const decodedToken = decode.decodeToken(request)

  const iUser = await IndividualUser.findById(decodedToken.id)
  if (!iUser) {
    return response.status(401).json({
        error: 'Unauthorized user.'
      })
  }

  const existingImage = await IndividualImage.findOne({caption: body.caption})
     if(existingImage){
        return response.status(200).json({
             success: false,
            message: 'Image already exist'
        })
     }

     const image = new IndividualImage({
         caption: body.caption,
         fileName: body.fileName,
         fileId: body.fileId

        })
    try {
        const savedImage = await image.save()
        response.status(200).json(savedImage ,{
            success: true,
            image
        })
    } catch (error) {
        return response.status(500).json({
            error: 'Failed to upload file'
        })
    }
})






module.exports = personsImageRouter