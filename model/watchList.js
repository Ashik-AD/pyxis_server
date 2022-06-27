import fld from '../db/fieldLists.js';
import db from '../config/database.config.js';
import validateQueryParam from '../utils/validateQueryParam.js';
import { invalidQueryParamException } from './errors/handleErr.js';
import generateId from '../utils/generateId.js';

class HandleWatchList {
  async all(uid) {
    if (!validateQueryParam(uid)) {
      throw invalidQueryParamException(null, `user id: ${uid}`);
    }
    const qr = await db.query(
      `SELECT * FROM watch_list WHERE ${fld.uid}=$1 ORDER BY ${fld.addedDate} DESC`,
      [uid]
    );
    return qr.rows;
  }
  async withLimit({ uid, limit }) {
    if (!validateQueryParam(uid) || !validateQueryParam(limit)) {
      throw invalidQueryParamException(null, `${uid} and ${limit}`);
    }
    const qr = await db.query(
      `SELECT * FROM watch_list WHERE ${fld.uid}=$1 ORDER BY ${fld.addedDate} DESC LIMIT ${limit}`,
      [uid]
    );
    return qr.rows;
  }

  async add({
    uid,
    item_key,
    title,
    average_vote,
    media_type,
    poster_path,
    duration,
    is_liked,
    release_date,
  }) {
    if (!validateQueryParam(item_key) || !validateQueryParam(uid)) {
      throw invalidQueryParamException();
    }
    const isItemAlreadyExist = await this.#find({ uid, item_key });
    if (isItemAlreadyExist.length > 0) {
      return `${title} is already in your watch list`;
    }
    // Generate ID for the item
    const id = generateId();
    
    const qr = await db.query(
      `INSERT INTO watch_list (id, ${fld.itemKey}, ${fld.uid}, ${fld.title}, ${fld.posterURL}, ${fld.duration}, ${fld.releasedDate}, ${fld.mediaType}, ${fld.avg_vote}, ${fld.isLiked}, ${fld.addedDate}) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        id,
        item_key,
        uid,
        title,
        poster_path,
        duration,
        release_date,
        media_type,
        average_vote,
        is_liked,
        new Date(),
      ]
    );
    return qr.rowCount;
  }

  async remove({ uid, item_key }) {
    if (!validateQueryParam(uid) || !validateQueryParam(item_key)) {
      throw invalidQueryParamException(null, `${uid} ${item_key}`);
    }

    const qr = await db.query(
      `DELETE FROM watch_list WHERE ${fld.uid}=$1 AND ${fld.itemKey}=$2`,
      [uid, item_key]
    );
    return qr.rowCount;
  }

  async #find({ uid, item_key }) {
    if (!validateQueryParam(uid) || !validateQueryParam(item_key)) {
      throw invalidQueryParamException(null, `${uid} and ${item_key}`);
    }

    const qr = await db.query(
      `SELECT id FROM watch_list WHERE ${fld.uid}=$1 AND ${fld.itemKey}=$2`,
      [uid, item_key]
    );
    return qr.rows;
  }

  async count(uid) {
    if (!validateQueryParam(uid)) {
      throw invalidQueryParamException(null, uid);
    }

    const count = await db.query(
      `SELECT COUNT(id) AS total_item FROM watch_list WHERE ${fld.uid}=$1`,
      [uid]
    );
    return count.rows;
  }
}
const WatchList = new HandleWatchList();
export default WatchList;
