import BaseProxy from './base';

/**
 * 收货地址
 */

class Address extends BaseProxy {
  async getAddressList(data) {
    const res = await this.submit('post', '/address/list', data);
    return res;
  }

  async removeAddress(data) {
    const res = await this.submit('post', '/address/remove', data);
    return res;
  }

  async addressDetail(data) {
    const res = await this.submit('post', '/address/detail', data);
    return res;
  }

  async addAddress(data) {
    const res = await this.submit('post', '/address/add', data);
    return res;
  }

  async updateAddress(data) {
    const res = await this.submit('post', '/address/update', data);
    return res;
  }
}
const AddressProxy = new Address();
export default AddressProxy;
