import BaseProxy from './base';

/**
 * 用户实名认证的请求定义
 */

const apiUrlConf = {
  getCertificationDetail: '/certifications/detail',
  updateCertification: '/certifications/update',
  addCertification: '/certifications/add',
};

class Certification extends BaseProxy {
  async getCertificationDetail(data) {
    const response = await this.submit('post', apiUrlConf.getCertificationDetail, data);
    return response;
  }

  async updateCertification(data) {
    const response = await this.submit('post', apiUrlConf.updateCertification, data);
    return response;
  }

  async addCertification(data) {
    const response = await this.submit('post', apiUrlConf.addCertification, data);
    return response;
  }
}
const CertificationProxy = new Certification();
export default CertificationProxy;
