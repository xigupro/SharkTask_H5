import BaseProxy from './base';

/**
 * 系统管理的请求定义
 */

// 系统管理
const apiUrlConf = {
  get: '/system/get',
};

class System extends BaseProxy {
  async get(data) {
    const response = await this.submit('post', apiUrlConf.get, data);
    return response;
  }
}
const SystemProxy = new System();
export default SystemProxy;
