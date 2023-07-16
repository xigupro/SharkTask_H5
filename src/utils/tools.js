import md5 from 'js-md5';

// 获取url参数
export const getUrlParam = key => decodeURIComponent((new RegExp(`[?|&]${key}=([^&;]+?)(&|#|;|$)`)
  .exec(window.location.href) || [0, ''])[1]
  .replace(/\+/g, '%20')) || null;

// 是否是微信
export const isWechat = () => {
  const result = window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i);
  if (result instanceof Array && result[0] === 'micromessenger') {
    return true;
  }
  return false;
};

// 判断是iOS还是Android
export const judgeClient = () => {
  let client = '';
  if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
    client = 'ios';
  } else if (/(Android)/i.test(navigator.userAgent)) {
    client = 'android';
  } else {
    client = 'web';
  }
  return client;
};

// 判断是否是APP里
export const isAPP = () => navigator.userAgent.indexOf('Html5Plus') > -1;

// 加密
export const encryptedData = (data) => {
  if (!data) {
    return '';
  }
  const result = md5(`${data}1ef072259c8d1b925c08a7639cab6367_shark_task_2019`);
  return result;
};

// 生成随机字符串
export const randomString = (len = 32) => {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const maxPos = chars.length;
  let str = '';
  let i = 0;
  while (i < len) {
    str += chars.charAt(Math.floor(Math.random() * maxPos));
    i += 1;
  }
  return str;
};

export const isEmpty = val => [null, undefined, '', 'undefined', 'null'].includes(val)
