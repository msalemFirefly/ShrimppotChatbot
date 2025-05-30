// routes/index.js
const express = require('express');
const router = express.Router();
const { sendInteractiveList, sendMPCatalogue } = require('../messageHelper');
const axios = require('axios');

router.post('/webhook', async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (message) {
    const fromNumber = message.from;
    const phoneNumberId = process.env.PHONE_NUMBER_ID;

    if (message.type === 'text' && message.text?.body.toLowerCase() === 'menu') {
      try {
      // TODO: add items to cart in database
        await sendInteractiveList(fromNumber, phoneNumberId);
      } catch (error) {
        console.error('Error sending interactive list:', error.message);
      }
    } 

    else if (message.type === 'text' && message.text?.body.toLowerCase() === 'add more') {
      try {
        await sendInteractiveList(fromNumber, phoneNumberId);
      // TODO: add items to cart in database
      } catch (error) {
        console.error('Error sending interactive list:', error.message);
      }
    }
    
    else if (message.type === 'text' && message.text?.body.toLowerCase() === 'checkout') {
      try {
        // TODO: add items to cart in database
        await sendTextMessage(fromNumber, phoneNumberId, 'TODO: Generates a payment gateway.');
      } catch (error) {
        console.error('Error sending interactive list:', error.message);
      }
    }

    else {
      try {
        //await sendTextMessage(fromNumber, phoneNumberId, 'Please type "menu" to see our Shrimp Pot items.');
        // TODO: Do you want to add more? / Payment Gateway
        await sendTextMessage(fromNumber, phoneNumberId, 'Would you like add more items to your cart or procceed to checkout?\n Type "add more" / "checkout".');
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