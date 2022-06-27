const mdb = require("../config/movieDb.config.js");

const movieAndTvGenres = async (req, res, next) => {
    try {
      const mv = await mdb.genreMovieList();
      const tv = await mdb.genreTvList();
      res.send({ movie_genre: mv.genres, tv_genre: tv.genres });
    } catch (err) {
      res.status(400).send('Something went wrong');
    }
}
module.exports = movieAndTvGenres