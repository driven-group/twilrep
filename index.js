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

function getCurrentTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

const logFeed = async (name, msg) => {
    const timestamp = getCurrentTimestamp();
    const logMessage = `${timestamp} - ${msg}`;
    console.log(logMessage);
    
    try {
        const { error } = await supabase
            .from('external_logs')
            .insert([
                { process_name: name, message: msg },
            ]);
        if (error) { 
            console.log(`${timestamp} - Database log error:`, error);
        }
    } catch (err) {
        console.log(`${timestamp} - Failed to log to database:`, err.message);
    }
};

const logReply = async (req) => {
  console.log(req.body)
  logFeed('Twilio SMS', `Received message from ${req.body.From}: ${req.body.Body}`);
  const { data, error } = await supabase
    .from('sms')
    .insert({
      from: req.body.From,
      message: req.body.Body
    })
    if (error) {
      console.log('SB Error:', error)
      logFeed('Twilio SMS', `Failed to log SMS to database: ${error.message}`);
    } else {
      console.log('SB Res:', data)
      logFeed('Twilio SMS', `Logged SMS to database successfully: ${JSON.stringify(data)}`);
    }
}

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', (req, res) => {
  logReply(req)
  logFeed('Twilio SMS', `Received message from ${req.body.From}: ${req.body.Body}`);
  const twiml = new MessagingResponse();

  twiml.message('Thank you for your message. This number is automated and will not reply, please call directly: \n+61861866777\nOr contact us via our website with any queries.\nhttps://yourcarsold.com.au');

  res.type('text/xml').send(twiml.toString());
});

app.listen(3000, () => {
  console.log('Express server listening on port 3000');
  logFeed('Twilio SMS', 'Express server started on port 3000');
});