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

class Alidayu {

  /**
   * 构造函数
   * @param {Object} options 
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
   * @param {Object} param 发送短信的参数
   * @param {String} secret 阿里短信服务所用的密钥值
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
     * @param {Object} data 发送短信的参数，请查看阿里云短信模板中的变量做一下调整，格式如：{code:"1234", phone:"13062706593"}
     * @param {Function} callback 发送短信后的回调函数
     */
  _sendMessage(data, callback) {
    const param = Object.assign(data, this.options, { SignatureNonce: '' + Math.random(), Timestamp: new Date().toISOString() });
    delete param.AccessKeySecret;
    param.Signature = this._signParameters(param, this.options.AccessKeySecret);
    request.post({
      url: 'http://dysmsapi.aliyuncs.com/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: param,
    }, function (err, response, data) {
      callback(err, data);
    });
  }

  /**
   * 发送短信
   * @param {Object} opt 
   * @param {Function} callback
   * @return {Promise} 
   */
  sendRegistSms(opt, callback) {
    const cb = callback || createPromiseCallback();
    this._sendMessage(opt, function (err, data) {
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
