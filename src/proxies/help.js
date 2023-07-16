import BaseProxy from './base';

/**
 * 帮助管理的请求定义
 */

// 帮助管理
const apiUrlConf = {
  list: '/help/list',
  typeList: '/help/typeList',
  detail: '/help/detail',
};

class Help extends BaseProxy {
  async list(data) {
    const response = await this.submit('post', apiUrlConf.list, data);
    return response;
  }

  async typeList(data) {
    const response = await this.submit('post', apiUrlConf.typeList, data);
    return response;
  }

  async detail(data) {
    const response = await this.submit('post', apiUrlConf.detail, data);
    return response;
  }
}
const HelpProxy = new Help();
export default HelpProxy;
