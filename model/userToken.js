const jwt = require('jwt-simple');
const secret = require('dotenv');
secret.config();

const generateToken = async (user) => {
  try {
    return await jwt.encode({ sub: user.uid }, process.env.SECRET);
  }
  catch(error){
    console.log('Unable to generate auth token')
  }
};
module.exports = generateToken;