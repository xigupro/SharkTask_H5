<template>
  <div class="home-page">
    <div class="full-overlay"
      v-if="isAPP && !isReadAgreement && !showAgreement"
      @click="showAgreement = true"></div>
    <div class="download" v-if="showDownload">
      <div>{{$t('downloadTips')}}</div>
      <a class="button" @click="download" :download="$t('title')">{{$t('download')}}</a>
    </div>
    <div class="header">
      <div class="logo">
        <img src="../../assets/images/logo.png" />
      </div>
      <div class="location" v-if="systemInfo.enable_location" @click="handleMapSelectClicked">
        <van-icon name="location-o" />
        <div class="location-name" v-if="selectedLocation.name">
          {{selectedLocation.name}}
        </div>
        <div class="location-name" v-else>
          {{locating ? '定位中': '无法获取位置'}}
        </div>
        <van-icon name="arrow" />
      </div>
    </div>
    <van-pull-refresh
      v-model="isRefresh"
      :success-text="$t('reloadSuccess')"
      @refresh="onRefresh">
      <van-swipe class="swiper" :autoplay="4000">
        <van-swipe-item v-for="(item, index) in banners" :key="index">
          <div @click="handleEntryClick(item.url)">
            <img :src="item.image | getQiniuFullUrl">
          </div>
        </van-swipe-item>
      </van-swipe>
      <van-notice-bar
        v-if="noticeList && noticeList.length"
        left-icon="volume-o"
        :scrollable="noticeList.length === 1">
        <van-swipe
          vertical
          class="notice-swipe"
          :autoplay="3000"
          :show-indicators="false">
          <van-swipe-item
            v-for="item in noticeList"
            @click="toNoticeDetail(item.id)"
            :key="item.id">{{item.title}}</van-swipe-item>
        </van-swipe>
      </van-notice-bar>
      <entry :entries="entries" />
      <van-swipe class="sub-swiper" v-if="subBannerList && subBannerList.length" :autoplay="4000">
        <van-swipe-item v-for="(item, index) in subBannerList" :key="index">
          <div @click="handleEntryClick(item.url)">
            <img :src="item.image | getQiniuFullUrl">
          </div>
        </van-swipe-item>
      </van-swipe>
      <van-tabs v-model="activeTypeIndex">
        <van-tab
          :id="item.id"
          :title="item.value"
          v-for="(item, index) in types"
          :key="index">
        </van-tab>
      </van-tabs>
      <van-list
        v-model="loading"
        :finished="finished"
        :finished-text="$t('noMore')"
        :immediate-check="false"
        @load="loadTasks">
        <van-cell v-for="(item, index) in tasks" :key="index">
          <router-link :to="`/home/task-detail/${item.id}`" class="task-item shadow">
            <van-image width="45" height="45" :src="item.thumbnail | getQiniuFullUrl" />
            <div class="task-text">
              <div class="title">{{item.title}}</div>
              <div class="task-cost">
                {{$t('taskListSubTitle', { grabQuantity: item.grabQuantity })}}, {{$t('surplus')}}
                <span class="red">{{item.quantity}}</span>{{$t('portion')}}
              </div>
            </div>
            <div class="task-money">+{{item.money}}{{$t('currencyName')}}</div>
          </router-link>
        </van-cell>
      </van-list>
    </van-pull-refresh>
    <van-overlay class-name="director" :show="showOverlay" @click="showOverlay = false">
      <img src="../../assets/images/director.png" />
    </van-overlay>
    <van-dialog
      v-model="showAgreement"
      :title="$t('privacyPolicyAndServiceAgreement')"
      :cancel-button-text="$t('doNotUse')"
      @confirm="handleAgreementConfirm"
      @cancel="handleAgreementCancel"
      :confirm-button-text="$t('agree')"
      show-cancel-button>
      <div class="agreement-content">
      {{$t('privacyPolicyAndServiceAgreementTips')}}
      {{$t('youCanRead')}}<router-link :to="{name: 'about.agreement'}">
        {{$t('serviceAgreement')}}
      </router-link>
      {{$t('and')}}<router-link :to="{name: 'about.policy'}">{{$t('privacyPolicy')}}</router-link>
      {{$t('privacyPolicyAndServiceAgreementTipsMore')}}
      </div>
    </van-dialog>
  </div>
</template>
<script>
import {
  Tab,
  Tabs,
  NoticeBar,
  Swipe,
  SwipeItem,
  List,
  Cell,
  Image,
  Overlay,
  PullRefresh,
  Icon,
  Dialog,
} from 'vant';
import { loadAmap, loadPlugins } from '@amap/amap-vue';
import Entry from '@/components/business/entry';
import BannersProxy from '@/proxies/banners';
import EntriesProxy from '@/proxies/entries';
import TasksProxy from '@/proxies/tasks';
import MessagesProxy from '@/proxies/messages';
import AuthProxy from '@/proxies/auth';
import EntryMixin from '@/mixins/entry';
import { judgeClient, isEmpty } from '@/utils/tools';

export default {
  data() {
    return {
      banners: [],
      subBannerList: [],
      entries: [],
      noticeList: [],
      tasks: [],
      activeTypeIndex: 0,
      finished: false,
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      totalRecordCount: 0,
      showOverlay: false,
      isRefresh: false,
      version: 0,
      showAgreement: false,
      isReadAgreement: false,
      selectedLocation: {
        lng: null,
        lat: null,
        name: '',
      },
      locating: false,
    };
  },
  mixins: [EntryMixin],
  components: {
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [NoticeBar.name]: NoticeBar,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [List.name]: List,
    [Cell.name]: Cell,
    [Image.name]: Image,
    [Overlay.name]: Overlay,
    [PullRefresh.name]: PullRefresh,
    [Icon.name]: Icon,
    [Dialog.Component.name]: Dialog.Component,
    Entry,
  },
  activated() {
    if (this.systemInfo.enable_location) {
      this.getLocationInfo();
    }
  },
  watch: {
    activeTypeIndex() {
      this.pageIndex = 1;
      this.loadTasks();
    },
    types() {
      this.pageIndex = 1;
      this.loadTasks();
    },
    '$store.state.system.info.app_version'(latestVersion) {
      const {
        app_version_name: appVersionName,
        app_update_description: appUpdateDescription,
        app_update_rule: appUpdateRule,
      } = this.$store.state.system.info;
      if (this.isAPP) {
        // 判断更新
        const version = window.plus.storage.getItem('version');
        if (version) {
          // 如果有版本号，且和当前版本号不同，则提示更新
          if (Number(version) !== latestVersion) {
            Dialog.confirm({
              title: `${this.$t('newVersion')}${appVersionName}`,
              message: appUpdateDescription,
              confirmButtonText: this.$t('update'),
              showCancelButton: !appUpdateRule, // 非强制更新
            }).then(() => {
              window.plus.storage.setItem('version', `${latestVersion}`);
              window.plus.cache.clear(() => {
                this.$toast(this.$t('updateSuccess'));
                setTimeout(() => {
                  window.plus.runtime.restart();
                }, 800);
              });
            });
          }
        } else {
          // 首次启动
          window.plus.storage.setItem('version', `${latestVersion}`);
        }
      }
    },
  },
  computed: {
    downloadUrl() {
      const platform = judgeClient();
      if (platform === 'ios') {
        return this.systemInfo.ios_download_url;
      } else if (platform === 'android') {
        return this.systemInfo.android_download_url;
      }
      return '';
    },
    isAPP() {
      return navigator.userAgent.indexOf('Html5Plus') > -1;
    },
    // 如果不在APP里打开，则显示下载栏
    showDownload() {
      return navigator.userAgent.indexOf('Html5Plus') < 0 && this.downloadUrl;
    },
    types() {
      let taskFilter = [
        { id: 1, value: this.$t('recommend'), show: this.systemInfo.show_recommend },
        { id: 2, value: this.$t('highPrice'), show: this.systemInfo.show_high },
        { id: 3, value: this.$t('simple'), show: this.systemInfo.show_simple },
      ];
      taskFilter = taskFilter.filter(item => item.show);
      return taskFilter;
    },
    systemInfo() {
      return this.$store.state.system.info;
    },
    session() {
      return this.$storage.getItem('session');
    },
    clientType() {
      const platform = judgeClient();
      let type = 2;
      if (this.isAPP) {
        switch (platform) {
          case 'ios':
            type = 4;
            break;
          case 'android':
            type = 3;
            break;
          default:
            console.info(platform);
            break;
        }
      }
      return type;
    },
  },
  methods: {
    handleMapSelectClicked() {
      localStorage.setItem('mapSelectRedirectUrl', this.$route.fullPath)
      this.$router.push({
        name: 'amap.select',
      })
    },
    getLocationInfo() {
      const name = localStorage.getItem('selectedLocation.name')
      const lng = localStorage.getItem('selectedLocation.lng')
      const lat = localStorage.getItem('selectedLocation.lat')
      this.selectedLocation = {
        name: isEmpty(name) ? '' : name,
        lng: isEmpty(lng) ? null : lng,
        lat: isEmpty(lat) ? null : lat,
      }
    },
    initLocationInfo() {
      this.locating = true;
      this.$ready = new Promise(async (resolve) => {
        const AMap = await loadAmap();
        await loadPlugins(['AMap.PlaceSearch', 'AMap.Geolocation']);
        this.ps = new AMap.PlaceSearch({
          pageSize: this.pageSize,
        });
        this.geo = new AMap.Geolocation({
          enableHighAccuracy: true, // 是否使用高精度定位，默认:true
          timeout: 10000, // 超过10秒后停止定位，默认：5s
          position: 'RB', // 定位按钮的停靠位置
          offset: [10, 20], // 定位按钮与设置的停靠位置的偏移量，默认：[10, 20]
          zoomToAccuracy: true, // 定位成功后是否自动调整地图视野到定位点
        })
        this.geo.getCurrentPosition((status, result) => {
          if (status === 'complete') {
            this.center = [result.position.lng, result.position.lat]
            this.position = [result.position.lng, result.position.lat];
            this.ps.searchNearBy('', this.position, 2000, (status2, result2) => {
              this.locating = false;
              if (status2 === 'complete' && result2.poiList) {
                const locationInfo = result2.poiList.pois[0];
                this.selectedLocation = {
                  name: locationInfo.name,
                  lng: locationInfo.location.lng,
                  lat: locationInfo.location.lat,
                }
                localStorage.setItem('selectedLocation.name', locationInfo.name)
                localStorage.setItem('selectedLocation.lng', locationInfo.location.lng)
                localStorage.setItem('selectedLocation.lat', locationInfo.location.lat)
              }
            })
          }
        });
        resolve();
      });
    },
    toNoticeDetail(id) {
      this.$router.push({
        name: 'message.detail',
        params: {
          id,
        },
        query: {
          type: 1,
        },
      });
    },
    getReadAgreementStatus() {
      const isRead = this.$storage.getItem('isReadAgreement');
      this.isReadAgreement = isRead && isRead !== 'undefined' && isRead !== 'null';
    },
    handleAgreementConfirm() {
      this.isReadAgreement = true;
      this.$storage.setItem('isReadAgreement', true);
    },
    handleAgreementCancel() {
      this.showAgreement = false;
    },
    onRefresh() {
      this.tasks = [];
      this.finished = false;
      this.loading = false;
      this.pageIndex = 1;
      this.totalRecordCount = 0;
      this.isRefresh = true;
      this.init();
      setTimeout(() => {
        this.isRefresh = false;
      }, 800);
    },
    download() {
      if (this.$tools.isWechat()) {
        this.showOverlay = true;
      } else if (this.showDownload) {
        window.location.href = this.downloadUrl;
      }
    },
    // 公众号网页微信登录
    async wechatLogin(form) {
      const params = {
        ...form,
      };
      const res = await AuthProxy.wechatLogin(params);
      setTimeout(() => {
        this.loading = false;
      }, 500);
      if (!res.fail) {
        this.$store.dispatch('auth/login', res.data);
        this.$store.dispatch('account/find', {
          openid: res.data.openid,
          unionid: res.data.unionid,
        });
      } else {
        this.$toast(this.$t('authFailed'));
      }
    },
    // 根据已有的账号绑定公众号微信，并登录
    async bindOfficialAccount(code, userId) {
      const params = {
        code,
        clientType: 3,
        userId,
      };
      const res = await AuthProxy.bindOfficialAccount(params);
      if (res.success) {
        this.$toast(this.$t('bindSuccess'));
        this.$store.dispatch('auth/login', res.data);
        this.$store.dispatch('account/find', {
          userId: res.data.id,
        });
      }
    },
    async getBanners() {
      this.banners = [];
      const params = {
        client: this.clientType,
      };
      const res = await BannersProxy.getBanners(params);
      if (!res.fail) {
        this.banners = res.data.filter(item => item.type === 1);
        this.subBannerList = res.data.filter(item => item.type === 2);
      }
    },
    async getEntries() {
      this.entries = [];
      const params = {
        client: this.clientType,
        type: 1,
      };
      const res = await EntriesProxy.list(params);
      if (!res.fail) {
        this.entries = res.data.filter(item => item.is_show);
      }
    },
    async getNoticeList() {
      const res = await MessagesProxy.getNoticeList();
      if (!res.fail) {
        this.noticeList = res.data.list;
      }
    },
    async loadTasks() {
      if (!this.types.length) {
        return;
      }
      const activeType = this.types[this.activeTypeIndex].id;
      const params = {
        page: this.pageIndex,
        forReview: 0,
        client: this.clientType,
        recommend: activeType === 1 ? 1 : 0,
      };
      if (params.recommend === 0) {
        // 如果选的不是推荐，则添加其他排序规则参数
        params.order = activeType;
      }
      this.loading = true;
      const res = await TasksProxy.getTasks(params);
      setTimeout(() => {
        this.loading = false;
      }, 800);
      if (!res.fail) {
        // 如果是获取第一页就清空整个列表TODO
        if (res.data.page === 1) {
          this.tasks = [];
        }
        this.pageIndex += 1;
        this.tasks = this.tasks.concat(res.data.list);
        this.totalRecordCount = res.data.totalCount;
        // 无数据
        if (this.tasks.length === this.totalRecordCount || !res.data.list.length) {
          this.finished = true;
        } else if (this.tasks.length < this.totalRecordCount) {
        // 还有数据
          this.finished = false;
        }
      }
    },
    init() {
      this.getBanners();
      this.getEntries();
      this.getNoticeList();
      this.loadTasks();
      const code = this.$tools.getUrlParam('code');
      const userId = this.$storage.getItem('id');
      const wechatAuthFrom = this.$storage.getItem('wechatAuthFrom');
      if (code && this.$tools.isWechat()) {
        if (wechatAuthFrom && wechatAuthFrom !== 'undefined' && wechatAuthFrom !== 'null') {
          switch (Number(wechatAuthFrom)) {
            case 1:
              // 登录
              if (!this.session || this.session === 'null' || this.session === 'undefined') {
                const data = {
                  code,
                };
                this.wechatLogin(data);
              }
              break;
            case 2:
              // 充值
              this.$router.push({
                name: 'recharge.index',
                query: {
                  code,
                },
              });
              break;
            case 3:
              // 开通会员
              break;
            case 4:
              // 公众号绑定微信
              this.bindOfficialAccount(code, userId);
              break;
            default:
              console.info(wechatAuthFrom);
              break;
          }
        }
      }
    },
  },
  created() {
    if (this.systemInfo.enable_location) {
      this.getLocationInfo();
      if (!this.selectedLocation.lng) {
        this.initLocationInfo();
      } else {
        this.init();
      }
    } else {
      this.init();
    }
  },
  mounted() {
    if (this.isAPP) {
      this.getReadAgreementStatus();
      this.showAgreement = !this.isReadAgreement;
      const wv = window.plus.webview.currentWebview();
      // 关闭侧滑返回功能
      wv.setStyle({
        popGesture: 'none',
      });
      // 获取安卓OAID
      const platform = judgeClient();
      if (platform === 'android') {
        window.plus.device.getOAID({
          success: (e) => {
            console.log(`getOAID success: ${JSON.stringify(e)}`);
            const { oaid } = e;
            if (oaid) {
              window.plus.storage.setItem('oaid', oaid);
            }
          },
          fail: (e) => {
            console.log(`getOAID failed: ${JSON.stringify(e)}`);
          },
        });
      }
    }
  },
};
</script>

<style lang="less">
  .home-page {
    padding-bottom: 60px;
    .notice-swipe {
      height: 40px;
      line-height: 40px;
    }
    .full-overlay {
      position: fixed;
      z-index: 9999999999;
      width: 100%;
      height: 100vh;
    }
    .agreement-content {
      padding: 10px;
      font-size: 13px;
      line-height: 16px;
      color: #666;
      a {
        color: #619FFF!important;
      }
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px;
      background-color: #fff;
      color: #666;
      .location {
        display: flex;
        align-items: center;
        .location-name {
          max-width: 50vw;
          overflow: hidden;
          text-overflow: ellipsis;
          display:-webkit-box; //作为弹性伸缩盒子模型显示。
          -webkit-box-orient:vertical; //设置伸缩盒子的子元素排列方式--从上到下垂直排列
          -webkit-line-clamp:1; //显示的行
        }
      }
      .logo {
        font-size: 16px;
        font-style: italic;
        font-weight: bold;
        img {
          height: 18px;
        }
      }
      .sign {
        display: flex;
        align-items: center;
        color: #2d8cf0;
        font-size: 16px;
      }
    }
    .director {
      background-color: rgba(255, 255, 255, 0.8);
      img {
        width: 100%;
      }
    }
    .download {
      display: flex;
      justify-content: space-between;
      line-height: 40px;
      padding-left: 10px;
      background: #fff;
      .button {
        color: #fff!important;
        padding: 0 10px;
        background-color: #2d8cf0;
      }
    }
    .van-notice-bar {
      height: 30px;
    }
    .inline-title {
      margin: 10px 0;
      font-size: 14px;
      border-left: 4px solid #2cbdfb;
      color: #303133;
      padding-left: 5px;
    }
    .mint-tab-item-label {
      font-size: 16px;
    }
    .swiper {
      img {
        width: 100%;
        object-fit: cover;
        height: 100%;
      }
    }
    .sub-swiper {
      background-color: #fff;
      margin: 1px 0;
      img {
        width: 100%;
        object-fit: cover;
        height: 100%;
      }
    }
    .recommend {
      margin: 10px;
    }
    .task-list {
      margin: 0;
      padding: 0 10px;
    }
    .task-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      .van-image, .task-money {
        flex-shrink: 0;
      }
      img {
        border-radius: 5px;
      }
    }
    .task-text {
      flex-grow: 1;
      margin-left: 10px;
      font-size: 16px;
      .title {
        overflow : hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
    }
    .task-cost {
      color: #888;
      font-size: 12px;
    }
    .task-money {
      font-size: 16px;
      color: #F56C6C;
    }
    .task-time {
      color: #bbb;
    }
    .red {
      color: #F56C6C;
    }
  }
</style>
