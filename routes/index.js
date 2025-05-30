// routes/index.js
const express = require('express');
const router = express.Router();
const { sendInteractiveList, sendMPCatalogue } = require('../messageHelper');
const axios = require('axios');

// ---------------------vars----------------------- //
const userCarts = {};
const userStates = {}; 

// ------------------------------------------------ //

router.post('/webhook', async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (message) {
    const fromNumber = message.from;
    const phoneNumberId = process.env.PHONE_NUMBER_ID;

    console.log('Received message:', JSON.stringify(message, null, 2));

    if (message.type === 'text' && message.text?.body.toLowerCase() === 'menu') {
      try {
        await sendTextMessage(fromNumber, phoneNumberId, '🦀 Welcome To Shrimp Pot UAE! 🦐\n Please view our catalogue.');
        await sendMPCatalogue(fromNumber);
      } catch (error) {
        console.error('Error sending interactive list:', error.message);
      }
    }

    else if (message.type === 'order') {
      try {
        const order = message.order;
        const selectedItems = order.product_items || [];
        const catalogId = order.catalog_id; // Get catalog ID from the order

        if (!userCarts[fromNumber]) {
          userCarts[fromNumber] = [];
        }

        // Fetch product details from the catalog
        const productDetails = await fetchProductDetails(catalogId, selectedItems.map(item => item.product_retailer_id));
        selectedItems.forEach((item, index) => {
          userCarts[fromNumber].push({
            product_retailer_id: item.product_retailer_id,
            product_name: productDetails[index]?.name || item.product_retailer_id, // Use name or fallback to ID
            quantity: item.quantity,
            item_price: item.item_price,
            currency: item.currency,
          });
        });

        console.log('Updated cart:', JSON.stringify(userCarts[fromNumber], null, 2));

        const addedItems = selectedItems.map((item, index) => `${productDetails[index]?.name || item.product_retailer_id} (Qty: ${item.quantity})`).join(', ');
        await sendTextMessage(fromNumber, phoneNumberId, `Added to cart: ${addedItems}\nWould you like to proceed to checkout? Type "yes"/"no"`);
        userStates[fromNumber] = 'awaiting_checkout'; // Set state to await checkout confirmation
      } catch (error) {
        console.error('Error handling order:', error.message);
      }
    }

    else if (message.type === 'text' && message.text?.body.toLowerCase() === 'yes') {
      try {
        if (userStates[fromNumber] === 'awaiting_checkout') {
          const cart = userCarts[fromNumber] || [];
          if (cart.length === 0) {
            await sendTextMessage(fromNumber, phoneNumberId, "Your cart is empty.\nType 'menu' to view our catalogue.");
          } else {
            let total = 0;
            const cartSummary = cart.map(item => {
              const itemTotal = item.quantity * item.item_price;
              total += itemTotal;
              return `${item.product_name} (Qty: ${item.quantity}) - ${item.item_price} ${item.currency} = ${itemTotal} ${item.currency}`;
            }).join('\n');
            await sendTextMessage(fromNumber, phoneNumberId, `Your Cart:\n${cartSummary}\nTotal: ${total} ${cart[0]?.currency || 'AED'}`);
            await sendTextMessage(fromNumber, phoneNumberId, 'TODO: Generates a payment gateway.');
          }
          delete userStates[fromNumber]; 
        } else {
          await sendTextMessage(fromNumber, phoneNumberId, 'Please select items from the catalogue first or use "menu" to start.');
        }
      } catch (error) {
        console.error('Error handling yes:', error.message);
      }
    }

    else if (message.type === 'text' && message.text?.body.toLowerCase() === 'no') {
      try {
        if (userStates[fromNumber] === 'awaiting_checkout') {
          await sendTextMessage(fromNumber, phoneNumberId, 'Checkout cancelled. Type "menu" to view our catalogue or add more items.');
          delete userStates[fromNumber]; // Clear state after processing
        } else {
          await sendTextMessage(fromNumber, phoneNumberId, 'Type "menu" to view our catalogue.');
        }
      } catch (error) {
        console.error('Error handling no:', error.message);
      }
    }

    else if (message.type === 'text') {
      try {
        await sendTextMessage(fromNumber, phoneNumberId, 'Type "menu" to view our catalogue.');
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

// New function to fetch product details from the catalog
async function fetchProductDetails(catalogId, productRetailerIds) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/${process.env.VERSION}/${catalogId}/products`,
      {
        headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` },
        params: {
          fields: 'id,name,retailer_id', // Request name and retailer_id
        }
      }
    );
    const products = response.data.data;
    return productRetailerIds.map(retailerId =>
      products.find(p => p.retailer_id === retailerId) || { name: retailerId }
    );
  } catch (error) {
    console.error('Error fetching product details:', error.message);
    return productRetailerIds.map(retailerId => ({ name: retailerId })); 
  }
}

module.exports = router;