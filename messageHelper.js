// messageHelper.js
const axios = require('axios');
require('dotenv').config();

const listInteractiveObject = {
  type: 'list',
  header: { type: 'text', text: 'Select a Shrimp Pot item to order' },
  body: { text: 'Choose from our delicious menu' },
  footer: { text: 'All items are freshly prepared' },
  action: {
    button: 'Order',
    sections: [
      {
        title: 'Shrimp Pot Menu',
        rows: [
          { id: '1', title: 'Shrimp Pot Classic', description: 'AED 49.99' },
          { id: '2', title: 'Shrimp Pot Spicy', description: 'AED 59.99' }
        ]
      }
    ]
  }
};

async function sendInteractiveList(recipient, phoneNumberId) {
  const messageObject = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipient,
    type: 'interactive',
    interactive: listInteractiveObject
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/${process.env.VERSION}/${phoneNumberId}/messages`,
      messageObject,
      { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
    );
    console.log('Interactive list sent successfully:', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.error('Error sending interactive list:', JSON.stringify(error.response?.data, null, 2) || error.message);
    throw error;
  }
}

module.exports = { sendInteractiveList };