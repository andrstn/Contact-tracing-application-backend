const schoolEstablishmentRouter = require('express').Router()
const app = require('../../app')
const Establishment = require('../../models/Establishments/establishment')
const Individual = require('../../models/Individuals/individual')
const EstablishmentUser = require('../../models/Users/establishment-user')
const decode = require('../../utils/decodeToken')

// Add a level-3 establishment via establishment (school)
// A non-school establishment cannot add one
schoolEstablishmentRouter.post('/:id/rooms', async (request, response) => {
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
    } else if (!e) {
        return response.status(401).json({
            error: 'Establishment not found.'
        })
    }

    const existingEstablishment = await Establishment.findOne({ name: `${e.name} (${body.name})` })
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
            level: 3,
            mobileNumber: establishment.mobileNumber,
            hotlineNumber: establishment.hotlineNumber,
            barangay: establishment.barangay,
            city: establishment.city,
            province: establishment.province,
            street: establishment.street,
            transactionLevelThree: []
        })

        const savedEstablishment = await newRoom.save()
        
        // Add room to school establishment
        try {
            const newRooms = establishment.rooms
            const add = newRooms.push(savedEstablishment.id)
            const addRoom = {
                rooms: newRooms
            }
            await Establishment.findByIdAndUpdate(establishment.id, addRoom, { new: true })
        } catch (error) {
            await Establishment.findByIdAndDelete(savedEstablishment.id)
            return response.status(400).json({
                error: 'Failed to add room.'
            })
        }

        return response.status(201).json({
            message: `${savedEstablishment.name} added as a room in ${establishment.name}`
        })

    } catch (error) {
        return response.status(400).json({
            error: 'Failed to add room.'
        })
    }
})

// Add an Inidivual/Person as teacher
// Individual ID is passed through QR code scanning
schoolEstablishmentRouter.post('/:id/teachers', async (request, response) => {
    const { personId } = request.body
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
    } else if (!e) {
        return response.status(401).json({
            error: 'Establishment not found.'
        })
    }

    const teacher = await Individual.findById(personId)
    if (!teacher) {
        return response.status(401).json({
            error: 'Individual not found.'
        })
    }

    const existingPerson = e.teachers.filter(teacher => teacher.toString() === body.personId.toString())
    if (existingPerson.length > 0) {
        return response.status(401).json({
            error: `Teacher already added.`
        })
    }

    // Add teacher(personId) to teachers field in the school establishment
    try {
        const establishment = await Establishment.findById(request.params.id)
        const teachers = establishment.teachers
        const addTeacher = teachers.push(personId)
        const newTeachers = {
            teachers: teachers
        }
        await Establishment.findByIdAndUpdate(establishment.id, newTeachers, { new: true })

        // Update special field of person into true
        try {
            const updatePerson = {
                special: true
            }
            await Individual.findByIdAndUpdate(teacher.id, updatePerson, { new: true })
            
            return response.status(201).json({
                message: `Person has been added as teacher in ${establishment.name}.`
            })
        } catch (error) {
            const currentEstab = await Establishment.findById(establishment.id)
            const currentTeachers = currentEstab.teachers
            const updatedTeachers = currentTeachers.filter(t => t.toString() !== teacher.id.toString())
            const updateEstab = {
                teachers: updatedTeachers
            }
            await Establishment.findByIdAndUpdate(establishment.id, updateEstab, { new: true })
            return response.status(400).json({
                error: `Failed to add teacher.`
            })
        }
    } catch (error) {
        return response.status(400).json({
            error: `Failed to add teacher.`
        })
    }
})

module.exports = schoolEstablishmentRouter