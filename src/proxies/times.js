import BaseProxy from './base';

const apiUrlConf = {
  getTimeSteps: '/times/list',
};

class Times extends BaseProxy {
  async getTimeSteps(data) {
    const response = await this.submit('post', apiUrlConf.getTimeSteps, data);
    return response;
  }
}
const TimesProxy = new Times();
export default TimesProxy;
