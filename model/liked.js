const fld = require('../db/fieldLists.js');
const db = require('../config/database.config.js');
const validateQueryParam = require('../utils/validateQueryParam.js');
const invalidQueryParamException = require('./errors/handleErr.js');

class HandleLiked {
  
  all = async (uid) => {
    if (!validateQueryParam(uid)) {
      throw invalidQueryParamException();
    }
    const likedList = await db.query(
      `SELECT * FROM liked WHERE ${fld.uid}=$1 ORDER BY ${fld.likedDate} DESC`,
      [uid]
    );
    return likedList.rows;
  };

  async allWithLimit({ uid, limit }) {
    if (!validateQueryParam(uid) || !validateQueryParam(limit)) {
      throw invalidQueryParamException();
    }

    const likedList = await db.query(
      `SELECT id, ${fld.likedId}, ${fld.title}, ${fld.mediaType}, ${fld.posterURL} FROM liked WHERE ${fld.uid}=$1 ORDER BY ${fld.likedDate} DESC LIMIT ${limit}`,
      [uid]
    );
    return likedList.rows;
  }

  add = async ({
    id,
    uid,
    likedId,
    title,
    posterURL,
    duration,
    releaseDate,
    mediaType,
  }) => {
    if (
      !id ||
      !uid ||
      !likedId ||
      !title ||
      !posterURL ||
      !duration ||
      !releaseDate ||
      !mediaType
    ) {
      throw 'Some information is missing';
    }
    const isAlreadyLiked = await this.find({ uid, likedId });
    if (isAlreadyLiked) {
      throw `${title} is already you liked`;
    }
    const addLike = await db.query(
      `INSERT INTO liked (id, ${fld.likedId}, ${fld.uid}, ${fld.title}, ${fld.posterURL}, ${fld.duration}, ${fld.releasedDate}, ${fld.mediaType}, ${fld.likedDate}) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        likedId,
        uid,
        title,
        posterURL,
        duration,
        releaseDate,
        mediaType,
        new Date(),
      ]
    );
    return addLike.rowCount;
  };

  remove = async ({ uid, likedId }) => {
    if (!validateQueryParam(uid) || !validateQueryParam(likedId)) {
      throw invalidQueryParamException();
    }
    const removeLikedItem = await db.query(
      `DELETE FROM liked WHERE ${fld.uid}=$1 AND ${fld.likedId}=$2`,
      [uid, likedId]
    );
    return removeLikedItem.rowCount;
  };

  find = async ({ uid, likedId }) => {
    if (!validateQueryParam(uid) || !validateQueryParam(likedId)) {
      throw invalidQueryParamException();
    }
    const res = await db.query(
      `SELECT * FROM liked WHERE ${fld.uid}=$1 AND ${fld.likedId}=$2`,
      [uid, likedId]
    );
    return res.rows[0];
  };

  count = async (uid) => {
    if (!validateQueryParam(uid)) {
      throw invalidQueryParamException(null, uid);
    }
    const count = await db.query(
      `SELECT COUNT(id) AS total_item FROM liked WHERE ${fld.uid}=$1`,
      [uid]
    );
    return count.rows;
  };
}

const Like = new HandleLiked();
module.exports = Like;
