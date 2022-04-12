const prePersonRouter = require('express').Router()
const bcrypt = require('bcrypt')
const decode = require('../../utils/decodeToken')
const PreIndividual = require('../../models/Pre-registered/pre-individual')
const PreEstablishment = require('../../models/Pre-registered/pre-establishment')
const EstablishmentUser = require('../../models/Users/establishment-user')
const IndividualUser = require('../../models/Users/individual-user')
const AdminUser = require('../../models/Users/admin-user')

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
        error: 'Failed to update person.'
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

module.exports = prePersonRouter