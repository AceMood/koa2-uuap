/**
 * @file provide logout middleware
 */

const url = require('url');

const config = require('./config');
const isAjax = require('./isAjax')
const StatusCode = require('./StatusCode')

module.exports = function(options) {

  let service = options.service

  return function(ctx, next) {
    delete ctx.session.uuap

    let options = config.getOptions();
    let redirectUrl = url.format({
      protocol: options.protocol,
      hostname: options.hostname,
      port: options.port,
      pathname: '/logout',
      query: {
        service: service
      }
    })

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

