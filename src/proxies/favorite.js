import BaseProxy from './base';

/**
 * 收藏
 */

const apiUrlConf = {
  list: '/favorite/list',
  add: '/favorite/add',
  remove: '/favorite/remove',
  isFavorite: '/favorite/isFavorite',
};

class Favorite extends BaseProxy {
  async list(data) {
    const response = await this.submit('post', apiUrlConf.list, data);
    return response;
  }

  async add(data) {
    const response = await this.submit('post', apiUrlConf.add, data);
    return response;
  }

  async remove(data) {
    const response = await this.submit('post', apiUrlConf.remove, data);
    return response;
  }

  async isFavorite(data) {
    const response = await this.submit('post', apiUrlConf.isFavorite, data);
    return response;
  }
}
const FavoriteProxy = new Favorite();
export default FavoriteProxy;
