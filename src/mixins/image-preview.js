/**
 * APP图片预览和下载
 */
import {
  ImagePreview,
} from 'vant';
import { getQiniuFullUrl } from '@/filters';

export default {
  data() {
    return {
      accessVideo: ['.mp4', '.rmvb', '.mpeg', '.avi', '.3gp', '.mov'],
    };
  },
  methods: {
    isVideo(item) {
      const image = item.split('.');
      return image.length > 1 && this.accessVideo.includes(`.${image[image.length - 1]}`);
    },
    saveImage(imageUrl) {
      const now = new Date().getTime();
      const dtask = window.plus.downloader.createDownload(
        imageUrl,
        {
          method: 'GET',
          filename: `_downloads/image${now}.jpg`,
        },
        (d, status) => {
          // 下载完成
          if (status === 200) {
            window.plus.gallery.save(d.filename, () => {
              window.plus.nativeUI.toast('保存成功');
            }, (err) => {
              window.plus.nativeUI.toast(`保存失败:${JSON.stringify(err)}`);
            });
          } else {
            window.plus.nativeUI.toast('下载失败');
          }
        },
      );
      dtask.start();
    },
    previewVideo(image) {
      const url = getQiniuFullUrl(image);
      if (this.$tools.isAPP()) {
        window.plus.video.createVideoPlayer('video', {
          src: url,
        });
      }
    },
    previewImages(images, index) {
      if (this.$tools.isAPP()) {
        window.plus.nativeUI.previewImage(images, {
          current: index,
          onLongPress: (e) => {
            const bts = [
              { title: '保存' },
            ];
            window.plus.nativeUI.actionSheet(
              {
                cancel: '取消',
                buttons: bts,
              },
              (target) => {
                switch (target.index) {
                  case 1:
                    this.saveImage(e.url);
                    break;
                  default:
                    console.info(target);
                    break;
                }
              },
            );
          },
        });
      } else {
        ImagePreview({
          images: images,
          startPosition: index,
        });
      }
    },
  },
};
