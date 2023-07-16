<template>
  <div>
    <div class="xg-wrap">
      <tabbar v-if="$route.meta.withTabbar"></tabbar>
      <xg-header v-else></xg-header>
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive"></router-view>
    </div>
  </div>
</template>

<script>
/* ============
  * Default Layout
  * ============
  */
import Tabbar from '@/components/common/tabbar';
import XgHeader from '@/components/common/header';

export default {
  name: 'default-layout',
  components: {
    Tabbar,
    XgHeader,
  },
};
</script>
