# node-dysms

Alidayu SMS (dysmsapi.aliyuncs.com) for Node.js witout async function.

阿里大于（阿里云服务版）Node.js 客户端，不需要 Async 方法（阿里大于官方客户端居然要 async，只好手撸一个简单的版本。

## 安装使用使用

```bash
npm install dysms --save
```

```javascript
const Alidayu = require('dysms');

// 初始化客户端
const client = new Alidayu({ 
  AccessKeyId: 'Your-AccessKeyId', 
  AccessKeySecret: 'Your-AccessKeySecret' 
});

// 发送短信（Promise）
client.sms({
  phone: 13800138000,
  sign: '签名',
  template: 'SMS_8xxxxx',
  params: { user: 'Yourtion' },
})
.then(console.log)
.catch(console.log);

// 发送短信（Callback）
client.sms({
  phone: 13800138000,
  sign: '签名',
  template: 'SMS_8xxxxx',
  params: { user: 'Yourtion' },
}, (err, data) => {console.log(err, data)});
```

详情参数指定

```javascript
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
sms(option, callback)
```
