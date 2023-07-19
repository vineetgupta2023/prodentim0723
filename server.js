const express = require('express')
const path = require('path')
const fetch = require('node-fetch')
const app = express()
var exphbs  = require('express-handlebars');
var price = 294

const base = "https://api-m.sandbox.paypal.com";


require('dotenv').config();
const {PORT, CLIENT_ID, APP_SECRET } = process.env;

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, "static")))

// parse post params sent in body in json format
app.use(express.json());

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/checkout/:code', (req, res) => {
  //res.sendFile(path.join(__dirname, "public/checkout.html"))
  price = req.params.code
  res.render('checkout')
})

app.post("/my-server/create-paypal-order", async (req, res) => {
  try {
    const order = await createOrder();
    res.json(order);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/my-server/capture-paypal-order", async (req, res) => {
  const { orderID } = req.body;
  try {
    const captureData = await capturePayment(orderID);
    res.json(captureData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/thanks', (req, res) => {
    res.render('thanks')
})


app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`)
})


async function createOrder() {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: price,
          },
        },
      ],
    }),
  });

  return handleResponse(response);
}


async function capturePayment(orderId) {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return handleResponse(response);
}

async function generateAccessToken() {
  //console.log("hhan G" + CLIENT_ID)
  const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const jsonData = await handleResponse(response);
  return jsonData.access_token;
}


async function handleResponse(response) {
  if (response.status === 200 || response.status === 201) {
    return response.json();
  }

  const errorMessage = await response.text();
  throw new Error(errorMessage);
}