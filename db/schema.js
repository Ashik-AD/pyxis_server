import db from '../config/database.config.js';
import fld from './fieldLists.js';

const Schema = {
  user: async () => {
    return await db.query(
      `CREATE TABLE users (${fld.uid} VARCHAR(255) PRIMARY KEY NOT NULL, ${fld.userName} VARCHAR(255) NOT NULL,${fld.email} VARCHAR(255) NOT NULL,${fld.password} VARCHAR(255) NOT NULL,${fld.dob} DATE NOT NULL,${fld.country} VARCHAR(100) NOT NULL,${fld.liked} VARCHAR(255) NOT NULL,${fld.watchList} VARCHAR(255) NOT NULL,${fld.playlists} VARCHAR(255) NOT NULL,${fld.joinedDate} TIMESTAMP NOT NULL)`
    );
  },

  liked: async () => {
    return await db.query(
      `CREATE TABLE liked (id VARCHAR(255) UNIQUE NOT NULL, ${fld.likedId} VARCHAR(255) NOT NULL, ${fld.uid} VARCHAR(255) NOT NULL, ${fld.title} VARCHAR(255) NOT NULL, ${fld.posterURL} VARCHAR(255) NOT NULL, ${fld.duration} FLOAT(10) NOT NULL, ${fld.mediaType} VARCHAR(10) NOT NULL, ${fld.releasedDate} VARCHAR(50) NOT NULL, ${fld.likedDate} TIMESTAMP NOT NULL, PRIMARY KEY (id), FOREIGN KEY (${fld.uid}) REFERENCES users(${fld.uid}))`
    );
  },

  playlistsList: async () => {
    return await db.query(
      `CREATE TABLE playlists_lists (${fld.playlistId} VARCHAR(255) PRIMARY KEY, ${fld.uid} VARCHAR(255) NOT NULL, ${fld.playlistName} VARCHAR(255) NOT NULL, ${fld.description} TEXT, ${fld.totalItems} NUMERIC NOT NULL, ${fld.createdDate} TIMESTAMP NOT NULL, FOREIGN KEY (${fld.uid}) REFERENCES users(${fld.uid}))`
    );
  },

  playlistItems: async () => {
    return await db.query(
      `CREATE TABLE playlist_items (id VARCHAR(255) UNIQUE NOT NULL, ${fld.playlistItemsId} VARCHAR(255) NOT NULL, ${fld.playlistId} VARCHAR(255) NOT NULL, ${fld.uid} VARCHAR(255) NOT NULL, ${fld.playlistItemName} VARCHAR(255) NOT NULL,${fld.mediaType} VARCHAR(20) NOT NULL , ${fld.posterURL} VARCHAR(255) NOT NULL, ${fld.duration} FLOAT(10) NOT NULL,${fld.isLiked} VARCHAR(10), ${fld.releasedDate} VARCHAR(50) NOT NULL, ${fld.addedDate} TIMESTAMP NOT NULL, PRIMARY KEY (id), FOREIGN KEY (${fld.playlistId}) REFERENCES playlists_lists(${fld.playlistId}))`
    );
  },

  watchList: async () => {
    return await db.query(
      `CREATE TABLE watch_list (id VARCHAR(255) UNIQUE NOT NULL, ${fld.itemKey} VARCHAR(255) NOT NULL, ${fld.title} VARCHAR(255) NOT NULL, ${fld.uid} VARCHAR(255) NOT NULL, ${fld.avg_vote} FLOAT(10),${fld.mediaType} VARCHAR(20) NOT NULL , ${fld.posterURL} VARCHAR(255) NOT NULL, ${fld.duration} FLOAT(10) NOT NULL,${fld.isLiked} VARCHAR(10), ${fld.releasedDate} VARCHAR(50) NOT NULL, ${fld.addedDate} TIMESTAMP NOT NULL, PRIMARY KEY (id), FOREIGN KEY (${fld.uid}) REFERENCES users(${fld.uid}))`
    );
  },
};

export default Schema;
