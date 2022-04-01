const Establishment = require('../../models/Establishments/establishment')
const Individual = require('../../models/Individuals/individual')
const TransactionLevelOne = require('../../models/Transactions/transaction-level-1')
const TransactionLevelTwo = require('../../models/Transactions/transaction-level-2')
const TransactionLevelThree = require('../../models/Transactions/transaction-level-3')
const handler = require('express').Router()

handler.post('/transactions', async (request, response) => {
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
            let login = {}
            if (establishment.level === 1) {
                const login = new Individual({
                    transactionLevelOne: person.transactionLevelOne.push(savedTransaction._id)
                })
            } else if (establishment.level === 2) {
                const login = new Individual({
                    transactionLevelTwo: person.transactionLevelTwo.push(savedTransaction._id)
                })
            } else if (establishment.level === 3) {
                const login = new Individual({
                    transactionLevelThree: person.transactionLevelThree.push(savedTransaction._id)
                })
            }

            await login.save()
        } catch (error) {
            if (establishment.level === 1) {
                await TransactionLevelOne.findByIdAndDelete(savedTransaction._id)
            } else if (establishment.level === 2) {
                await TransactionLevelTwo.findByIdAndDelete(savedTransaction._id)
            } else if (establishment.level === 3) {
                await TransactionLevelThree.findByIdAndDelete(savedTransaction._id)
            }
            return response.status(401).json({
                message: 'Failed to save transaction.'
            })
        }

        // Establishment update
        try {
            let login = {}
            if (establishment.level === 1) {
                const login = new Establishment({
                    transactionLevelOne: establishment.transactionLevelOne.push(savedTransaction._id)
                })
            } else if (establishment.level === 2) {
                const login = new Establishment({
                    transactionLevelTwo: establishment.transactionLevelTwo.push(savedTransaction._id)
                })
            } else if (establishment.level === 3) {
                const login = new Establishment({
                    transactionLevelThree: establishment.transactionLevelThree.push(savedTransaction._id)
                })
            }

            await login.save()
        } catch (error) {
            if (establishment.level === 1) {
                await TransactionLevelOne.findByIdAndDelete(savedTransaction._id)
            } else if (establishment.level === 2) {
                await TransactionLevelTwo.findByIdAndDelete(savedTransaction._id)
            } else if (establishment.level === 3) {
                await TransactionLevelThree.findByIdAndDelete(savedTransaction._id)
            }
            return response.status(401).json({
                message: 'Failed to save transaction.'
            })
        }

        return response.status(201).json({
            message: 'Transaction saved.',
            data: savedTransaction
        })
    } catch (error) {
        return response.status(401).json({
            message: 'Failed to save transaction.'
        })
    }
})

module.exports = handler
