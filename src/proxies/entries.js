import BaseProxy from './base';

/**
 * 菜单
 */

const apiUrlConf = {
  list: '/entries/list',
};

class Entries extends BaseProxy {
  async list(data) {
    const response = await this.submit('post', apiUrlConf.list, data);
    return response;
  }
}
const EntriesProxy = new Entries();
export default EntriesProxy;
