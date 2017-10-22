/**
 * @file export all api
 */

exports.setOptions = require('./lib/config').setOptions
exports.getOptions = require('./lib/config').setOptions

exports.middleware = require('./lib/middleware')

exports.getUserInfo = require('./lib/user').getUserInfo
exports.setUserInfo = require('./lib/user').setUserInfo
exports.resetUserInfo = require('./lib/user').resetUserInfo

exports.logout = require('./lib/logout')