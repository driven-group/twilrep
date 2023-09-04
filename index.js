require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const { createClient } = require('@supabase/supabase-js')
const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleSecret = process.env.SUPABASE_SERVICE_KEY
const supabase = createClient(supabaseUrl, serviceRoleSecret, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

const logReply = async (req) => {
  console.log(req.body)
  const { error } = await supabase
      .from('sms')
      .insert({
        from: req.body.From,
        message: req.body.Body
      })
      .then((response) => {
          console.log(response.status)
          return response.status
      })
      .catch((error) => {
          console.log(error)
          return error
      })
}

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', (req, res) => {
  logReply(req)
  const twiml = new MessagingResponse();

  twiml.message('Thank you for your message. This number is automated and will not reply, please call directly: \n+61861866777\nOr contact us via our website with any queries.\nhttps://yourcarsold.com.au');

  res.type('text/xml').send(twiml.toString());
});

app.listen(3000, () => {
  console.log('Express server listening on port 3000');
});