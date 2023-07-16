import BaseProxy from './base';

/**
 * 轮播
 */

const apiUrlConf = {
  getBanners: '/banners/',
};

class Banners extends BaseProxy {
  async getBanners(data) {
    const response = await this.submit('post', apiUrlConf.getBanners, data);
    return response;
  }
}
const BannersProxy = new Banners();
export default BannersProxy;
