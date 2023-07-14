const express = require('express')
const path = require('path')
const app = express()
var exphbs  = require('express-handlebars');

require('dotenv').config();
const port = process.env.PORT

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, "static")))

app.get('/', (req, res) => {
  res.render('home')
})


app.get('/checkout/:code', (req, res) => {
  //res.sendFile(path.join(__dirname, "public/checkout.html"))
  res.render('checkout', {
    code: req.params.code
  })
})

app.get('/thanks', (req, res) => {
    res.render('thanks')
})



app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})