const uuid = require('uuid');
const generateId = () => uuid.v4().toString().replaceAll('-', '');
module.exports = generateId
