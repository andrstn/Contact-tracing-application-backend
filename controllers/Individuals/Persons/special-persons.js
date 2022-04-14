const jwt = require('jsonwebtoken')
const Individual = require('../../../models/Individuals/individual')
const IndividualUser = require('../../../models/Users/individual-user')
const Establishment = require('../../../models/Establishments/establishment')
const AdminUser = require('../../../models/Users/admin-user')
const EstablishmentUser = require('../../../models/Users/establishment-user')
const decode = require('../../../utils/decodeToken')
const specialPerson = require('express').Router()


specialPerson.post('/special-person', async (request, response) => {
    const decodedToken = decode.decodeToken(request)

    const { personId } = request.body


    const establishmentUser = await EstablishmentUser.findById(decodedToken.id)
    if (!establishmentUser) {
        return response.status(401).json({
            error: 'Unauthorized user.'
        })
    }
    const establishment = await Establishment.findById(establishmentId)
    if (!establishment) {
        return response.status(401).json({
            message: 'Invalid establishment ID.'
        })
    }
    const person = await Individual.findById(personId)
    if (!person) {
        return response.status(401).json({
            message: 'Invalid person ID.'
        })
    }

    try {
        let savedPerson = {}
        if(person.special === false){
            const newPerson = new Individual({
                firstName: body.firstName,
                lastName: body.lastName,
                middleName: body.middleName,
                suffix: body.suffix,
                gender: body.gender,
                birthDate: body.birthDate,
                contactNumber: body.contactNumber,
                email: body.email,
                status: body.status,
                province: body.province,
                city: body.city,
                barangay: body.barangay,
                street: body.street,
                resident: body.resident,
                special: body.special || true,
                transactionLevelOne: body.transactionLevelOne,
                transactionLevelTwo: body.transactionLevelTwo,
                transactionLevelThree: body.transactionLevelThree,
            })
            const response = await newPerson.save()
            savedPerson = response
        }
        return response.status(201).json({
            message: 'User can now access special person.',
            data: savedTransaction
        })
    } catch (error) {
        return response.status(401).json({
            message: 'Failed to add special person.'
        })
    }
    
  })

  module.exports = specialPerson