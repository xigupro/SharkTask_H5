import qs from 'qs';
import md5 from 'js-md5';
import { Toast } from 'vant';
import { judgeClient } from './tools';
import { getItem } from './storage';

// 判断是否是APP里
export const isAPP = () => navigator.userAgent.indexOf('Html5Plus') > -1;

// 获取鱼玩广告地址
export const getYuWanAD = async () => {
  let p = {};
  let api = '';
  const platform = judgeClient();
  const userId = getItem('id');
  if (!userId || userId === 'undefined' || userId === 'null') {
    Toast(window.$t('pleaseLogin'));
    return api;
  }
  api = 'https://yuwan.xinliangxiang.com';
  const appId = '1540';
  const appsecret = '25jdovqsq0khowsmo5nir0mx9m30gk41';
  let md5String = '';
  if (platform === 'android') {
    const imei = window.plus.storage.getItem('imei');
    const oaid = window.plus.storage.getItem('oaid');
    p = {
      platform: '1',
      deviceIdentity: imei || '',
      oaid: oaid || '',
      appId,
      mediaUserId: userId,
    };
    md5String = md5(`${appsecret}${p.appId}${p.deviceIdentity}${p.mediaUserId}${p.oaid}${p.platform}`);
  } else {
    const idfa = window.plus.storage.getItem('idfa');
    p = {
      platform: '2',
      deviceIdentity: idfa,
      appId,
      mediaUserId: userId,
    };
    md5String = md5(`${appsecret}${p.appId}${p.deviceIdentity}${p.mediaUserId}${p.platform}`);
  }
  p.sign = md5String;
  api += `${qs.stringify(p, { addQueryPrefix: true })}`;
  console.info(api);
  return api;
};
