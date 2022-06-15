const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './src/config/config.env' });

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  mongoURI: process.env.MONGO_URI,
  jwt_secret: process.env.JWT_SECRET,
  jwt_expiry: process.env.JWT_EXPIRY,
  jwt_cookie_expiry: process.env.JWT_COOKIE_EXPIRY,
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMIAN,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloud_api_key: process.env.CLOUDINARY_API_KEY,
  cloud_api_secret: process.env.CLOUDINARY_API_SECRET,
  mail_username: process.env.MAIL_USERNAME,
  mail_password: process.env.MAIL_PASSWORD,
  oauth_client_id: process.env.OAUTH_CLIENT_ID,
  oauth_client_secret: process.env.OAUTH_CLIENT_SECRET,
  oauth_refresh_token: process.env.OAUTH_REFRESH_TOKEN,
  key: 'kikathriftstore@gmail.com'
 };


