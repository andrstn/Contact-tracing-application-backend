const schedule = require('node-schedule');
const Establishment = require('../../models/Establishments/establishment');
const Individual = require('../../models/Individuals/individual')
const TransactionLevelOne = require('../../models/Transactions/transaction-level-1')
const TransactionLevelTwo = require('../../models/Transactions/transaction-level-2')
const TransactionLevelThree = require('../../models/Transactions/transaction-level-3')
const logger = require('../../utils/logger')

schedule.scheduleJob('transaction','0 0 * * *', async (request, response) =>{
    const seconds = (Math.round((new Date()).getTime() / 1000)) - 2592000

    const transactionLevelOne = await TransactionLevelOne.find({})
    .where('date').lt(seconds)

    const transactionLevelTwo = await TransactionLevelTwo.find({})
    .where('date').lt(seconds)
    
    const transactionLevelThree = await TransactionLevelThree.find({})
    .where('date').lt(seconds)
    
    
//Delete level-1
    for (let index = 0; index < transactionLevelOne.length; index++) {
        const deletedTransaction = await TransactionLevelOne.findByIdAndDelete(transactionLevelOne[index].id)
        const person = await Individual.findById(deletedTransaction.person.toString())
        const establishment = await Establishment.findById(deletedTransaction.establishment.toString())

        const newPersonTransactions = person.transactionLevelOne.filter(transaction => transaction != deletedTransaction.id)
        const updatePerson = {
            transactionLevelOne: newPersonTransactions
        }
        await Individual.findByIdAndUpdate(person.id, updatePerson, {new : true})

        const newEstablismentTransactions = establishment.transactionLevelOne.filter(transaction => transaction != deletedTransaction.id)
        const updateEstablishment = {
            transactionLevelOne: newEstablismentTransactions
        }
        await Establishment.findByIdAndUpdate(establishment.id, updateEstablishment, {new : true})
    }

//Delete level-2
    for (let index = 0; index < transactionLevelTwo.length; index++) {
        const deletedTransaction = await TransactionLevelTwo.findByIdAndDelete(transactionLevelTwo[index].id)
        const person = await Individual.findById(deletedTransaction.person.toString())
        const establishment = await Establishment.findById(deletedTransaction.establishment.toString())

        const newPersonTransactions = person.transactionLevelTwo.filter(transaction => transaction != deletedTransaction.id)
        const updatePerson = {
            transactionLevelTwo: newPersonTransactions
        }
        await Individual.findByIdAndUpdate(person.id, updatePerson, {new : true})

        const newEstablismentTransactions = establishment.transactionLevelTwo.filter(transaction => transaction != deletedTransaction.id)
        const updateEstablishment = {
            transactionLevelTwo: newEstablismentTransactions
        }
        await Establishment.findByIdAndUpdate(establishment.id, updateEstablishment, {new : true})
    }
    
    //Delete level-3
        for (let index = 0; index < transactionLevelThree.length; index++) {
            const deletedTransaction = await TransactionLevelThree.findByIdAndDelete(transactionLevelThree[index].id)
            const person = await Individual.findById(deletedTransaction.person.toString())
            const establishment = await Establishment.findById(deletedTransaction.establishment.toString())
    
            const newPersonTransactions = person.transactionLevelThree.filter(transaction => transaction != deletedTransaction.id)
            const updatePerson = {
                transactionLevelThree: newPersonTransactions
            }
            await Individual.findByIdAndUpdate(person.id, updatePerson, {new : true})
    
            const newEstablismentTransactions = establishment.transactionLevelThree.filter(transaction => transaction != deletedTransaction.id)
            const updateEstablishment = {
                transactionLevelThree: newEstablismentTransactions
            }
            await Establishment.findByIdAndUpdate(establishment.id, updateEstablishment, {new : true})
        }
})




