import BaseProxy from './base';

/**
 * 统计
 */

const apiUrlConf = {
  getTaskCount: '/statistics/getTaskCount',
  getMoneyByTaskStatus: '/statistics/getMoneyByTaskStatus',
  getUserMoneyStatistics: '/statistics/getUserMoneyStatistics',
};

class Statistics extends BaseProxy {
  // 统计当前用户各个状态的任务数量
  async getTaskCount(data) {
    const response = await this.submit('post', apiUrlConf.getTaskCount, data);
    return response;
  }

  // 统计当前用户未完成任务的总金额
  async getMoneyByTaskStatus(data) {
    const response = await this.submit('post', apiUrlConf.getMoneyByTaskStatus, data);
    return response;
  }

  // 统计当前用户金额数据
  async getUserMoneyStatistics(data) {
    const response = await this.submit('post', apiUrlConf.getUserMoneyStatistics, data);
    return response;
  }
}
const StatisticsProxy = new Statistics();
export default StatisticsProxy;
