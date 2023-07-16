
import BaseProxy from './base';

/**
 * 通用的请求定义
 */

// 接口地址
const apiUrlConf = {
  // 获取七牛上传token
  getQiniuUploadToken: '/upload/token',
  // 文件上传
  uploadFile: window.API_CONFIG['qiniu_upload'],
  // APP微信下单
  appAddOrder: '/order/appAdd',
  // 公众号下单
  publicAddOrder: '/order/publicAdd',
  // 公众号获取openid
  publicSession: '/order/publicSession',
  // APP支付宝下单
  appAlipayAddOrder: '/order/alipayAdd',
};

class CommonApi extends BaseProxy {
  // 获取七牛上传token
  async getQiniuUploadToken() {
    const res = await this.submit('post', apiUrlConf.getQiniuUploadToken);
    return res;
  }

  // 文件上传
  async uploadFile(data) {
    const response = await this.submit('post', apiUrlConf.uploadFile, data, {
      dataType: 'file',
    });
    return response;
  }

  // APP下单
  async appAddOrder(data) {
    const res = await this.submit('post', apiUrlConf.appAddOrder, data);
    return res;
  }

  // 公众号下单
  async publicAddOrder(data) {
    const res = await this.submit('post', apiUrlConf.publicAddOrder, data);
    return res;
  }

  // 公众号获取openid
  async publicSession(data) {
    const res = await this.submit('post', apiUrlConf.publicSession, data);
    return res;
  }

  // 支付宝下单
  async appAlipayAddOrder(data) {
    const res = await this.submit('post', apiUrlConf.appAlipayAddOrder, data);
    return res;
  }
}
const CommonProxy = new CommonApi();
export default CommonProxy;
