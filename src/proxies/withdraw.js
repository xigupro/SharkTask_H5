import BaseProxy from './base';

/**
 * 用户提现
 */

const paths = {
  submitWithdraw: '/withdraw/submit',
  withdrawList: '/withdraw/list',
  withdrawDetail: '/withdraw/detail',
};

class Withdraw extends BaseProxy {
  async submitWithdraw(data) {
    const response = await this.submit('post', paths.submitWithdraw, data);
    return response;
  }

  async withdrawList(data) {
    const response = await this.submit('post', paths.withdrawList, data);
    return response;
  }

  async withdrawDetail(data) {
    const response = await this.submit('post', paths.withdrawDetail, data);
    return response;
  }
}
const WithdrawProxy = new Withdraw();
export default WithdrawProxy;
