const nodemailer = require('nodemailer')
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const { 
    mail_username,
    mail_password,
    oauth_client_id,
    oauth_client_secret,
    oauth_refresh_token
} = require('../config');

const oauth2Client = new OAuth2(
    oauth_client_id,
    oauth_client_secret,
   "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({refresh_token:oauth_refresh_token});
oauth2Client.refreshAccessToken(function(err, tokens) {
    if(err) console.log("ERROR", err)
})

const accessToken = oauth2Client.getAccessToken()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: mail_username,
      pass: mail_password,
      clientId: oauth_client_id,
      clientSecret: oauth_client_secret,
      refreshToken:  oauth_refresh_token,
      accessToken: accessToken
    },
    tls: {
        rejectUnauthorized: false
      }
  })


module.exports = { transporter };

