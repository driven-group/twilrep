const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', (req, res) => {
  console.log(req.body)
  const twiml = new MessagingResponse();

  twiml.message('Thank you for your message. This number is automated and will not reply, please call directly: \n+61861866777\nOr contact us via our website with any queries.\nhttps://yourcarsold.com.au');

  res.type('text/xml').send(twiml.toString());
});

app.listen(3000, () => {
  console.log('Express server listening on port 3000');
});