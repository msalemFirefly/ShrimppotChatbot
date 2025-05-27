// sendTestMessage.js
const axios = require('axios');
require('dotenv').config();

const accessToken = process.env.ACCESS_TOKEN;
const apiVersion = process.env.VERSION;
const recipientNumber = process.env.RECIPIENT_PHONE_NUMBER;
const phoneNumberId = process.env.PHONE_NUMBER_ID;

async function sendTestMessage() {
  const messageObject = {
    messaging_product: 'whatsapp',
    to: recipientNumber,
    type: 'text',
    text: {
      body: 'This is a test message from Shrimp Pot Shop. Reply with "menu" to see our offerings!'
    }
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      messageObject,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Test message sent successfully:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error sending test message:', JSON.stringify(error.response?.data, null, 2) || error.message);
  }
}

sendTestMessage();