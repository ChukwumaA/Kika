const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
require('colors');

const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

const { env } = require('./config');

// Connect to database
connectDB();

const app = express();

// Route files
const auth = require('routes/auth');
const users = require('routes/users');
const products = require('routes/products');
const payments = require('routes/payments');
const orders = require('./routes/orders')

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (env === 'development') {
  app.use(morgan('dev'));
}

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder for uploads and others
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/products', products);
app.use('/api/v1/payments', payments);
app.use('/api/v1/orders', orders);


app.get('/', (req, res) =>
  res.status(202).send({ message: 'Welcome to Kika Store' })
);

app.use('**', (req, res) =>
  res.status(404).send({ message: 'Route not found' })
);

app.use(errorHandler);

module.exports = app;
