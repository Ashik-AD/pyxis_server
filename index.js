import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import route from './routes/route.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
route(app);

const server = http.createServer(app);
const PORT = process.env.PORT || 9000;
server.listen(PORT, console.log(`Server is running on Port: ${PORT}`));
