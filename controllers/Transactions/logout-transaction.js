const EstablishmentUser = require('../../models/Users/establishment-user')
const Establishment = require('../../models/Establishments/establishment')
const Individual = require('../../models/Individuals/individual')
const TransactionLevelOne = require('../../models/Transactions/transaction-level-1')
const TransactionLevelTwo = require('../../models/Transactions/transaction-level-2')
const TransactionLevelThree = require('../../models/Transactions/transaction-level-3')
const decode = require('../../utils/decodeToken')
const { forEach } = require('lodash')
const handler = require('express').Router()

handler.put('/:id', async (request, response) => {
    const body = request.body
    const decodedToken = decode.decodeToken(request)

    const establishmentUser = await EstablishmentUser.findById(decodedToken.id)
    if (!establishmentUser) {
        return response.status(401).json({
            error: 'Unauthorized user.'
        })
    }

    const establishment = await Establishment.findById(body.establishmentId)
    if (establishment.pending.length === 0) {
        return response.status(400).json({
            error: `No pending transactions.`
        })
    }

    let pendings = []
    if (establishment.level === 1) {
        for (let index = 0; index < establishment.pending.length; index++) {
            const transaction = await TransactionLevelOne.findById(establishment.pending[index])
            pendings.push(transaction)
        }
    } else if (establishment.level === 2) {
        for (let index = 0; index < establishment.pending.length; index++) {
            const transaction = await TransactionLevelTwo.findById(establishment.pending[index])
            pendings.push(transaction)
        }
    } else if (establishment.level === 3) {
        for (let index = 0; index < establishment.pending.length; index++) {
            const transaction = await TransactionLevelThree.findById(establishment.pending[index])
            pendings.push(transaction)
        }
    }

    if (pendings.length === 0) {
        return response.status(400).json({
            error: `No pending transactions.`
        })
    }
    
    const personPending = pendings.filter(pending => pending.person === request.params.id)
    if (personPending.length === 0) {
        return response.status(400).json({
            error: `This person is not logged in this establishment.`
        })
    }

    let most = {
        date: 0
    }
    for (let index = 0; index < personPending.length; index++) {
        if (personPending[index].date > most.date) {
            most = personPending[index]
        } 
    }

    try {
        const updateTransaction = {
            logout: Math.round((new Date()).getTime() / 1000)
        }
        let updatedTransaction = {}
        if (establishment.level === 1) {
            updatedTransaction = await TransactionLevelOne.findByIdAndUpdate(most.id, updateTransaction, { new: true })
        } else if (establishment.level === 2) {
            updatedTransaction = await TransactionLevelTwo.findByIdAndUpdate(most.id, updateTransaction, { new: true })
        } else if (establishment.level === 3) {
            updatedTransaction = await TransactionLevelThree.findByIdAndUpdate(most.id, updateTransaction, { new: true })
        }
        
        const updateEstablishment = {
            pending: establishment.pending.filter(p => p !== most.id)
        }
        const updatedEstablishment = await Establishment.findById(establishment.id, updateEstablishment, { new: true })
        
        return response.status(201).json({
            message: `Person logged out.`,
            data: updatedTransaction
        })
    } catch (error) {
        return response.status(400).json({
            message: 'Failed to log-out.'
        })
    }
})

module.exports = handler
