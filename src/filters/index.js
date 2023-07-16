import moment from 'moment';
import avatar from '@/assets/images/avatar.png';

export function filterBlank(val) {
  if (val === undefined || val === null || val === 'null' || val === '') {
    return '-';
  }
  return val;
}

export function fixNumber(val) {
  if (val === undefined || val === null || val === 'null' || val === '') {
    return 0;
  }
  return val;
}

export function transDate(val) {
  if (!val) {
    return '-';
  }
  const arr = val.split(' ');
  if (arr.length > 0) {
    return arr[0];
  }

  return '-';
}

export function transLocalTime(val) {
  if (!val) {
    return '';
  }
  return moment(+val).format('YYYY/MM/DD HH:mm');
}

export function toLocaleDateString(val) {
  if (!val) {
    return '';
  }
  return new Date(+val).toLocaleDateString();
}

/**
 * 1进行中，跳到提交审核页面
 * 2审核中，跳到审核详情页面
 * 3已完成，跳到任务详情页面
 * 4已过期，跳到任务详情页面
 * 5审核失败，跳到审核详情页面
 * @param {*} activeStatus
 * @param {*} item
 */
export function taskListUrl(activeStatus, item) {
  let url = '';
  const params = `?userTaskId=${item.id}&taskId=${item.task_id}&reviewId=${item.review_id}`;
  if (item.review_id && item.deleted) {
    // 如果已提交审核且已取消，则跳转到审核详情
    return `/review/detail${params}`;
  }
  const status = +activeStatus;
  switch (status) {
    case 2:
      url = '/review/detail';
      break;
    case 3:
      url = '/review/detail';
      break;
    case 5:
      url = '/review/detail';
      break;
    default:
      url = `/task/detail/${item.task_id}`;
      break;
  }
  url += params;
  return url;
}

export function getQiniuFullUrl(val) {
  if (!val || val === 'undefined') {
    return '';
  }
  if (/^(http|https):\/\/.+/.test(val)) {
    return val;
  }
  return window.API_CONFIG['qiniu_download'] + val;
}

// 拼接头像完整路径
export function getAvatarUrl(value) {
  if (!value) {
    return avatar;
  } else if (/^(http|https):\/\/.+$/.test(value)) {
    return value;
  }
  return window.API_CONFIG['qiniu_download'] + value;
}

/**
 * 保留小数
 * @param {String} number
 */
export function mathFixed(number, count) {
  return number.toFixed(count || 0);
}

// 分钟转换成天时分秒
export function formatDuring(min) {
  const mss = min * 60 * 1000;
  const days = parseInt(mss / (1000 * 60 * 60 * 24), 10);
  const hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60), 10);
  const minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60), 10);
  const seconds = (mss % (1000 * 60)) / 1000;
  let text = '';
  if (days) {
    text += `${days}天`;
  }
  if (hours) {
    text += `${hours}小时`;
  }
  if (minutes) {
    text += `${minutes}分钟`;
  }
  if (seconds) {
    text += `${seconds}秒`;
  }
  return text;
}

export function hideString(str) {
  if (!str || str.length < 3) {
    return str;
  }
  const replaceString = str.substring(str.length - 2, str.length);
  return str.replace(replaceString, '*');
}
