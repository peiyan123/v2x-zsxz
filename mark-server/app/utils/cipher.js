const UTF8 = require('crypto-js/enc-utf8')
const Base64 = require('crypto-js/enc-base64')

function encryptByBase64(cipherText) {
  return UTF8.parse(cipherText).toString(Base64)
}

function decodeByBase64(cipherText) {
  return Base64.parse(cipherText).toString(UTF8)
}

module.exports = {
  encryptByBase64,
  decodeByBase64
}