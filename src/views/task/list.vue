<template>
  <div class="tasks-page">
    <div class="header">
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
    <div class="search">
      <van-search
        maxlength="15"
        @search="handleSearch"
        shape="round"
        placeholder="请输入关键词"
        v-model="keywords" />
    </div>
    <van-sticky>
      <van-tabs v-model="activeTypeIndex">
        <van-tab :id="0" title="全部"></van-tab>
        <van-tab
          :id="item.id"
          :title="item.name"
          v-for="(item, index) in types"
          :key="index">
        </van-tab>
      </van-tabs>
    </van-sticky>
    <van-list
      v-model="loading"
      :finished="finished"
      :finished-text="$t('noMore')"
      @load="loadTasks">
      <van-cell v-for="(item, index) in tasks" :key="index">
        <router-link :to="`/tasks/detail/${item.id}`" class="task-item shadow">
          <van-image width="45" height="45" :src="item.thumbnail | getQiniuFullUrl" />
          <div class="top" v-if="item.top_timeout > now">置顶</div>
          <div class="task-text">
            <div class="title">{{item.title}}</div>
            <div class="task-cost">
              已被领取{{item.grab_quantity}}份, 剩余
              <span class="red">{{item.quantity}}</span>份
            </div>
          </div>
          <div class="task-money">
            <div>
              +{{item.money}}元
            </div>
            <div class="distance" v-if="systemInfo.enable_location">
              {{Math.round((item.distance || 0) / 1000)}}km
            </div>
          </div>
        </router-link>
      </van-cell>
    </van-list>
  </div>
</template>
<script>
import {
  Tab,
  Tabs,
  List,
  Cell,
  Image,
  Search,
  Sticky,
  Icon,
} from 'vant';
import { loadAmap, loadPlugins } from '@amap/amap-vue';
import TasksProxy from '@/proxies/tasks';
import { judgeClient, isEmpty } from '@/utils/tools';

export default {
  name: 'task-list',
  data() {
    return {
      keywords: '',
      banners: [],
      types: [],
      activeTypeIndex: 0,
      tasks: [],
      finished: false,
      loading: false,
      pageIndex: 1,
      pageSize: 10,
      totalRecordCount: 0,
      autoLoad: false,
      now: new Date().getTime(),
      selectedLocation: {
        lng: null,
        lat: null,
        name: '',
      },
      locating: false,
    };
  },
  components: {
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [List.name]: List,
    [Cell.name]: Cell,
    [Image.name]: Image,
    [Search.name]: Search,
    [Sticky.name]: Sticky,
    [Icon.name]: Icon,
  },
  watch: {
    activeTypeIndex(val) {
      if (val >= 0) {
        this.pageIndex = 1;
        this.loadTasks();
      }
    },
  },
  computed: {
    systemInfo() {
      return this.$store.state.system.info;
    },
    isAPP() {
      return navigator.userAgent.indexOf('Html5Plus') > -1;
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
  activated() {
    if (this.systemInfo.enable_location) {
      this.getLocationInfo();
    }
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
                console.info('locationInfo', locationInfo)
                this.selectedLocation = {
                  name: locationInfo.name,
                  lng: locationInfo.location.lng,
                  lat: locationInfo.location.lat,
                }
                localStorage.setItem('selectedLocation.name', locationInfo.name)
                localStorage.setItem('selectedLocation.lng', locationInfo.location.lng)
                localStorage.setItem('selectedLocation.lat', locationInfo.location.lat)
                this.init();
              }
            })
          }
        });
        resolve();
      });
    },
    handleSearch() {
      this.tasks = [];
      this.finished = false;
      this.loading = true;
      this.pageIndex = 1;
      this.pageSize = 10;
      this.loadTasks();
    },
    async getTypes() {
      const res = await TasksProxy.getTypes();
      if (!res.fail) {
        const type = this.$route.query.id;
        res.data.forEach((item, index) => {
          if (Number(item.id) === Number(type)) {
            this.activeTypeIndex = index + 1;
          }
        });
        this.types = res.data;
      }
    },
    async loadTasks() {
      const params = {
        page: this.pageIndex,
        forReview: 0,
        client: this.clientType,
        title: this.keywords,
      };
      if (this.systemInfo.enable_location) {
        params.order = '6';
        params.lng = this.selectedLocation.lng;
        params.lat = this.selectedLocation.lat;
      }
      if (this.activeTypeIndex !== 0) {
        params.type = this.types[this.activeTypeIndex - 1].id;
      }
      this.loading = true;
      const res = await TasksProxy.getTasks(params);
      this.loading = false;
      if (!res.fail) {
        // 如果是获取第一页就清空整个列表TODO
        if (this.pageIndex === 1) {
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
    async init() {
      await this.getTypes();
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
    this.autoLoad = true;
  },
};
</script>

<style lang="less">
  .tasks-page {
    padding-bottom: 60px;
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
    }
    .all-type {
      width: 100vw;
      overflow-y: scroll;
      padding: 10px 0;
      li {
        width: 20%;
        text-align: center;
        padding: 10px 0;
        display: inline-block;
      }
    }
    .mint-tab-item-label {
      font-size: 16px;
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
      color: #666;
      font-size: 12px;
    }
    .task-money {
      font-size: 16px;
      color: #F56C6C;
      .distance {
        font-size: 12px;
        color: #888;
        text-align: right;
      }
    }
    .task-time {
      color: #bbb;
    }
    .task-todo {
      color: red;
    }
    .top {
      position: absolute;
      left: 0;
      bottom: 0;
      line-height: 14px;
      width: 35px;
      font-size: 12px;
      color: #fff;
      background-color: rgba(245, 107, 107, .8);
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      text-align: center;
      padding: 0 5px;
    }
  }
</style>
