const { MovieDb } = require('moviedb-promise');
const movieDb = new MovieDb(process.env.API_KEY);
module.exports= movieDb;
