import { MovieDb } from 'moviedb-promise';
const movieDb = new MovieDb(process.env.API_KEY);
export default movieDb;
