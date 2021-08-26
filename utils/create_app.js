const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { handleErrors } = require('./error_handling');

const api_url = process.env.API_URL;

const app = express();
app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use('/public/uploads', express.static(path.join(__dirname, '..', '/public/uploads')));
app.use(`${api_url}/products`, require('../routers/products'));
app.use(`${api_url}/categories`, require('../routers/categories'));
app.use(`${api_url}/orders`, require('../routers/orders'));
app.use(`${api_url}/users`, require('../routers/users'));
app.use(handleErrors);

module.exports = app;
