import BaseProxy from './base';

/**
 * 用户管理的请求定义
 */

// 接口地址
const apiUrlConf = {
  // 更新用户
  updateUser: '/user/update',
  // 获取当前用户信息
  getUserInfo: '/user/info',
  // 根据id用户信息
  getInfoByID: '/user/getInfoByID',
  // 修改用户密码
  updateUserPassword: '/user/updateUserPassword',
  updateScore: '/score/add',
  getLuckyDrawList: '/score/getLuckyDrawList',
};

class UserManage extends BaseProxy {

  // 更新用户
  async updateUser(data) {
    const response = await this.submit('post', apiUrlConf.updateUser, data);
    return response;
  }

  // 获取当前用户信息
  async getUserInfo(data) {
    const response = await this.submit('post', apiUrlConf.getUserInfo, data);
    return response;
  }

  // 根据id用户信息
  async getInfoByID(data) {
    const response = await this.submit('post', apiUrlConf.getInfoByID, data);
    return response;
  }

  // 修改用户密码
  async updateUserPassword(data) {
    const response = await this.submit('post', apiUrlConf.updateUserPassword, data);
    return response;
  }

  // 加减积分
  async updateScore(data) {
    const response = await this.submit('post', apiUrlConf.updateScore, data);
    return response;
  }

  async getLuckyDrawList(data) {
    const response = await this.submit('post', apiUrlConf.getLuckyDrawList, data);
    return response;
  }
}
const UserProxy = new UserManage();
export default UserProxy;
