
// add custom header to recognize the request with a xhr object.
// if use VueResource or Zepto.js, it's already set
module.exports = function isAjax(ctx) {
  return ctx.request.headers['x-requested-with'] === 'XMLHttpRequest'
}