import db from '../config/database.config.js';
import fld from '../db/fieldLists.js';
import { validateEmail, validatePassword } from '../utils/validateInput.js';
import validateQueryParam from '../utils/validateQueryParam.js';
import Like from './liked.js';
import Playlist from './playlist.js';
import bcrypt from 'bcryptjs';
import WatchList from './watchList.js';
import { invalidQueryParamException } from './errors/handleErr.js';

class HandleUser {
  /**
   *
   * @param {id, filedName, value}
   * This module handle creation, searching and deleting the user;
   * @method {add, find, findById, delete}
   */
  constructor() {
    this.liked = Like;
    this.playlist = Playlist;
    this.watchList = WatchList;
  }
  #handleException = (msg, code) => {
    this.msg = msg ? msg : 'Invalid query parameter';
    this.code = code ? code : 422;
    return { msg: this.msg, code };
  };
  add = async ({
    uid,
    user_name,
    email,
    password,
    date_of_birth,
    country,
    _liked,
    _playlists,
    _watch_list
  }) => {
    try {
      if (
        uid !== null &&
        user_name !== null &&
        email !== null &&
        password !== null &&
        date_of_birth !== null &&
        country !== null &&
        _liked !== null &&
        _playlists !== null && _watch_list !== null
      ) {
        const addUser = await db.query(
          `INSERT INTO users (${fld.uid}, ${fld.userName}, ${fld.email}, ${fld.password}, ${fld.dob}, ${fld.country}, ${fld.liked}, ${fld.playlists}, ${fld.watchList}, ${fld.joinedDate}) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            uid,
            user_name,
            email,
            password,
            date_of_birth,
            country,
            _liked,
            _playlists,
            _watch_list,
            new Date()],
        );
        return addUser.rowCount;
      }
    } catch (error) {
      console.log(error);
    }
  };

  find = async ({ id, value }) => {
    if (validateQueryParam(id) || validateQueryParam(value)) {
      const user = await db.query(
        `SELECT * FROM users WHERE ${id}='${value}'`
      );
      return user.rows[0];
    }
    throw this.#handleException();
  };

  findById = async (id) => {
    if (validateQueryParam(id)) {
      const res = await db.query(`SELECT * FROM users WHERE ${fld.uid}=$1`, [
        id,
      ]);
      return res.rows[0];
    }
    throw this.#handleException();
  };

  delete = async (id) => {
    if (validateQueryParam(id)) {
      const res = await db.query(`DELETE FROM users WHERE ${fld.uid}=$1`, [
        id,
      ]);
      return res.rowCount;
    }
    throw this.#handleException();
  };

  updateEmail = async ({ uid, newEmail, password }) => {
    if (validateQueryParam(uid)) {
      if (validateEmail(newEmail)) {
        const findEmail = await db.query(
          `SELECT COUNT(email) AS total_email FROM users WHERE ${fld.uid}=$1 AND ${fld.email}=$2`,
          [uid, newEmail]
        );
        if (parseInt(findEmail.rows[0].total_email) === 0) {
          const snapshot = await this.findById(uid);
          if (snapshot) {
            const checkPassword = await bcrypt.compare(
              password,
              snapshot.password
            );
            if (checkPassword) {
              const email = newEmail.toString().toLowerCase();
              if (snapshot.email.toString().toLowerCase() !== email) {

                await db.query(
                  `UPDATE users SET ${fld.email}=$1 WHERE ${fld.uid}=$2`,
                  [email, uid]
                );
                return true;
              }
              return false;
            }
            throw this.#handleException(
              'Password is incorrect for this email. Please enter correct password.',
              'INVALID_PASSWORD'
            );
          }
          throw this.#handleException(
            `There is no user exist with this ${newEmail}`
          );
        }
        throw this.#handleException(
          'Email is already in use.',
          'EMAIL_IN_USED'
        );
      }
      throw this.#handleException(`Invalid email provided ${newEmail}`);
    }
    throw this.#handleException();
  };

  changePassword = async ({ uid, currentPwd, newPwd }) => {
    if (!validateQueryParam(uid)) {
      throw invalidQueryParamException();
    }

    if (!validatePassword(currentPwd) || !validatePassword(newPwd)) {
      return this.#handleException(
        'Invalid password formatContains at least 1 of the following types (a-z), (A-Z), (0-9), (!,@,#,$).',
        'INVALID_PASSWORD_FORMAT'
      );
    }

    const snapshot = await this.findById(uid);
    if (!snapshot) {
      return this.#handleException(
        `Oops! something went wrong. Make sure own this account.`,
        'USER_NOEXIST'
      );
    }

    const checkPwd = await bcrypt.compare(currentPwd, snapshot.password);
    if (!checkPwd) {
      return this.#handleException(
        'The password you entered is incorrect. Please try again.',
        'INCORRECT_PWD'
      );
    }
    try {
      const salt = await bcrypt.genSalt(10);
      const createHashedVersion = await bcrypt.hash(newPwd, salt);
      const updatePwd = await db.query( 
        `UPDATE users SET ${fld.password}=$1 WHERE ${fld.uid}=$2`,
        [createHashedVersion, uid]
      );
      if (updatePwd.rowCount === 0) {
        return this.#handleException('Update success.', 'UNCHANGED');
      }
      return true;
    } catch (error) {
      console.log(error);
      throw new Error('Something went wrong with hashing');
    }
  };

  deleteAccount = async ({ uid, email, password }) => {
    if (!validateQueryParam(uid)) {
      throw this.#handleException(null, uid); 
    }
    const findUser = await this.findById(uid);
    if (!findUser) {
      return this.#handleException(
        'Oops! something went wrong. Make sure own this account.',
        'USER_NOEXIST'
      );
    }

    if (findUser.email !== email) {
      return this.#handleException(
        'Email & Password is incorrect. Please try again.'
      );
    }
    try {
      const cmpPwd = await bcrypt.compare(password, findUser.password);
      if (!cmpPwd) {
        return this.#handleException(
          'Email & Password is incorrect. Please try again.'
        );
      }
      const deletes = Promise.all([
        db.query(`DELETE FROM liked WHERE ${fld.uid}=$1`, [uid]),
        db.query(`DELETE FROM watch_list WHERE ${fld.uid}=$1`, [uid]),
        db.query(`DELETE FROM playlist_items WHERE ${fld.uid}=$1`, [uid]),
        db.query(`DELETE FROM playlists_lists WHERE ${fld.uid}=$1`, [uid]),
      ]);
      if (deletes) {
        const deleteMain = await db.query(
          `DELETE FROM users WHERE ${fld.uid}=$1`,
          [uid]
        );
        if (deleteMain.rowCount > 0) {
          return true;
        }
        return false;
      }
    } catch (error) {
      console.log(error);
      throw new Error('Internal server error', error);
    }
  };
}

const User = new HandleUser();
export default User;
