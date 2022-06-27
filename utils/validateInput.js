const validateEmail = (email) => {
  const reg =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  if (!reg.test(email.toString().toLowerCase())) {
    return false;
  }
  return true;
};

const validateEmpty = (input) => {
  if (!input) {
    return true;
  }
  return false;
};

const checkPattern = (input) => {
  const reg = /(\w+)$/g;
  if (!reg.test(input.toString())) {
    return false;
  }
  return true;
};

const validatePassword = (password) => {
  const reg =
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/g;
  if (!reg.test(password)) {
    return false;
  }
  return true;
};

module.exports ={
  validateEmail,
  validateEmpty,
  validatePassword,
  checkPattern
}
