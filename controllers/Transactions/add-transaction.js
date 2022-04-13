const jwt = require('jsonwebtoken')
const Establishment = require('../../models/Establishments/establishment')
const EstablishmentUser = require('../../models/Users/establishment-user')
const Individual = require('../../models/Individuals/individual')
const TransactionLevelOne = require('../../models/Transactions/transaction-level-1')
const TransactionLevelTwo = require('../../models/Transactions/transaction-level-2')
const TransactionLevelThree = require('../../models/Transactions/transaction-level-3')
const decode = require('../../utils/decodeToken')
const handler = require('express').Router()


// Get Transactions each level
handler.get('/transaction-one', async (request, response) => {
    const handler = await TransactionLevelOne
    .find({})
    .populate('person',{ firstName: 1, lastName: 1}, Individual) 
    .populate('establishment',{ name: 1, level: 1}, Establishment) 
    response.json(handler)
  })

handler.get('/transaction-two', async (request, response) => {
    const handler = await TransactionLevelTwo
    .find({})
    response.json(handler)
  })

handler.get('/transaction-three', async (request, response) => {
    const handler = await TransactionLevelThree
    .find({})
    .populate('person', 'firstName', Individual) 
    response.json(handler)
  })



handler.post('/transactions', async (request, response) => {
    const decodedToken = decode.decodeToken(request)

    const establishmentUser = await EstablishmentUser.findById(decodedToken.id)
    if (!establishmentUser) {
        return response.status(401).json({
            error: 'Unauthorized user.'
        })
    }

    const {
        personId,
        establishmentId
    } = request.body

    const person = await Individual.findById(personId)
    if (!person) {
        return response.status(401).json({
            message: 'Invalid person ID.'
        })
    }
    const establishment = await Establishment.findById(establishmentId)
    if (!establishment) {
        return response.status(401).json({
            message: 'Invalid establishment ID.'
        })
    }

    // Create Transaction 
    try {
        let savedTransaction = {}
        if (establishment.level === 1) {
            const newTransaction = new TransactionLevelOne({
                person: personId,
                establishment: establishmentId,
                date: Math.round((new Date()).getTime() / 1000),
                status: person.status,
                login: Math.round((new Date()).getTime() / 1000)
            })

            const response = await newTransaction.save()
            savedTransaction = response
        } else if (establishment.level === 2) {
            const newTransaction = new TransactionLevelTwo({
                person: personId,
                establishment: establishmentId,
                date: Math.round((new Date()).getTime() / 1000),
                status: person.status,
                login: Math.round((new Date()).getTime() / 1000)
            })

            const response = await newTransaction.save()
            savedTransaction = response
        } else if (establishment.level === 3) {
            const newTransaction = new TransactionLevelThree({
                person: personId,
                establishment: establishmentId,
                date: Math.round((new Date()).getTime() / 1000),
                status: person.status,
                login: Math.round((new Date()).getTime() / 1000)
            })

            const response = await newTransaction.save()
            savedTransaction = response
        }

        // Person update
        try {
            // let login = {}
            if (establishment.level === 1) {
                const newTransactionLevelOne = person.transactionLevelOne
                const addTransaction = newTransactionLevelOne.push(savedTransaction.id)
                const login = {
                    transactionLevelOne: newTransactionLevelOne
                }
                await Individual.findByIdAndUpdate(personId , login, {new : true})
            } else if (establishment.level === 2) {
                const newTransactionLevelTwo = person.transactionLevelTwo
                const addTransaction = newTransactionLevelTwo.push(savedTransaction.id)
                const login = {
                    transactionLevelTwo: newTransactionLevelTwo
                }
                await Individual.findByIdAndUpdate(personId , login, {new : true})
            } else if (establishment.level === 3) {
                const newTransactionLevelThree = person.transactionLevelThree
                const addTransaction = newTransactionLevelThree.push(savedTransaction.id)
                const login = {
                    transactionLevelThree: newTransactionLevelThree
                }
                await Individual.findByIdAndUpdate(personId , login, {new : true})
            }

        } catch (error) {
            if (establishment.level === 1) {
                await TransactionLevelOne.findByIdAndDelete(savedTransaction.id)
            } else if (establishment.level === 2) {
                await TransactionLevelTwo.findByIdAndDelete(savedTransaction.id)
            } else if (establishment.level === 3) {
                await TransactionLevelThree.findByIdAndDelete(savedTransaction.id)
            }
            return response.status(400).json({
                message: 'Failed to save transaction.'
            })
        }

        // Establishment update
        try {
            // let login = {}
            if (establishment.level === 1) {
                const newTransactionLevelOne = establishment.transactionLevelOne
                const add = newTransactionLevelOne.push(savedTransaction.id)
                const login = {
                    transactionLevelOne: newTransactionLevelOne
                }
                await Establishment.findByIdAndUpdate(establishmentId , login, {new : true})
            } else if (establishment.level === 2) {
                const newTransactionLevelTwo = establishment.transactionLevelTwo
                const add = newTransactionLevelTwo.push(savedTransaction.id)
                const login = {
                    transactionLevelTwo: newTransactionLevelTwo
                }
                await Establishment.findByIdAndUpdate(establishmentId , login, {new : true})
            } else if (establishment.level === 3) {
                const newTransactionLevelThree = establishment.transactionLevelThree
                const add = newTransactionLevelThree.push(savedTransaction.id)
                const login = {
                    transactionLevelThree: newTransactionLevelThree
                }
                await Establishment.findByIdAndUpdate(establishmentId , login, {new : true})
            }

        } catch (error) {
            if (establishment.level === 1) {
                await TransactionLevelOne.findByIdAndDelete(savedTransaction.id)
            } else if (establishment.level === 2) {
                await TransactionLevelTwo.findByIdAndDelete(savedTransaction.id)
            } else if (establishment.level === 3) {
                await TransactionLevelThree.findByIdAndDelete(savedTransaction.id)
            }
            return response.status(400).json({
                message: 'Failed to save transaction.'
            })
        }

        return response.status(201).json({
            message: 'Transaction saved.',
            data: savedTransaction
        })
    } catch (error) {
        return response.status(400).json({
            message: 'Failed to save transaction.'
        })
    }
})

module.exports = handler
