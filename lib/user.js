
let userInfo = null

exports.getUserInfo = function getUserInfo() {
  return userInfo
}

exports.setUserInfo = function getUserInfo(info) {
  userInfo = info
}

exports.resetUserInfo = function getUserInfo() {
  userInfo = null
}