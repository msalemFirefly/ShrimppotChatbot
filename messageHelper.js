// messageHelper.js

const axios = require('axios');
require('dotenv').config();

// const listInteractiveObject = {
//   type: 'list',
//   header: { type: 'text', text: 'Welcome To Shrimp Pot UAE! 🦐 ' },
//   body: { text: 'Choose from our delicious menu' },
//   footer: { text: 'All items are freshly prepared' },
//   action: {
//     button: 'Browse Catalogue',
//     sections: [
//       {
//         title: 'Shrimp Pot Menu',
//         rows: [
//           { id: '1', title: 'Shrimp Pot Classic', description: 'AED 49.99' },
//           { id: '2', title: 'Shrimp Pot Spicy', description: 'AED 59.99' }
//         ]
//       }
//     ]
//   }
// };

const productInteractiveObject = {
  type: 'product_list', 
  header: { type:'text', text: 'Our Featured Products' },
  body: { text: 'Check out these great items!' }, 
  action: { 
      catalog_id:process.env.CATALOGUE_ID,
      sections: [
        {
          title:'Main Collection',
          product_items: [
            { product_retailer_id : '5w2n3c7h5w' },
            { product_retailer_id : 'qiav8duzuu' },
          ]
        }
      ]
   }
};

async function sendMPCatalogue(recipient){
  const version = process.env.VERSION || 'v22.0'

  const messageObject = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipient,
    type: 'interactive',
    interactive:productInteractiveObject
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
      messageObject,
      { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
    );
    console.log('Multi Product list sent successfully ✨:', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.error('Error sending multi product list ☄️:', JSON.stringify(error.response?.data, null, 2) || error.message);
    throw error;
  }

}

// async function sendInteractiveList(recipient, phoneNumberId) {
//   const messageObject = {
//     messaging_product: 'whatsapp',
//     recipient_type: 'individual',
//     to: recipient,
//     type: 'interactive',
//     interactive: listInteractiveObject
//   };

//   try {
//     const response = await axios.post(
//       `https://graph.facebook.com/${process.env.VERSION}/${phoneNumberId}/messages`,
//       messageObject,
//       { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
//     );
//     console.log('Interactive list sent successfully ✨:', JSON.stringify(response.data, null, 2));
//     return response;
//   } catch (error) {
//     console.error('Error sending interactive list ☄️:', JSON.stringify(error.response?.data, null, 2) || error.message);
//     throw error;
//   }
// }

module.exports = { sendMPCatalogue };