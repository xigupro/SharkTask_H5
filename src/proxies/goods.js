import BaseProxy from './base';

/**
 * 商品
 */

class Goods extends BaseProxy {
  async getGoodsList(data) {
    const res = await this.submit('post', '/goods/list', data);
    return res;
  }

  async getOrderList(data) {
    const res = await this.submit('post', '/goods/orders', data);
    return res;
  }

  async getOrderDetail(data) {
    const res = await this.submit('post', '/goods/orderDetail', data);
    return res;
  }

  async cancelOrder(data) {
    const res = await this.submit('post', '/goods/cancelOrder', data);
    return res;
  }

  async getGoodsDetail(data) {
    const res = await this.submit('post', '/goods/detail', data);
    return res;
  }

  async goodsExchange(data) {
    const res = await this.submit('post', '/goods/exchange', data);
    return res;
  }

  async getGoodsTypeList(data) {
    const res = await this.submit('post', '/goods/types', data);
    return res;
  }
}
const GoodsProxy = new Goods();
export default GoodsProxy;
