import BaseProxy from './base';

/**
 * 消息
 */

const apiUrlConf = {
  list: '/messages/list',
  getNoticeList: '/messages/getNoticeList',
  unreadCount: '/messages/unreadCount',
  remove: '/messages/remove',
  detail: '/messages/detail',
  getNoticeDetail: '/messages/getNoticeDetail',
  read: '/messages/read',
};

class Messages extends BaseProxy {
  async list(data) {
    const response = await this.submit('post', apiUrlConf.list, data);
    return response;
  }

  async getNoticeList(data) {
    const response = await this.submit('post', apiUrlConf.getNoticeList, data);
    return response;
  }

  async unreadCount(data) {
    const response = await this.submit('post', apiUrlConf.unreadCount, data);
    return response;
  }

  async remove(data) {
    const response = await this.submit('post', apiUrlConf.remove, data);
    return response;
  }

  async detail(data) {
    const response = await this.submit('post', apiUrlConf.detail, data);
    return response;
  }

  async getNoticeDetail(data) {
    const response = await this.submit('post', apiUrlConf.getNoticeDetail, data);
    return response;
  }

  async read(data) {
    const response = await this.submit('post', apiUrlConf.read, data);
    return response;
  }
}
const MessagesProxy = new Messages();
export default MessagesProxy;
