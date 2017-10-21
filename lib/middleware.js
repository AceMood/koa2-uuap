/**
 * @file 提供koa2的uuap中间件函数
 */

const qs = require('querystring')
const url = require('url')
const xml2js = require('xml-js')
const request = require('request-promise')
const config = require('./config')

const RedirectStatusCode = 302
const FailStatusCode = 500
const SuccessStatusCode = 200

function getCurrentUrlAsService(ctx) {
  return ctx.request.href
}

function isUserInfoInSession(ctx) {
  return ctx.session && ctx.session.uuap && ctx.session.uuap.userName
}

function needValidateST(ctx) {
  return (Object.keys(ctx.query).length === 1) && ctx.query.ticket
}

function transform(response) {
  return new Promise((resolve, reject) => {
    let userName;
    let userInfo;
    let responseJSON = JSON.parse(xml2js.xml2json(response, { compact: true, spaces: 4 }));

    if (responseJSON['cas:serviceResponse']['cas:authenticationFailure']) {

      let rep = responseJSON['cas:serviceResponse']['cas:authenticationFailure'];
      let errorInfo = {
        code: rep['_attributes']['code'],
        text: rep['_text']
      };

      resolve(errorInfo);

    } else if (responseJSON['cas:serviceResponse']['cas:authenticationSuccess']) {

      let rep = responseJSON['cas:serviceResponse']['cas:authenticationSuccess'];

      console.log('--------login info-------------');

      // 解析UUAP用户名
      userName = rep['cas:user']['_text'];
      resolve({
        code: 'success',
        userName: userName,
        userInfo: userInfo
      });
    } else {
      resolve({
        code: 'fail'
      });
    }
  });
}

function isAjax(ctx) {
  return ctx.request.headers['X-Requested-With'] === 'XMLHttpRequest'
}

module.export = function middleware(options) {
  config.setOptions(options)

  return async function middleware(ctx, next) {
    // 已登陆
    if (isUserInfoInSession(ctx)) {
      await next()
    } else if (needValidateST()) {
      // 带了st信息，则去cas server校验
      let service = getCurrentUrlAsService();

      ctx.session.uuap = {}

      let postData = qs.stringify({
        ticket: ctx.query.ticket,
        service: service,
        appKey: options.appKey
      })

      request({
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
        if (res.code === SuccessStatusCode) {
          ctx.session.uuap.userName = res.userName

          let params = url.parse(ctx.originalUrl, true);
          let query = params.query;

          delete query.ticket;
          let redirectUrl = url.format({
            pathname: params.pathname,
            query: query
          });

          if (isAjax(ctx)) {
            ctx.body = {
              code: RedirectStatusCode,
              Location: redirectUrl
            }
          } else {
            ctx.redirect(redirectUrl)
          }

        } else {
          ctx.body = 'error' + JSON.stringify(res)
        }
      }).catch(err => {
        console.error(err)
      });
    } else {
      let service = getCurrentUrlAsService(ctx)
      let redirectUrl = url.format({
        protocol: uuap.protocol,
        hostname: uuap.hostname,
        port: uuap.port,
        query: {
          service: service,
          appKey: uuap.appKey
        }
      });

      if (isAjax(ctx)) {
        ctx.body = {
          code: RedirectStatusCode,
          Location: redirectUrl
        }
      } else {
        ctx.redirect(redirectUrl)
      }
    }
  }
}