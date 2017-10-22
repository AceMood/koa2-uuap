/**
 * @file provide logout middleware
 */

const url = require('url');

const options = require('./config').getOptions();
const isAjax = require('./isAjax')
const resetUserInfo = require('./user').resetUserInfo
const getCurrentUrlAsService = require('./getCurrentUrlAsService')
const StatusCode = require('./StatusCode')

module.exports = function() {
  return function(ctx, next) {
    delete ctx.session.uuap
    resetUserInfo()

    let redirectUrl = url.format({
      protocol: options.protocol,
      hostname: options.hostname,
      port: options.port,
      pathname: '/logout',
      query: {
        service: getCurrentUrlAsService(ctx)
      }
    });

    if (isAjax(ctx)) {
      ctx.body = {
        code: StatusCode.Redirect,
        Location: redirectUrl
      }
    } else {
      ctx.redirect(redirectUrl)
    }
  }
}

