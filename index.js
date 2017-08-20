'use strict';

/**
 * @file Alidayu SDK
 * @author Yourtion Guo <yourtion@gmail.com>
 * 
 * 阿里云短信发送接口 nodejs 版本
 * 阿里云短信API官方文档: https://help.aliyun.com/document_detail/56189.html?spm=5176.doc55288.6.567.JQseDW
 */

const assert = require('assert');
const crypto = require('crypto');
const request = require('request');

/**
 * 创建一个兼容 callback 的 Promise
 * @return {Function}
 */
function createPromiseCallback() {
  const callback = (err, ret) => {
    if (err) {
      callback.reject(err);
    } else {
      callback.resolve(ret);
    }
  };
  callback.promise = new Promise((resolve, reject) => {
    callback.resolve = resolve;
    callback.reject = reject;
  });
  return callback;
}

/**
 * 阿里云短信服务 - 阿里大于
 */
class Alidayu {

  /**
   * 构造函数
   * @param {Object} options - 配置项
   * @param {String} options.AccessKeyId - 秘钥 AccessKeyId
   * @param {String} options.AccessKeySecret - 秘钥A ccessKeySecret
   */
  constructor(options) {
    assert(typeof options.AccessKeyId === 'string', '请配置 AccessKeyId');
    assert(typeof options.AccessKeySecret === 'string', '请配置  AccessKeySecret');
    this.options = Object.assign({
      AccessKeyId: '***',
      AccessKeySecret: '***',
      Format: 'JSON',
      SignatureMethod: 'HMAC-SHA1',
      SignatureVersion: '1.0',
      Action: 'SendSms',
      Version: '2017-05-25',
      RegionId: 'cn-hangzhou',
    }, options);
  }

  /**
   * 短信接口签名算法函数
   * @param {Object} param - 发送短信的参数
   * @param {String} secret - 阿里短信服务所用的密钥值
   * @return {String}
   */
  _signParameters(param, secret) {
    const data = [];

    for (const key of Object.keys(param).sort()) {
      data.push(encodeURIComponent(key) + '=' + encodeURIComponent(param[key]));
    }
    const StringToSign = `POST&${ encodeURIComponent('/') }&${ encodeURIComponent(data.join('&')) }`;
    return crypto.createHmac('sha1', secret + '&').update(new Buffer(StringToSign, 'utf-8')).digest('base64');
  }

  /**
     * 阿里云短信发送接口
     * @param {Object} params - 发送短信的参数
     * @param {Function} callback - 回调函数
     */
  _sendMessage(params, callback) {
    const _param = Object.assign(params, this.options, { SignatureNonce: '' + Math.random(), Timestamp: new Date().toISOString() });
    delete _param.AccessKeySecret;
    _param.Signature = this._signParameters(_param, this.options.AccessKeySecret);
    request.post({
      url: 'http://dysmsapi.aliyuncs.com/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: _param,
    }, function (err, response, data) {
      callback(err, data);
    });
  }

  /**
   * 发送短信
   * @param {Object} option - 发送短信配置
   * @param {Number} option.phone - 手机号
   * @param {String} option.sign - 签名
   * @param {String} option.template - 模版
   * @param {Object} option.params - 模版参数
   * @param {Function} callback - 回调函数
   * @return {Promise} 
   */
  sms(option, callback) {
    const _option = {
      PhoneNumbers: option.phone,
      SignName: option.sign,
      TemplateCode: option.template,
    };
    if(option.params) _option.TemplateParam = JSON.stringify(option.params);
    const cb = callback || createPromiseCallback();
    this._sendMessage(_option, function (err, data) {
      if(err) return cb(err, data);
      const json = JSON.parse(data);
      if(json.Message === 'OK') {
        cb(null, json);
      } else {
        cb(new Error(json.Message), json);
      }
    });
    return cb.promise;
  }
}

module.exports = Alidayu;
