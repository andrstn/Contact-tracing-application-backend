const preEstablishmentRouter = require('express').Router()
const bcrypt = require('bcrypt')
const decode = require('../../utils/decodeToken')
const PreIndividual = require('../../models/Pre-registered/pre-individual')
const PreEstablishment = require('../../models/Pre-registered/pre-establishment')
const EstablishmentUser = require('../../models/Users/establishment-user')
const IndividualUser = require('../../models/Users/individual-user')
const AdminUser = require('../../models/Users/admin-user')

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
preEstablishmentRouter.post('/', async (request, response) => {
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

    const preEstablishment = new PreEstablishment({
        username: body.username,
        passwordHash: passwordHash,
        name: body.name,
        mobileNumber: body.mobileNumber,
        hotlineNumber: body.hotlineNumber,
        province: body.province,
        city: body.city,
        barangay: body.barangay,
        street: body.street,
    })

    try {
        const savedPreEstablishment = await preEstablishment.save()
        response.status(201).json(savedPreEstablishment)
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

module.exports = preEstablishmentRouter