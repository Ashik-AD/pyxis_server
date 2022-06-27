const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
// import logger from 'morgan';
const routes =  require('./routes/route');
dotenv.config();

const app = express();
// app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
routes(app);

const server = http.createServer(app);
const PORT = process.env.port || 9000;
server.listen(PORT, console.log(`Server is running on Port: ${PORT}`));
