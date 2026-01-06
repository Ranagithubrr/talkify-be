function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

module.exports = {
  isValidEmail,
  isValidPassword,
};
