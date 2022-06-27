const createAccount = require('../model/signup')
const handleLogin = require('../model/login');
const User = require('../model/user.js');
const signUp = async (req, res, next) => {
  const account = await createAccount(req.body.data);
  res.send(account);
};

const signIn = async (req, res, next) => {
  const login = await handleLogin(req.body.data);
  res.send(login);
};

const updateEmail = async (req, res, next) => {
  try {
    const {uid, newEmail, password} = req.body.data;
    const updateEmail = await User.updateEmail({uid, newEmail, password});
    if (updateEmail) {
      res
        .status(201)
        .send(
          `Email update successful. ${newEmail} is your new email for this account.`
        );
      return;
    }
    res
      .status(200)
      .send('Email is unchanged. Probably provide same email as previous.');
  } catch (err) {
    console.log(err)
    res.send({ err });
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { data } = req.body;
    const reqSub = await User.changePassword({ ...data });
    if (reqSub === true) {
      res.status(201).send('Password successfully updated');
      return;
    }
    res.status(200).send({ ...reqSub });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};

const deleteAccountPermanent = async (req, res, next) => {
  try {
    const { data } = req.body;
    const reqSub = await User.deleteAccount(data);
    if (reqSub === true) {
      res.send({ status: 200 });
      return;
    }
    res.send({ ...reqSub });
  } catch (error) {
    res.status(400).send('Something went wrong');
    console.log(error);
  }
};
module.exports = {
  deleteAccountPermanent,
  changePassword,
  updateEmail,
  signIn,
  signUp
}