import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import logger from 'morgan';
import route from './routes/route.js';
import Schema from './db/schema.js';
import pool from './config/database.config.js';
dotenv.config();

const app = express();
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
route(app);

// await Schema.user();
// await Schema.liked();
// await Schema.playlistsList();
// await Schema.playlistItems();
// await Schema.watchList();

const server = http.createServer(app);
const PORT = process.env.port || process.env.SERVER_PORT;
server.listen(PORT, console.log(`Server is running on Port: ${PORT}`));
