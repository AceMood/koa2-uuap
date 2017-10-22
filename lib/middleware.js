/**
 * @file provide koa2 uuap middleware
 */

const qs = require('querystring')
const url = require('url')
const xml2js = require('xml-js')
const request = require('request-promise')

const config = require('./config')
const setUserInfo = require('./user').setUserInfo
const isAjax = require('./isAjax')
const getCurrentUrlAsService = require('./getCurrentUrlAsService')
const StatusCode = require('./StatusCode')

const isUserInfoInSession = function isUserInfoInSession(ctx) {
  return ctx.session && ctx.session.uuap && ctx.session.uuap.userName
}

const needValidateST = function needValidateST(ctx) {
  return (Object.keys(ctx.query).length === 1) && ctx.query.ticket
}

const transform = function transform(res) {
  return new Promise((resolve, reject) => {
    let userName
    let jsonStr

    try {
      jsonStr = xml2js.xml2json(res, {
        compact: true,
        spaces: 4
      })
    } catch (err) {
      resolve({
        code: StatusCode.Fail,
        msg: `Parse Error [xml2js.xml2json]: ${res}`
      })
    }

    let json;
    try {
      json = JSON.parse(jsonStr)
    } catch (err) {
      resolve({
        code: StatusCode.Fail,
        msg: `Parse Error [JSON.parse]: ${jsonStr}`
      })
    }

    if (json['cas:serviceResponse']['cas:authenticationFailure']) {
      let rep = json['cas:serviceResponse']['cas:authenticationFailure']

      resolve({
        code: rep['_attributes']['code'],
        text: rep['_text']
      })

    } else if (json['cas:serviceResponse']['cas:authenticationSuccess']) {

      let rep = json['cas:serviceResponse']['cas:authenticationSuccess']

      // uuap userName
      userName = rep['cas:user']['_text']
      resolve({
        code: StatusCode.Success,
        userName: userName
      })
    } else {
      resolve({
        code: StatusCode.Fail,
        msg: 'UNKNOWN_ERR'
      });
    }
  });
}

module.exports = function middleware(options) {
  config.setOptions(options)

  let service

  return async function middleware(ctx, next) {
    console.log(`Processing: ${ctx.request.href}`);

    // have login
    if (isUserInfoInSession(ctx)) {
      await next()
    } else if (needValidateST(ctx)) {
      // need validate st by cas server
      ctx.session.uuap = {}

      let postData = qs.stringify({
        ticket: ctx.query.ticket,
        service: service,
        appKey: options.appKey
      })

      await request({
        method: 'POST',
        uri: url.format({
          protocol: options.protocol,
          hostname: options.hostname,
          port: options.port,
          pathname: options.validateMethod
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        },
        body: postData
      }).then(res => {
        return transform(res)
      }).then(res => {
        if (res.code === StatusCode.Success) {
          ctx.session.uuap.userName = res.userName

          setUserInfo(ctx.session.uuap);

          if (isAjax(ctx)) {
            ctx.body = {
              code: StatusCode.Redirect,
              Location: service
            }
          } else {
            ctx.redirect(service)
          }

        } else {
          ctx.body = 'error' + JSON.stringify(res)
        }
      }).catch(err => {
        console.error(err)
      });
    } else {
      let options = config.getOptions()
      service = options.service || getCurrentUrlAsService(ctx)

      let redirectUrl = url.format({
        protocol: options.protocol,
        hostname: options.hostname,
        port: options.port,
        query: {
          service: service,
          appKey: options.appKey
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
}