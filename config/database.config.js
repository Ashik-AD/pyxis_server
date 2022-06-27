const dotenv =  require('dotenv');
dotenv.config();

const postgres = require('pg');
const {Pool} = postgres;
const pool = new Pool({connectionString: process.env.DATABASE_URL});
module.exports =  pool;
