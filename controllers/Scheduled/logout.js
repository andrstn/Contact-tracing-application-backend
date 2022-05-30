const schedule = require('node-schedule');
const Establishment = require('../../models/Establishments/establishment');
const Individual = require('../../models/Individuals/individual');
const TransactionLevelOne = require('../../models/Transactions/transaction-level-1');
const TransactionLevelTwo = require('../../models/Transactions/transaction-level-2');
const TransactionLevelThree = require('../../models/Transactions/transaction-level-3');
const logger = require('../../utils/logger')

schedule.scheduleJob('untag','*/10 * * * * *', async (request, response) =>{
    const seconds = (Math.round((new Date()).getTime() / 1000)) - 1296000
    
    const establishmentsOne = await Establishment.find({level: 1})
    .where('pending').ne([])

    const establishmentsTwo = await Establishment.find({level: 2})
    .where('pending').ne([])

    const establishmentsThree = await Establishment.find({level: 3})
    .where('pending').ne([])


    for (let e = 0; e < establishmentsOne.length; e++) {
        for (let index = 0; index < establishmentsOne[e].pending.length; index++) {

            const deletedTransaction = await TransactionLevelOne.findByIdAndDelete(establishmentsOne[e].pending[index])
            const person = await Individual.findById(deletedTransaction.person.toString())
            const establishment = await Establishment.findById(deletedTransaction.establishment.toString())

            const newPersonTransactions = person.transactionLevelOne.filter(transaction => transaction != deletedTransaction.id)
            const updatePerson = {
                transactionLevelOne: newPersonTransactions
            }
            await Individual.findByIdAndUpdate(person.id, updatePerson, {new : true})

            const newEstablismentTransactions = establishment.transactionLevelOne.filter(transaction => transaction != deletedTransaction.id)
            const newPendingTransactions = establishment.pending.filter(transaction => transaction != deletedTransaction.id)
            const updateEstablishment = {
                transactionLevelOne: newEstablismentTransactions,
                pending: newPendingTransactions
            }
            await Establishment.findByIdAndUpdate(establishment.id, updateEstablishment, {new : true})


        }
    }

    //
    for (let e = 0; e < establishmentsTwo.length; e++) {
        for (let index = 0; index < establishmentsTwo[e].pending.length; index++) {

            const deletedTransaction = await TransactionLevelTwo.findByIdAndDelete(establishmentsTwo[e].pending[index])
            const person = await Individual.findById(deletedTransaction.person.toString())
            const establishment = await Establishment.findById(deletedTransaction.establishment.toString())

            const newPersonTransactions = person.transactionLevelTwo.filter(transaction => transaction != deletedTransaction.id)
            const updatePerson = {
                transactionLevelTwo: newPersonTransactions
            }
            await Individual.findByIdAndUpdate(person.id, updatePerson, {new : true})

            const newEstablismentTransactions = establishment.transactionLevelTwo.filter(transaction => transaction != deletedTransaction.id)
            const newPendingTransactions = establishment.pending.filter(transaction => transaction != deletedTransaction.id)
            const updateEstablishment = {
                transactionLevelTwo: newEstablismentTransactions,
                pending: newPendingTransactions
            }
            await Establishment.findByIdAndUpdate(establishment.id, updateEstablishment, {new : true})


        }
    }
    //
    for (let e = 0; e < establishmentsThree.length; e++) {
        for (let index = 0; index < establishmentsThree[e].pending.length; index++) {

            const deletedTransaction = await TransactionLevelThree.findByIdAndDelete(establishmentsThree[e].pending[index])
            const person = await Individual.findById(deletedTransaction.person.toString())
            const establishment = await Establishment.findById(deletedTransaction.establishment.toString())

            const newPersonTransactions = person.transactionLevelThree.filter(transaction => transaction != deletedTransaction.id)
            const updatePerson = {
                transactionLevelThree: newPersonTransactions
            }
            await Individual.findByIdAndUpdate(person.id, updatePerson, {new : true})

            const newEstablismentTransactions = establishment.transactionLevelThree.filter(transaction => transaction != deletedTransaction.id)
            const newPendingTransactions = establishment.pending.filter(transaction => transaction != deletedTransaction.id)
            const updateEstablishment = {
                transactionLevelThree: newEstablismentTransactions,
                pending: newPendingTransactions
            }
            await Establishment.findByIdAndUpdate(establishment.id, updateEstablishment, {new : true})


        }
    }
})




