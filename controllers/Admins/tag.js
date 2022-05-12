const handler = require('express').Router()
const Individual = require('../../models/Individuals/individual')
const TransactionLevelOne = require('../../models/Transactions/transaction-level-1')
const TransactionLevelTwo = require('../../models/Transactions/transaction-level-2')
const TransactionLevelThree = require('../../models/Transactions/transaction-level-3')
const AdminUser = require('../../models/Users/admin-user')
const decode = require('../../utils/decodeToken')


handler.put('/:id', async (request, response) => {
    const decodedToken = decode.decodeToken(request)

    const adminUser = await AdminUser.findById(decodedToken.id)
    if (!adminUser) {
        return response.status(401).json({
            error: 'Unauthorized user.'
        })
    }

    const initialPerson = await Individual.findById(request.params.id)
        .populate({
            path: 'transactionLevelOne',
            select: {
            establishment: 1,
            date: 1,
            status: 1,
            login: 1,
            logout: 1
            },
            model: TransactionLevelOne
        })
        .populate({
            path: 'transactionLevelTwo',
            select: {
            establishment: 1,
            date: 1,
            status: 1,
            login: 1,
            logout: 1
            },
            model: TransactionLevelTwo
        })
        .populate({
            path: 'transactionLevelThree',
            select: {
            establishment: 1,
            date: 1,
            status: 1,
            login: 1,
            logout: 1
            },
            model: TransactionLevelThree
        })
       
    if (!initialPerson) {
        return response.status(401).json({
            error: 'Invalid person ID.'
        })
    }
    
    // 1209600 is equivalent to 14 days
    const start = Math.round((new Date()).getTime() / 1000) - 1209600

    const first = initialPerson.transactionLevelOne.filter(transaction => transaction.login > start)
    const second = initialPerson.transactionLevelTwo.filter(transaction => transaction.login > start)
    const third = initialPerson.transactionLevelThree.filter(transaction => transaction.login > start)

    const entrance = async (login) => {
        for (let iLogin = 0; iLogin < login.length; iLogin++) {
            const person = await Individual.findById(login[iLogin].person)
            if (person.status !== 'positive') {
                const update = {
                    status: 'high'
                }
                await Individual.findByIdAndUpdate(person.id, update, { new: true })
            }
        }
    }

    const exit = async (logout) => {
        for (let iLogout = 0; iLogout < logout.length; iLogout++) {
            const person = await Individual.findById(logout[iLogout].person)
            const update = {
                status: 'high'
            }
            if (person.status !== 'positive') {
                await Individual.findByIdAndUpdate(person.id, update, { new: true })
            }             
        }
    }

    if (first.length > 0) {
        for (let iFirst = 0; iFirst < first.length; iFirst++) {
            
            let login = await TransactionLevelOne.find({ establishment: first[iFirst].establishment }).where('login').gt(first[iFirst].login - 60).lt(first[iFirst].login + 60)
            let logout = await TransactionLevelOne.find({ establishment: first[iFirst].establishment }).where('logout').gt(first[iFirst].logout - 60).lt(first[iFirst].logout + 60)
            
            login = login.filter(transaction => transaction.id !== first[iFirst].id)
            logout = logout.filter(transaction => transaction.id !== first[iFirst].id)

            entrance(login)
            exit(logout)

            const inner1 = await TransactionLevelOne.find({ establishment: first[iFirst].establishment })
                .where('login').gt(first[iFirst].login).lt(first[iFirst].logout)

            const inner2 = await TransactionLevelOne.find({ establishment: first[iFirst].establishment })
                .where('logout').gt(first[iFirst].login).lt(first[iFirst].logout)

            let inner = inner1.filter(transaction => !inner2.includes(transaction)).concat(inner2)

            inner = inner.filter(transaction => transaction.id !== first[iFirst].id)

            for (let iInner = 0; iInner < inner.length; iInner++) {
                const person = await Individual.findById(inner[iInner].person)
                const update = {
                    status: 'low'
                }                
                if (person.status === 'negative') {
                    await Individual.findByIdAndUpdate(person.id, update, { new: true })
                }
            }
        }
    }

    if (second.length > 0) {
        for (let iSecond = 0; iSecond < second.length; iSecond++) {

            let login = await TransactionLevelTwo.find({ establishment: second[iSecond].establishment }).where('login').gt(second[iSecond].login - 60).lt(second[iSecond].login + 60)
            let logout = await TransactionLevelTwo.find({ establishment: second[iSecond].establishment }).where('logout').gt(second[iSecond].logout - 60).lt(second[iSecond].logout + 60)

            login = login.filter(transaction => transaction.id !== second[iSecond].id)
            logout = logout.filter(transaction => transaction.id !== second[iSecond].id)

            entrance(login)
            exit(logout)

            const inner1 = await TransactionLevelTwo.find({ establishment: second[iSecond].establishment })
                .where('login').gt(second[iSecond].login).lt(second[iSecond].logout)

            const inner2 = await TransactionLevelTwo.find({ establishment: second[iSecond].establishment })
                .where('logout').gt(second[iSecond].login).lt(second[iSecond].logout)

            let inner = inner1.filter(transaction => !inner2.includes(transaction)).concat(inner2)

            inner = inner.filter(transaction => transaction.id !== second[iSecond].id)
            
            for (let iInner = 0; iInner < inner.length; iInner++) {
                const person = await Individual.findById(inner[iInner].person)
                const update = {
                    status: 'mid'
                }
                if (person.status === 'negative' || person.status === 'low') {
                    await Individual.findByIdAndUpdate(person.id, update, { new: true })
                }
            }
        }
    }

    if (third.length > 0) {
        for (let iThird = 0; iThird < third.length; iThird++) {
            
            let login = await TransactionLevelThree.find({ establishment: third[iThird].establishment }).where('login').gt(third[iThird].login - 60).lt(third[iThird].login + 60)
            let logout = await TransactionLevelThree.find({ establishment: third[iThird].establishment }).where('logout').gt(third[iThird].logout - 60).lt(third[iThird].logout + 60)
            
            login = login.filter(transaction => transaction.id !== third[iThird].id)
            logout = logout.filter(transaction => transaction.id !== third[iThird].id)

            entrance(login)
            exit(logout)

            const inner1 = await TransactionLevelThree.find({ establishment: third[iThird].establishment })
                .where('login').gt(third[iThird].login).lt(third[iThird].logout)

            const inner2 = await TransactionLevelThree.find({ establishment: third[iThird].establishment })
                .where('logout').gt(third[iThird].login).lt(third[iThird].logout)

            let inner = inner1.filter(transaction => !inner2.includes(transaction)).concat(inner2)

            inner = inner.filter(transaction => transaction.id !== third[iThird].id)

            for (let iInner = 0; iInner < inner.length; iInner++) {
                const person = await Individual.findById(inner[iInner].person)
                const update = {
                    status: 'high'
                }
                if (person.status !== 'positive' || person.status !== 'high') {
                    await Individual.findByIdAndUpdate(person.id, update, { new: true })
                }
            }
        }
    }

    const tag = {
        status: 'positive'
    }

    await Individual.findByIdAndUpdate(request.params.id, tag, { new: true })

    return response.status(200).json({
        message: `Tagged ${initialPerson.id} as positive`
    })
})

module.exports = handler