import BaseProxy from './base';

/**
 * 付费刷新
 */

const apiUrlConf = {
  refreshList: '/refresh/list',
  doRefresh: '/refresh/do',
  buyRefreshCount: '/refresh/buy',
  recommend: '/refresh/recommend',
  top: '/refresh/top',
};

class Refresh extends BaseProxy {
  async refreshList(data) {
    const response = await this.submit('post', apiUrlConf.refreshList, data);
    return response;
  }

  async doRefresh(data) {
    const response = await this.submit('post', apiUrlConf.doRefresh, data);
    return response;
  }

  async buyRefreshCount(data) {
    const response = await this.submit('post', apiUrlConf.buyRefreshCount, data);
    return response;
  }

  async recommend(data) {
    const response = await this.submit('post', apiUrlConf.recommend, data);
    return response;
  }

  async top(data) {
    const response = await this.submit('post', apiUrlConf.top, data);
    return response;
  }
}
const RefreshProxy = new Refresh();
export default RefreshProxy;
