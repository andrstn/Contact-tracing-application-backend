const jwt = require('jsonwebtoken')
const Establishment = require('../../models/Establishments/establishment')
const EstablishmentUser = require('../../models/Users/establishment-user')
const Individual = require('../../models/Individuals/individual')
const IndividualUser = require('../../models/Users/individual-user')
const TransactionLevelOne = require('../../models/Transactions/transaction-level-1')
const TransactionLevelTwo = require('../../models/Transactions/transaction-level-2')
const TransactionLevelThree = require('../../models/Transactions/transaction-level-3')
const decode = require('../../utils/decodeToken')
const handler = require('express').Router()

handler.post('/', async (request, response) => {
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
    const establishment = await Establishment.findById(establishmentId);
    if (!establishment) {
        return response.status(401).json({
            message: 'Invalid establishment ID.'
        })
    }
    if (establishment.accountId.toString() !== establishmentUser.id) {
        return response.status(401).json({
            message: 'Unauthorized establishment user.'
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

        // Add transaction to establishment pending logs
        try {
            const currentPending = establishment.pending
            currentPending.push(savedTransaction.id)
            const updatePending = {
                pending: currentPending
            }
            await Establishment.findByIdAndUpdate(establishmentId, updatePending, { new: true })
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


// Teacher add transactions
handler.post('/special/:id' ,async (request , response)=> {
    const decodedToken = decode.decodeToken(request)
    const { personId, establishmentId } = request.body

    const individualUser = await IndividualUser.findById(decodedToken.id)
    if (!individualUser) {
        return response.status(401).json({
            error: 'Unauthorized user.'
        })
    }

    const teacher = await Individual.findById(request.params.id)
    if (!teacher) {
        return response.status(401).json({
            message: 'Invalid teacher ID.'
        })
    }
    
    if(teacher){
        if(teacher.special === false){
            return response.status(401).json({
                error: 'Unauthorized. Not a special user.'
            })
        }
    }

    //Create transaction
    try {
        const student = await Individual.findById(personId)
        const school = await Establishment.findById(establishmentId)
        const newTransaction = new TransactionLevelThree({
            person: personId,
            establishment: establishmentId,
            teacher: teacher.id,
            date: Math.round((new Date()).getTime() / 1000),
            status: student.status,
            login: Math.round((new Date()).getTime() / 1000)
        })
        const savedTransaction = await newTransaction.save()
        
        //Person update 
        try {
            const newTransactionLevelThree = student.transactionLevelThree
            const addTransaction = newTransactionLevelThree.push(savedTransaction.id)
            const newAttendance = {
                transactionLevelThree: newTransactionLevelThree
            }
            await Individual.findByIdAndUpdate(personId , newAttendance, {new : true})
        } catch (error) {
            await TransactionLevelThree.findByIdAndDelete(savedTransaction.id)
            return response.status(401).json({
                message: 'Failed to save transaction one.'
            })
        }

        //Establishment update
        try {
            const newTransactionLevelThree = school.transactionLevelThree
            const addTransaction = newTransactionLevelThree.push(savedTransaction.id)
            const newAttendance = {
                transactionLevelThree: newTransactionLevelThree
            }
            await Establishment.findByIdAndUpdate(establishmentId , newAttendance, {new : true})
        } catch (error) {

            await TransactionLevelThree.findByIdAndDelete(savedTransaction.id)
            const currentStudent = await Individual.findById(personId)
            const newTransactionLevelThree = currentStudent.transactionLevelThree
            const removeTransaction = newTransactionLevelThree.filter(transaction => transaction.toString() !== savedTransaction.id)
            const newTransactions = {
                transactionLevelThree: removeTransaction
            }
            await Individual.findByIdAndUpdate(personId , newTransactions, {new : true})
            return response.status(401).json({
                message: 'Failed to save transaction two.'
            })
        }

        // Add transaction to establishment pending logs
        try {
            const currentPending = school.pending
            currentPending.push(savedTransaction.id)
            const updatePending = {
                pending: currentPending
            }
            await Establishment.findByIdAndUpdate(establishmentId, updatePending, { new: true })
        } catch (error) {
            await TransactionLevelOne.findByIdAndDelete(savedTransaction.id)
            return response.status(400).json({
                message: 'Failed to save transaction.'
            })
        }
        return response.status(201).json({
            message: 'Transaction saved',
            data: savedTransaction
        })
    } catch (error) {
        return response.status(401).json({
            message: 'Failed to save transaction three.'
        })
    }
})

module.exports = handler
