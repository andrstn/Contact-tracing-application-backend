const schedule = require('node-schedule');
const Individual = require('../../models/Individuals/individual')


schedule.scheduleJob('checkStatusUpdate','0 0 * * *', async (request, response) =>{
    const body = request.body
    const seconds = (Math.round((new Date()).getTime() / 1000)) - 1296000


    const i = await Individual.find({})
    .where(lastModified).lt(seconds)

    for (let index = 0; index < i.length; index++) {
        if(i[index].status === 'low' || 'mid' || 'high'){
            const person = {
                status: 'negative'
            }
            try {
                const updatedProfile = await Individual.findByIdAndUpdate(request.params.id, person, { new: true })
                  response.status(201).json(updatedProfile)
            } catch (error) {
                return response.status(401).json({
                     error: 'Failed to update status.'
                })
            }
        } 
    }
})




