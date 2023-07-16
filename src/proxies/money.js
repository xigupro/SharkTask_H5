import BaseProxy from './base';

/**
 * 金钱
 */

const paths = {
  getUserStreamList: '/money/stream',
  sendRed: '/order/redAdd',
  getRedDetail: '/order/redDetail',
  redReceive: '/order/redReceive',
};

class Money extends BaseProxy {
  async getUserStreamList(data) {
    const response = await this.submit('post', paths.getUserStreamList, data);
    return response;
  }

  // 发红包
  async sendRed(data) {
    const response = await this.submit('post', paths.sendRed, data);
    return response;
  }

  // 红包详情
  async getRedDetail(data) {
    const response = await this.submit('post', paths.getRedDetail, data);
    return response;
  }

  // 领取红包
  async redReceive(data) {
    const response = await this.submit('post', paths.redReceive, data);
    return response;
  }
}
const MoneyProxy = new Money();
export default MoneyProxy;
