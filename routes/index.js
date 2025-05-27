// routes/index.js
const express = require('express');
const router = express.Router();
const { sendInteractiveList } = require('../messageHelper');
const axios = require('axios');

router.post('/webhook', async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (message) {
    const fromNumber = message.from;
    const phoneNumberId = process.env.PHONE_NUMBER_ID;

    if (message.type === 'text' && message.text?.body.toLowerCase() === 'menu') {
      try {
        await sendInteractiveList(fromNumber, phoneNumberId);
      } catch (error) {
        console.error('Error sending interactive list:', error.message);
      }
    } else {
      try {
        await sendTextMessage(fromNumber, phoneNumberId, 'Please type "menu" to see our Shrimp Pot items.');
      } catch (error) {
        console.error('Error sending text message:', error.message);
      }
    }
  }
  res.sendStatus(200);
});

router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFICATION_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

async function sendTextMessage(recipient, phoneNumberId, text) {
  const messageObject = {
    messaging_product: 'whatsapp',
    to: recipient,
    type: 'text',
    text: { body: text }
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/${process.env.VERSION}/${phoneNumberId}/messages`,
      messageObject,
      { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
    );
    console.log('Text message sent successfully:', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.error('Error sending text message:', JSON.stringify(error.response?.data, null, 2) || error.message);
    throw error;
  }
}

module.exports = router;