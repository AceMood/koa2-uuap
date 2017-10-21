/**
 * @file 设置cas server的配置项，许包含以下几项
 *    <protocol> 'https:'
 *    <hostname> 'uuap.baidu.com'
 *    <port> '443'
 *    <validateMethod> '/serviceValidate',
 *    <appKey> 'xxx-xxx'
 */

let options = Object.create(null);

exports.setOptions = function setOptions(opt) {
  options = opt;
}

exports.getOptions = function getOptions() {
  return options;
}