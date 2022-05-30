const schedule = require('node-schedule');
const Individual = require('../../models/Individuals/individual')
const logger = require('../../utils/logger')

schedule.scheduleJob('untag','0 0 * * *', async (request, response) =>{
    const seconds = (Math.round((new Date()).getTime() / 1000)) - 1296000

    const i = await Individual.find({})
    .where('lastModified').lt(seconds)

    for (let index = 0; index < i.length; index++) {
        if(i[index].status === 'low' || 'mid' || 'high'){
            const person = {
                status: 'negative'
            }
            try {
                const updatedProfile = await Individual.findByIdAndUpdate(i[index].id, person, { new: true })
                console.log(updatedProfile);
            } catch (error) {
                logger.error('Failed to auto-untag.')
            }
        } 
    }
})




