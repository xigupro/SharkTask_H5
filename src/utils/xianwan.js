import qs from 'qs';
import md5 from 'js-md5';
import { Toast } from 'vant';
import { judgeClient } from './tools';
import { getItem } from './storage';

// 判断是否是APP里
export const isAPP = () => navigator.userAgent.indexOf('Html5Plus') > -1;

// 获取闲玩广告地址
export const getXianWanAD = async () => {
  let p = {};
  let api = '';
  const platform = judgeClient();
  const userId = getItem('id');
  if (!userId || userId === 'undefined' || userId === 'null') {
    Toast(window.$t('pleaseLogin'));
    return api;
  }
  if (platform === 'android') {
    const imei = window.plus.storage.getItem('imei');
    const oaid = window.plus.storage.getItem('oaid');
    const androidosv = window.plus.storage.getItem('androidosv');
    api = 'https://h5.17xianwan.com/try/try_list_plus';
    p = {
      ptype: '2',
      androidosv: androidosv || 28,
      deviceid: imei || '',
      msaoaid: oaid || '',
      appid: '5395',
      appsign: userId,
      xwversion: 2,
    };
    const appsecret = 'lf6ycxkk9p4vajxe';
    const md5String = md5(`${p.appid}${p.deviceid}${p.msaoaid}${p.androidosv}${p.ptype}${p.appsign}${appsecret}`);
    p.keycode = md5String;
  } else if (platform === 'ios') {
    api = 'https://h5.17xianwan.com/try/iOS/try_list_ios';
    const idfa = window.plus.storage.getItem('idfa');
    console.info('idfa', idfa);
    p = {
      ptype: '1',
      deviceid: idfa,
      appid: '5526',
      appsign: userId,
      xwversion: 2,
    };
    const appsecret = 'tuhuwh4340rkirsn';
    const md5String = md5(`${p.appid}${p.deviceid}${p.ptype}${p.appsign}${appsecret}`);
    p.keycode = md5String;
  }
  api += `${qs.stringify(p, { addQueryPrefix: true })}`;
  console.info(api);
  return api;
};
