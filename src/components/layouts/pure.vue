<template>
  <div>
    <xg-header></xg-header>
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>

<script>
import XgHeader from '@/components/common/header';

export default {
  name: 'pure-layout',
  components: {
    XgHeader,
  },
};
</script>
