const Individual = require('../../models/Individuals/individual')
const AdminUser = require('../../models/Users/admin-user')
const decode = require('../../utils/decodeToken')
const handler = require('express').Router()

handler.put('/:id', async (request, response) => {
    const decodedToken = decode.decodeToken(request)

    const adminUser = await AdminUser.findById(decodedToken.id)
    if (!adminUser) {
        return response.status(401).json({
            error: 'Unauthorized user.'
        })
    }

    const person = await Individual.findById(request.params.id)
    if (!person) {
        return response.status(401).json({
            error: 'Invalid person id.'
        })
    } else if (person?.status !== 'positive') {
        return response.status(400).json({
            error: 'This person is not tested positive.'
        })
    }

    try {
        const update = {
            status: 'negative'
        }
        await Individual.findByIdAndUpdate(person.id, update, { new: true })
        return response.status(200).json({
            message: `Untagged ${person.id} as positive`
        })
    } catch (error) {
        return response.status(400).json({
            error: 'Failed to untag person.'
        })
    }
})

module.exports = handler