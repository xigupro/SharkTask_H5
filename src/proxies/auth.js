import BaseProxy from './base';
// 接口地址
const apiUrlConf = {
  // 登录
  login: '/login/web',
  register: '/register',
  wechatLogin: '/login/officialAccountLogin',
  appWechatLogin: '/login/wechat',
  appAppleLogin: '/login/apple',
  checkWechatIsNew: '/login/checkWechatIsNew',
  checkAppleIsNew: '/login/checkAppleIsNew',
  bindWechat: '/login/bindWechat',
  bindApple: '/login/bindApple',
  checkPhoneIsNew: '/login/checkPhoneIsNew',
  phoneLogin: '/login/phoneLogin',
  bindPhoneAndLogin: '/login/bindPhoneAndLogin',
  bindPhoneByToken: '/login/bindPhoneByToken',
  unbindPhone: '/login/unbindPhone',
  sendSms: '/sms/send',
  bindOfficialAccount: '/login/bindOfficialAccount',
};

class Auth extends BaseProxy {
  // 登录
  async login(data) {
    const response = await this.submit('post', apiUrlConf.login, data);
    return response;
  }

  async register(data) {
    const response = await this.submit('post', apiUrlConf.register, data);
    return response;
  }

  async wechatLogin(data) {
    const response = await this.submit('post', apiUrlConf.wechatLogin, data);
    return response;
  }

  async appWechatLogin(data) {
    const response = await this.submit('post', apiUrlConf.appWechatLogin, data);
    return response;
  }

  async appAppleLogin(data) {
    const response = await this.submit('post', apiUrlConf.appAppleLogin, data);
    return response;
  }

  async checkWechatIsNew(data) {
    const response = await this.submit('post', apiUrlConf.checkWechatIsNew, data);
    return response;
  }

  async checkAppleIsNew(data) {
    const response = await this.submit('post', apiUrlConf.checkAppleIsNew, data);
    return response;
  }

  async bindWechat(data) {
    const response = await this.submit('post', apiUrlConf.bindWechat, data);
    return response;
  }

  async bindApple(data) {
    const response = await this.submit('post', apiUrlConf.bindApple, data);
    return response;
  }

  async sendSms(data) {
    const response = await this.submit('post', apiUrlConf.sendSms, data);
    return response;
  }

  async checkPhoneIsNew(data) {
    const response = await this.submit('post', apiUrlConf.checkPhoneIsNew, data);
    return response;
  }

  async phoneLogin(data) {
    const response = await this.submit('post', apiUrlConf.phoneLogin, data);
    return response;
  }

  async bindPhoneAndLogin(data) {
    const response = await this.submit('post', apiUrlConf.bindPhoneAndLogin, data);
    return response;
  }

  async bindPhoneByToken(data) {
    const response = await this.submit('post', apiUrlConf.bindPhoneByToken, data);
    return response;
  }

  async unbindPhone(data) {
    const response = await this.submit('post', apiUrlConf.unbindPhone, data);
    return response;
  }

  async bindOfficialAccount(data) {
    const response = await this.submit('post', apiUrlConf.bindOfficialAccount, data);
    return response;
  }
}
const AuthProxy = new Auth();
export default AuthProxy;
