
module.exports = function isAjax(ctx) {
  return ctx.request.headers['X-Requested-With'] === 'XMLHttpRequest'
}