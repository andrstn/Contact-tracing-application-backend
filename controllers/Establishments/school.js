const schoolEstablishmentRouter = require('express').Router()
const Establishment = require('../../models/Establishments/establishment')
const EstablishmentUser = require('../../models/Users/establishment-user')
const decode = require('../../utils/decodeToken')

// Add a level-1 establishment via establishment (school)
// A non-school establishment cannot add one
schoolEstablishmentRouter.post('/:id', async (request, response) => {
    const body = request.body
    const decodedToken = decode.decodeToken(request)

    const eUser = await EstablishmentUser.findById(decodedToken.id)
    const e = await Establishment.findById(request.params.id)
    if (!eUser) {
        return response.status(401).json({
            error: 'Unauthorized user.'
        })
    } else if (eUser) {
        if (e.accountId.toString() !== eUser._id.toString()) {
            return response.status(401).json({
            error: 'Unauthorized establishment user.'
            })
        }
    }

    const existingEstablishment = await Establishment.findOne({ name: body.name })
    if (existingEstablishment) {
        return response.status(400).json({
            error: 'Establishment name must be unique.'
        })
    }

    // Create room as an establishment
    try {
        const establishment = await Establishment.findById(request.params.id)

        if (establishment.type !== 'School') {
            if (e.accountId.toString() !== eUser._id.toString()) {
                return response.status(401).json({
                error: 'Unauthorized establishment user.'
                })
            }
        }

        const newRoom = new Establishment({
            name: `${establishment.name} (${body.name})`,
            type: 'Room',
            level: 1,
            mobileNumber: establishment.mobileNumber,
            hotlineNumber: establishment.hotlineNumber,
            barangay: establishment.barangay,
            city: establishment.city,
            province: establishment.province,
            street: establishment.street,
            transactionLevelOne: []
        })

        const savedEstablishment = await newRoom.save()
        
        // Add room to school establishment
        try {
        } catch (error) {

        }

        
    } catch (error) {

    }
})