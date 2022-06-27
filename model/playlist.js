import db from '../config/database.config.js';
import validateQueryParam from '../utils/validateQueryParam.js';
import { invalidQueryParamException } from './errors/handleErr.js';
('./error/handleErr.js');
import fld from '../db/fieldLists.js';
import generateId from '../utils/generateId.js';

class HandlePlaylist {
  // Fetch all playlist
  all = async (uid) => {
    if (!validateQueryParam(uid)) {
      throw invalidQueryParamException(null, uid);
    }
    const fetchAllPlaylists = await db.query(
      `SELECT * FROM playlists_lists WHERE ${fld.uid}=$1`,
      [uid]
    );
    return fetchAllPlaylists.rows;
  };

  // Add/create new playlist
  create = async ({ playlistId, uid, playlistName, description }) => {
    if (!validateQueryParam(playlistId) || !validateQueryParam(uid)) {
      throw invalidQueryParamException(null, `${uid} ${playlistId}`);
    }
    
    const createPlaylist = await db.query(
      `INSERT INTO playlists_lists (${fld.playlistId}, ${fld.uid}, ${fld.playlistName}, ${fld.description}, ${fld.totalItems}, ${fld.createdDate}) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        playlistId,
        uid,
        playlistName,
        description ? description : '',
        0,
        new Date(),
      ]
    );
    return createPlaylist.rowCount;
  };

  // Update playlist
  updatePlaylist = async ({ uid, playlistId, newPlaylist }) => {
    /**
     * @param {uid, playlistId, newPlaylist}
     * this method is used for rename the playlist
     * */
    if (!newPlaylist) {
      return;
    }
    const updatePlaylistName = await db.query(
      `UPDATE playlists_lists SET ${fld.playlistName}=$1, ${fld.description}=$2 WHERE ${fld.playlistId}=$3 AND ${fld.uid}=$4`,
      [newPlaylist.title, newPlaylist.description, playlistId, uid]
    );
    return updatePlaylistName.rowCount;
  };

  // Remove playlist with playlistId and uid
  remove = async ({ uid, playlistId }) => {
    if (!validateQueryParam(uid) || !validateQueryParam(playlistId)) {
      throw invalidQueryParamException();
    }
    const deleteContainItems = await db.query(
      `DELETE FROM playlist_items WHERE ${fld.playlistId}=$1 AND ${fld.uid}=$2`,
      [playlistId, uid]
    );
    const deletePlaylist = await db.query(
      `DELETE FROM playlists_lists WHERE ${fld.playlistId}=$1 AND ${fld.uid}=$2`,
      [playlistId, uid]
    );
    return Promise.all([deleteContainItems, deletePlaylist]);
  };

  allItems = async ({ uid, playlist_id }) => {
    if (!validateQueryParam(uid) || !validateQueryParam(playlist_id)) {
      throw invalidQueryParamException();
    }
    const fetchAllItems = await db.query(
      `SELECT * FROM playlist_items WHERE ${fld.playlistId}=$1 AND ${fld.uid}=$2 ORDER BY added_date DESC`,
      [playlist_id, uid]
    );
    return fetchAllItems.rows;
  };

  addItem = async ({
    playlistItemId,
    playlistId,
    uid,
    playlistItemName,
    mediaType,
    duration,
    releaseDate,
    posterURL,
  }) => {
    if (
      !validateQueryParam(playlistItemId) ||
      !validateQueryParam(playlistId) ||
      !validateQueryParam(uid)
    ) {
      throw invalidQueryParamException();
    }
    const isItemAlreadyExist = await this.#findItem({
      playlistId,
      itemId: playlistItemId,
    });
    if (isItemAlreadyExist !== undefined) {
      throw new Error(`This item is already exist`);
    }
    const id = generateId();
    const addItem = await db.query(
      `INSERT INTO playlist_items (id, ${fld.playlistItemsId}, ${fld.playlistId}, ${fld.uid}, ${fld.playlistItemName}, ${fld.mediaType}, ${fld.posterURL}, ${fld.duration}, ${fld.releasedDate}, ${fld.addedDate}) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        playlistItemId,
        playlistId,
        uid,
        playlistItemName,
        mediaType,
        posterURL,
        duration,
        releaseDate,
        new Date(),
      ]
    );
    if (addItem.rowCount > 0) {
      const totalCount = await this.#getTotalItemFromPlaylist({
        uid,
        playlistId,
      });
      const incTotalCount = await this.#updateTotalCount({
        uid,
        playlistId,
        value: +totalCount + 1,
      });
      await this.addRemovePlaylistLikedItems({
        uid,
        itemsId: playlistItemId,
        isLiked: 'true',
      });
      return incTotalCount;
    }
    throw new Error(`Can't add item to playlist`);
  };

  removeItem = async ({ uid, playlistId, itemsId }) => {
    if (
      !validateQueryParam(uid) ||
      !validateQueryParam(playlistId) ||
      !validateQueryParam(itemsId)
    ) {
      throw invalidQueryParamException();
    }
    const removeItem = await db.query(
      `DELETE FROM playlist_items WHERE ${fld.playlistItemsId}=$1 AND ${fld.playlistId}=$2 AND ${fld.uid}=$3`,
      [itemsId, playlistId, uid]
    );
    if (removeItem.rowCount > 0) {
      const totalCount = await this.#getTotalItemFromPlaylist({
        playlistId,
        uid,
      });
      await this.#updateTotalCount({
        uid,
        playlistId,
        value: +totalCount - 1,
      });
      return removeItem;
    }
  };

  removeAllItem = async ({uid, playlist_id}) => {
    if(!validateQueryParam(uid) || !validateQueryParam(playlist_id)){
      throw invalidQueryParamException();
    }
    try {
      const startRemove = await db.query(`DELETE FROM playlist_items WHERE ${fld.uid}=$1 AND ${fld.playlistId}=$2`, [uid, playlist_id]);
      await this.#updateTotalCount({uid, playlistId: playlist_id, value: 0})
      if(startRemove.rowCount > 0){
        return true;
      }
      return false;
    }
    catch(error){
      console.log('This error from Playlist > removeAllItem()');
      console.log(error)
      return false;
    }
  }

  addRemovePlaylistLikedItems = async ({ uid, itemId, isLiked }) => {
    if (!['true', 'false', 'NULL'].some((t) => t === isLiked)) {
      throw new Error('Something went wrong');
    }
    if (!uid || !itemId) {
      console.log(uid, itemId);
      throw new Error('User information is missing');
    }

    if (!validateQueryParam(uid) || !validateQueryParam(itemId)) {
      throw invalidQueryParamException();
    }

    const addLike = await db.query(
      `UPDATE playlist_items SET ${fld.isLiked}=$1 WHERE ${fld.uid}=$2 AND ${fld.playlistItemsId}=$3`,
      [isLiked, uid, itemId]
    );
    const addLikeToWatchlist = await db.query(
      `UPDATE watch_list SET ${fld.isLiked}=$1 WHERE ${fld.uid}=$2 AND ${fld.itemKey}=$3`,
      [isLiked, uid, itemId]
    );
    return addLike.rowCount || addLikeToWatchlist.rowCount;
  };

  #findItem = async ({ playlistId, itemId }) => {
    if (!validateQueryParam(playlistId) || !validateQueryParam(itemId)) {
      throw invalidQueryParamException();
    }
    const findItem = await db.query(
      `SELECT * FROM playlist_items WHERE ${fld.playlistItemsId}=$1 AND ${fld.playlistId}=$2`,
      [itemId, playlistId]
    );
    return findItem.rows[0]
  };
  #updateTotalCount = async ({ uid, playlistId, value }) => {
    const decTotalCount = await db.query(
      `UPDATE playlists_lists SET ${fld.totalItems}=$1 WHERE ${fld.playlistId}=$2 AND ${fld.uid}=$3`,
      [value, playlistId, uid]
    );
    decTotalCount.rowCount;
  };

  #getTotalItemFromPlaylist = async ({ uid, playlistId }) => {
    const playlist = await db.query(
      `SELECT DISTINCT ${fld.totalItems} FROM playlists_lists WHERE ${fld.playlistId}=$1 AND ${fld.uid}=$2`,
      [playlistId, uid]
    );
    return playlist.rows[0].total_items;
  };
}

const Playlist = new HandlePlaylist();
export default Playlist;
