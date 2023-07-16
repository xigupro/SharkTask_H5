import BaseProxy from './base';

/**
 * 签到
 */

const apiUrlConf = {
  list: '/sign/list',
  do: '/sign/do',
};

class Banners extends BaseProxy {
  async list(data) {
    const response = await this.submit('post', apiUrlConf.list, data);
    return response;
  }

  async do(data) {
    const response = await this.submit('post', apiUrlConf.do, data);
    return response;
  }
}
const BannersProxy = new Banners();
export default BannersProxy;
