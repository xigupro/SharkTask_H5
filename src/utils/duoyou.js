import qs from 'qs';
import md5 from 'js-md5';
import { Toast } from 'vant';
import { judgeClient } from './tools';
import { getItem } from './storage';

// 判断是否是APP里
export const isAPP = () => navigator.userAgent.indexOf('Html5Plus') > -1;

// 获取多游广告地址
export const getDuoYouAD = async () => {
  let p = {};
  let api = '';
  const platform = judgeClient();
  const userId = getItem('id');
  if (!userId || userId === 'undefined' || userId === 'null') {
    Toast(window.$t('pleaseLogin'));
    return api;
  }
  api = 'https://h5.ads66.com/';
  let md5String = '';
  if (platform === 'android') {
    const imei = window.plus.storage.getItem('imei');
    const oaid = window.plus.storage.getItem('oaid');
    p = {
      media_id: 'dy_59634076',
      user_id: userId,
      device_ids: encodeURIComponent(JSON.stringify((oaid ? { 1: imei, 7: oaid } : { 1: imei }))),
      device_type: '2',
    };
    md5String = md5(`device_ids=${p.device_ids}&device_type=${p.device_type}&media_id=${p.media_id}&user_id=${p.user_id}&key=9ef2f1dd1c913d9057eb5b544b4512ef`);
  } else {
    const idfa = window.plus.storage.getItem('idfa');
    p = {
      device_ids: encodeURIComponent(JSON.stringify({ 4: idfa })),
      device_type: '1',
      media_id: 'dy_59634077',
      user_id: userId,
    };
    md5String = md5(`device_ids=${p.device_ids}&device_type=${p.device_type}&media_id=${p.media_id}&user_id=${p.user_id}&key=4745bef81ca46a035ac0998505f7f6f0`);
  }
  p.sign = md5String;
  api += `${qs.stringify(p, { addQueryPrefix: true })}`;
  // 不知为何上面encode了两次，qs.stringify加了encode为false也无效，只能暂时通过decode来解决
  api = decodeURIComponent(api);
  console.info(api);
  return api;
};
