/*
NEXMO
*/
require('dotenv').config()

const apiKey = process.env.VONAGE_API_KEY
const apiSecret = process.env.VONAGE_API_SECRET
// const number = process.env.VONAGE_NUMBER


const Vonage = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: apiKey,
  apiSecret: apiSecret
})
 function sendTextMessage(messages, number){

    const from = "Vonage APIs"
    const to = number
    const text = messages

    vonage.message.sendSms(from, to, text, (err, responseData) => {
        if (err) {
            console.log(err);
        } else {
            if(responseData.messages[0]['status'] === "0") {
                console.log("Message sent successfully.");
            } else {
                console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
            }
        }
    })

}

module.exports = {
  sendTextMessage
}
